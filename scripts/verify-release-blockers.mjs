import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const appUrl = process.env.APP_URL ?? "http://localhost:3000/about";
const chromePath = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = Number(process.env.CDP_PORT ?? 9333);
const profile = await mkdtemp(join(tmpdir(), "portfolio-release-check-"));
const chrome = spawn(chromePath, [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--disable-default-apps",
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForChrome() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {}
    await sleep(100);
  }
  throw new Error("Chrome DevTools endpoint did not become ready");
}

async function newPage() {
  const response = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, {
    method: "PUT",
  });
  assert.equal(response.ok, true, "could not create Chrome page");
  const target = await response.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id) return;
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });

  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    pending.set(requestId, { resolve, reject });
    socket.send(JSON.stringify({ id: requestId, method, params }));
  });

  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };

  return { send, evaluate, close: () => socket.close() };
}

try {
  await waitForChrome();
  const page = await newPage();
  const widthEvidence = [];
  await page.send("Page.enable");

  for (const width of [320, 375]) {
    await page.send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await page.send("Emulation.setEmulatedMedia", { features: [] });
    await page.send("Page.navigate", { url: appUrl });
    await sleep(700);

    const geometry = await page.evaluate(`(() => {
      const rect = (element) => {
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right, width: box.width, height: box.height };
      };
      const controls = [
        ...document.querySelectorAll('header a, [aria-label="Currently on repeat"] button, [aria-label="Currently on repeat"] input'),
      ];
      return {
        innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        headerLinks: [...document.querySelectorAll('header a')].map((element) => ({
          label: element.textContent.trim(),
          ...rect(element),
        })),
        controls: controls.map((element) => ({
          label: element.getAttribute('aria-label') || element.textContent.trim(),
          ...rect(element),
        })),
      };
    })()`);

    assert.ok(
      geometry.scrollWidth <= geometry.innerWidth,
      `${width}px document overflows: scrollWidth ${geometry.scrollWidth}`,
    );
    for (const link of geometry.headerLinks) {
      assert.ok(link.width > 0 && link.height > 0, `${width}px header link ${link.label} is hidden`);
      assert.ok(link.left >= 0 && link.right <= width, `${width}px header link ${link.label} is clipped`);
    }
    for (const control of geometry.controls) {
      assert.ok(control.left >= 0 && control.right <= width, `${width}px control ${control.label} is clipped`);
    }
    widthEvidence.push({
      width,
      scrollWidth: geometry.scrollWidth,
      headerLinks: geometry.headerLinks.map(({ label, left, right }) => ({ label, left, right })),
      playerControls: geometry.controls
        .filter(({ label }) => ["Play", "Pause", "Seek", "Mute", "Unmute", "Volume"].includes(label))
        .map(({ label, left, right }) => ({ label, left, right })),
    });
  }

  await page.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab" });
  await page.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab" });
  const seekFocus = await page.evaluate(`(() => {
    const seek = document.querySelector('input[aria-label="Seek"]');
    if (!seek) return null;
    seek.focus();
    return {
      focused: document.activeElement === seek,
      disabled: seek.disabled,
      tabIndex: seek.tabIndex,
    };
  })()`);
  assert.ok(seekFocus, "seek range is missing");
  assert.equal(seekFocus.disabled, false, "seek range is disabled");
  assert.ok(seekFocus.tabIndex >= 0, "seek range is not keyboard-focusable");
  assert.equal(seekFocus.focused, true, "seek range did not accept focus");
  const focusStyle = await page.evaluate(`(() => {
    const style = getComputedStyle(document.activeElement);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
  })()`);
  assert.ok(
    (focusStyle.outlineStyle !== "none" && focusStyle.outlineWidth !== "0px") || focusStyle.boxShadow !== "none",
    "focused range has no visible focus treatment",
  );

  const pauseButton = await page.evaluate(`(async () => {
    const button = document.querySelector('button[aria-label="Pause photo carousel"]');
    if (!button) return null;
    button.click();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    return button.getAttribute('aria-label');
  })()`);
  assert.equal(pauseButton, "Play photo carousel", "carousel pause control is missing or mislabeled after pausing");
  const pausedIndex = await page.evaluate(`document.querySelector('[aria-pressed="true"]')?.getAttribute('aria-label')`);
  await sleep(5700);
  assert.equal(
    await page.evaluate(`document.querySelector('[aria-pressed="true"]')?.getAttribute('aria-label')`),
    pausedIndex,
    "paused carousel auto-advanced",
  );

  await page.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await page.send("Page.navigate", { url: appUrl });
  await sleep(700);
  const reducedBefore = await page.evaluate(`(() => ({
    active: document.querySelector('[aria-pressed="true"]')?.getAttribute('aria-label'),
    duration: getComputedStyle(document.querySelector('[aria-label^="View photo"] > span')).transitionDuration,
    buttonLabel: document.querySelector('button[aria-label$="photo carousel"]')?.getAttribute('aria-label'),
  }))()`);
  await sleep(5700);
  const reducedAfter = await page.evaluate(`document.querySelector('[aria-pressed="true"]')?.getAttribute('aria-label')`);
  assert.equal(reducedAfter, reducedBefore.active, "reduced-motion carousel auto-advanced");
  assert.equal(reducedBefore.duration, "0s", "reduced-motion carousel still crossfades");
  assert.equal(reducedBefore.buttonLabel, "Play photo carousel", "reduced-motion carousel is not initially paused");

  await page.send("Emulation.setEmulatedMedia", { features: [] });
  await page.send("Page.navigate", { url: appUrl });
  await sleep(700);
  const playState = await page.evaluate(`(async () => {
    HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('blocked', 'NotAllowedError'));
    const button = document.querySelector('[aria-label="Play"]');
    button.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    return button.getAttribute('aria-label');
  })()`);
  assert.equal(playState, "Play", "rejected audio.play() left player in playing state");

  page.close();
  console.log("Release-blocker browser checks passed.");
  console.log(JSON.stringify({
    widths: widthEvidence,
    rangeFocus: focusStyle,
    pausedCarouselStayedOn: pausedIndex,
    reducedMotion: reducedBefore,
    rejectedAudioPlayLabel: playState,
  }, null, 2));
} finally {
  chrome.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => chrome.once("exit", resolve)),
    sleep(2000),
  ]);
  await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
