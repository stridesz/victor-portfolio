import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const appUrl = process.env.APP_URL ?? "http://localhost:3000/";
const chromePath = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = Number(process.env.CDP_PORT ?? 9334);
const profile = await mkdtemp(join(tmpdir(), "portfolio-smooth-scroll-check-"));
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
  const exceptions = [];
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === "Runtime.exceptionThrown") {
      exceptions.push(
        message.params.exceptionDetails.exception?.description
          ?? message.params.exceptionDetails.text,
      );
      return;
    }
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
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    }
    return result.result.value;
  };

  return { send, evaluate, exceptions, close: () => socket.close() };
}

async function navigate(page, reducedMotion) {
  await page.send("Emulation.setEmulatedMedia", {
    features: reducedMotion
      ? [{ name: "prefers-reduced-motion", value: "reduce" }]
      : [],
  });
  await page.send("Page.navigate", { url: appUrl });
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (await page.evaluate(`document.readyState === 'complete' && Boolean(document.querySelector('a[href="#12-pell"]'))`)) {
      await sleep(250);
      return;
    }
    await sleep(100);
  }
  throw new Error("portfolio index did not become ready");
}

async function clickAnchor(page, href) {
  const point = await page.evaluate(`(() => {
    scrollTo(0, 0);
    const anchor = document.querySelector(${JSON.stringify(`a[href="${href}"]`)});
    if (!anchor) return null;
    const rect = anchor.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  assert.ok(point, `missing anchor ${href}`);
  await page.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: point.x,
    y: point.y,
    button: "left",
    clickCount: 1,
  });
  await page.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: point.x,
    y: point.y,
    button: "left",
    clickCount: 1,
  });
}

try {
  await waitForChrome();
  const page = await newPage();
  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });

  await navigate(page, false);
  const anchorTargets = await page.evaluate(`(() =>
    [...document.querySelectorAll('section[aria-label="Index"] a[href^="#"]')].map((anchor) => {
      const href = anchor.getAttribute('href');
      let target = null;
      try {
        target = document.getElementById(decodeURIComponent(href.slice(1)));
      } catch {}
      return { href, label: anchor.textContent.trim(), resolves: Boolean(target) };
    })
  )()`);
  const exceptionStart = page.exceptions.length;
  await clickAnchor(page, "#12-pell");
  const smoothSamples = [];
  for (const delay of [0, 80, 250, 1200]) {
    if (delay) await sleep(delay);
    smoothSamples.push(await page.evaluate(`({ delay: ${delay}, scrollY, hash: location.hash })`));
  }
  const smoothExceptions = page.exceptions.slice(exceptionStart);

  await navigate(page, true);
  const reducedExceptionStart = page.exceptions.length;
  await clickAnchor(page, "#12-pell");
  const reducedImmediate = await page.evaluate(`({ scrollY, hash: location.hash })`);
  await sleep(150);
  const reducedLater = await page.evaluate(`({ scrollY, hash: location.hash })`);
  const reducedExceptions = page.exceptions.slice(reducedExceptionStart);

  const evidence = {
    anchorTargets,
    smoothMotion: { samples: smoothSamples, exceptions: smoothExceptions },
    reducedMotion: { immediate: reducedImmediate, later: reducedLater, exceptions: reducedExceptions },
  };
  console.log("Smooth-scroll browser evidence:");
  console.log(JSON.stringify(evidence, null, 2));

  assert.ok(anchorTargets.length > 0, "project index has no anchor links");
  assert.deepEqual(
    anchorTargets.filter(({ resolves }) => !resolves),
    [],
    "one or more project anchor links do not resolve by decoded ID",
  );
  assert.deepEqual(smoothExceptions, [], "12 Pell smooth-scroll click threw in the browser");
  assert.equal(smoothSamples[0].hash, "", "12 Pell click fell through to a native hash jump");
  assert.ok(smoothSamples[1].scrollY > smoothSamples[0].scrollY, "12 Pell smooth scroll did not begin progressively");
  assert.ok(smoothSamples[1].scrollY < reducedImmediate.scrollY - 50, "12 Pell jumped to its destination instead of scrolling progressively");
  assert.ok(
    Math.abs(smoothSamples.at(-1).scrollY - reducedImmediate.scrollY) < 40,
    "12 Pell smooth scroll did not reach the native anchor destination",
  );

  assert.deepEqual(reducedExceptions, [], "reduced-motion 12 Pell click threw in the browser");
  assert.equal(reducedImmediate.hash, "#12-pell", "reduced motion did not retain native anchor behavior");
  assert.ok(reducedImmediate.scrollY > 0, "reduced-motion native anchor did not jump to 12 Pell");
  assert.ok(
    Math.abs(reducedLater.scrollY - reducedImmediate.scrollY) < 2,
    "reduced-motion anchor continued animating instead of jumping natively",
  );

  page.close();
  console.log("Smooth-scroll anchor browser checks passed.");
} finally {
  chrome.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => chrome.once("exit", resolve)),
    sleep(2000),
  ]);
  await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
