import { expect, test, type Locator, type Page } from "@playwright/test";

type DinoSnapshot = {
  state: "idle" | "running" | "game-over";
  score: number;
  frameCount: number;
  paintCount: number;
  dinoY: number;
  obstaclesCleared: number;
};

type DinoCanvas = HTMLCanvasElement & {
  __getDinoSnapshot?: () => DinoSnapshot;
};

async function readGame(canvas: Locator) {
  return canvas.evaluate((element) => {
    const getSnapshot = (element as DinoCanvas).__getDinoSnapshot;
    if (!getSnapshot) throw new Error("Dino snapshot reader is not installed");
    return getSnapshot();
  });
}

async function dispatchKeyAndReadGame(
  canvas: Locator,
  code: "Space" | "ArrowUp",
  pauseImmediately = false,
) {
  return canvas.evaluate((element, { code, pauseImmediately }) => {
    const dinoCanvas = element as DinoCanvas;
    if (document.activeElement !== dinoCanvas) {
      throw new Error("Dino canvas must be focused before keyboard input");
    }
    if (pauseImmediately) {
      let hidden = false;
      Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
      (window as unknown as Window & { setDinoVisibility?: (value: boolean) => void }).setDinoVisibility = (value) => {
        hidden = value;
        document.dispatchEvent(new Event("visibilitychange"));
      };
    }
    dinoCanvas.dispatchEvent(new KeyboardEvent("keydown", {
      code,
      bubbles: true,
      cancelable: true,
    }));
    if (pauseImmediately) {
      (window as unknown as Window & { setDinoVisibility: (value: boolean) => void })
        .setDinoVisibility(true);
    }
    const getSnapshot = dinoCanvas.__getDinoSnapshot;
    if (!getSnapshot) throw new Error("Dino snapshot reader is not installed");
    return getSnapshot();
  }, { code, pauseImmediately });
}

const backgroundImageUrls = [
  "https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png",
  "https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png",
];

const viewports = [
  { width: 1037, height: 724, expected: { x: 462.94, y: 302, width: 360, height: 120 } },
  { width: 390, height: 844, expected: { x: 24, y: 497.04, width: 342, height: 120 } },
  { width: 375, height: 667 },
  { width: 568, height: 320 },
  { width: 667, height: 375 },
];

function collectBrowserFailures(page: Page) {
  const failures: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  return failures;
}

for (const { width, height, expected } of viewports) {
  test(`renders the dinosaur shell at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const failures = collectBrowserFailures(page);
    const imageRequests: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "image") imageRequests.push(request.url());
    });

    const response = await page.goto("/", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);

    const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
    await expect(canvas).toHaveCount(1);
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute("tabindex", "0");
    await expect(canvas).toHaveAttribute(
      "aria-label",
      "Dinosaur runner game. Press Space or Arrow Up, or tap, to jump.",
    );
    await expect(canvas).toHaveAttribute("aria-describedby", "dino-game-instructions");
    await expect(page.locator("#dino-game-instructions")).toHaveAttribute("hidden", "");
    await expect(page.locator("#dino-game-instructions")).toHaveText(
      "Focus the game, then press Space or Arrow Up, or tap, to jump.",
    );
    const status = page.getByRole("status");
    await expect(status).toHaveText("Ready. Score 0.");
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(status).toHaveAttribute("aria-atomic", "true");

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (expected) {
      expect(box?.x).toBeCloseTo(expected.x, 1);
      expect(box?.y).toBeCloseTo(expected.y, 1);
      expect(box?.width).toBeCloseTo(expected.width, 1);
      expect(box?.height).toBeCloseTo(expected.height, 1);
    }
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(height);

    await canvas.focus();
    const styles = await canvas.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        backgroundColor: computed.backgroundColor,
        border: computed.border,
        borderRadius: computed.borderRadius,
        boxShadow: computed.boxShadow,
        position: computed.position,
        zIndex: computed.zIndex,
        cursor: computed.cursor,
        outlineColor: computed.outlineColor,
        outlineOffset: computed.outlineOffset,
        outlineStyle: computed.outlineStyle,
        outlineWidth: computed.outlineWidth,
      };
    });
    expect(styles).toEqual({
      backgroundColor: "rgba(248, 248, 245, 0.92)",
      border: "2px solid rgb(7, 7, 7)",
      borderRadius: "0px",
      boxShadow: "rgba(7, 7, 7, 0.22) 4px 4px 0px 0px",
      position: "absolute",
      zIndex: "120",
      cursor: "pointer",
      outlineColor: "rgb(7, 7, 7)",
      outlineOffset: "2px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    });

    const heading = page.getByRole("heading", { level: 1, name: "Victor Qi", exact: true });
    const socials = page.getByRole("navigation", { name: "Social links" });
    expect(await socials.getByRole("link").evaluateAll((links) => links.map((link) => ({
      label: link.getAttribute("aria-label"),
      href: link.getAttribute("href"),
    })))).toEqual([
      { label: "LinkedIn", href: "https://www.linkedin.com/in/victor-qi/" },
      { label: "Instagram", href: "https://www.instagram.com/victor.qii/" },
      { label: "X", href: "https://x.com/stridesoles" },
      { label: "Email", href: "mailto:victorqi0707@gmail.com" },
    ]);
    for (const locator of [heading, socials]) {
      const contentBox = await locator.boundingBox();
      expect(contentBox).not.toBeNull();
      expect(
        box!.x + box!.width <= contentBox!.x ||
          box!.x >= contentBox!.x + contentBox!.width ||
          box!.y + box!.height <= contentBox!.y ||
          box!.y >= contentBox!.y + contentBox!.height,
      ).toBe(true);
    }

    expect(await page.locator("body").innerText()).toBe("Victor Qi\nReady. Score 0.");
    expect(await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }))).toEqual({ width, height });
    expect(imageRequests.sort()).toEqual([...backgroundImageUrls].sort());
    expect(failures).toEqual([]);
  });
}

test("parks the idle game after its static paint", async ({ page }) => {
  await page.setViewportSize({ width: 1037, height: 724 });
  await page.goto("/", { waitUntil: "networkidle" });

  const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
  const initial = await readGame(canvas);
  expect(initial).toEqual({
    state: "idle",
    score: 0,
    frameCount: 0,
    paintCount: 1,
    dinoY: 64,
    obstaclesCleared: 0,
  });
  await page.waitForTimeout(300);
  expect(await readGame(canvas)).toEqual(initial);
});

test("does not render a redundant DINO.RUN label", async ({ page }) => {
  await page.addInitScript(() => {
    const labels: string[] = [];
    const originalFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      labels.push(String(text));
      if (maxWidth === undefined) return originalFillText.call(this, text, x, y);
      return originalFillText.call(this, text, x, y, maxWidth);
    };
    Object.defineProperty(window, "__dinoCanvasLabels", {
      configurable: true,
      value: labels,
    });
  });
  await page.goto("/", { waitUntil: "networkidle" });

  expect(await page.evaluate(() =>
    (window as unknown as Window & { __dinoCanvasLabels: string[] }).__dinoCanvasLabels,
  )).not.toContain("DINO.RUN");
});

test("does not hijack Space or ArrowUp while the game is unfocused", async ({ page }) => {
  await page.setViewportSize({ width: 1037, height: 724 });
  await page.goto("/", { waitUntil: "networkidle" });

  const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
  await page.getByRole("link", { name: "LinkedIn" }).focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowUp");
  expect(await readGame(canvas)).toMatchObject({ state: "idle", score: 0 });
});

for (const input of ["Space", "ArrowUp", "pointer"] as const) {
  test(`${input} starts a run, jumps, and advances score`, async ({ page }) => {
    const viewport = input === "pointer" ? { width: 390, height: 844 } : { width: 1037, height: 724 };
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });

    const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
    const idleY = (await readGame(canvas)).dinoY;
    let started: DinoSnapshot;
    if (input !== "pointer") {
      await canvas.focus();
      started = await dispatchKeyAndReadGame(canvas, input);
    } else {
      started = await canvas.evaluate((element) => {
        const dinoCanvas = element as DinoCanvas;
        dinoCanvas.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        return dinoCanvas.__getDinoSnapshot!();
      });
    }

    expect(started.state).toBe("running");
    expect(started.dinoY).toBeLessThan(idleY);
    await expect.poll(async () => (await readGame(canvas)).frameCount).toBeGreaterThan(1);
    await expect.poll(async () => (await readGame(canvas)).score).toBeGreaterThan(0);
    await expect(page.getByRole("status")).toHaveText("Running. Score 0.");
  });
}

for (const viewport of [
  { width: 1037, height: 724 },
  { width: 390, height: 844 },
]) {
  test(`the opening jump clears the first cactus at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });

    const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
    await canvas.focus();
    await canvas.evaluate((element) => {
      const dinoCanvas = element as DinoCanvas;
      const testWindow = window as unknown as Window & { dinoOpeningMinY?: number };
      testWindow.dinoOpeningMinY = Number.POSITIVE_INFINITY;
      const sampleJump = () => {
        const snapshot = dinoCanvas.__getDinoSnapshot!();
        testWindow.dinoOpeningMinY = Math.min(testWindow.dinoOpeningMinY!, snapshot.dinoY);
        if (snapshot.obstaclesCleared === 0 && snapshot.state !== "game-over") {
          requestAnimationFrame(sampleJump);
        }
      };
      requestAnimationFrame(sampleJump);
    });
    await page.keyboard.press("Space");

    await expect.poll(
      async () => (await readGame(canvas)).obstaclesCleared,
      { timeout: 4_000 },
    ).toBe(1);
    expect((await readGame(canvas)).state).toBe("running");
    expect(await page.evaluate(() =>
      (window as unknown as Window & { dinoOpeningMinY: number }).dinoOpeningMinY,
    )).toBeGreaterThanOrEqual(18);
  });
}

test("resizing repaints without destroying an active run", async ({ page }) => {
  await page.setViewportSize({ width: 1037, height: 724 });
  await page.goto("/", { waitUntil: "networkidle" });

  const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
  await canvas.focus();
  const paused = await dispatchKeyAndReadGame(canvas, "Space", true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(async () => (await readGame(canvas)).paintCount).toBeGreaterThan(paused.paintCount);
  const resized = await readGame(canvas);
  expect(resized).toMatchObject({
    state: "running",
    score: paused.score,
    frameCount: paused.frameCount,
    dinoY: paused.dinoY,
    obstaclesCleared: paused.obstaclesCleared,
  });
  await page.waitForTimeout(300);
  expect(await readGame(canvas)).toEqual(resized);

  await page.evaluate(() =>
    (window as unknown as Window & { setDinoVisibility: (value: boolean) => void })
      .setDinoVisibility(false),
  );
  await expect.poll(async () => (await readGame(canvas)).frameCount).toBeGreaterThan(resized.frameCount);
  await expect.poll(async () => (await readGame(canvas)).score).toBeGreaterThan(resized.score);
});

test("pauses while hidden and resumes without advancing hidden time", async ({ page }) => {
  await page.setViewportSize({ width: 1037, height: 724 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    let hidden = false;
    Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
    (window as unknown as Window & { setDinoVisibility?: (value: boolean) => void }).setDinoVisibility = (value) => {
      hidden = value;
      document.dispatchEvent(new Event("visibilitychange"));
    };
  });

  const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
  await canvas.focus();
  await page.keyboard.press("Space");
  await expect.poll(async () => (await readGame(canvas)).frameCount).toBeGreaterThan(2);
  await page.evaluate(() => (window as unknown as Window & { setDinoVisibility: (value: boolean) => void }).setDinoVisibility(true));
  const hidden = await readGame(canvas);
  await page.waitForTimeout(300);
  expect(await readGame(canvas)).toEqual(hidden);
  await page.evaluate(() => (window as unknown as Window & { setDinoVisibility: (value: boolean) => void }).setDinoVisibility(false));
  await expect.poll(async () => (await readGame(canvas)).frameCount).toBeGreaterThan(hidden.frameCount);
});

test("caps the canvas backing store at DPR 2", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1037, height: 724 },
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "networkidle" });
  const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
  expect(await canvas.evaluate((element) => ({
    x: (element as HTMLCanvasElement).width / element.clientWidth,
    y: (element as HTMLCanvasElement).height / element.clientHeight,
  }))).toEqual({ x: 2, y: 2 });
  await context.close();
});

test("reduced motion remains parked until explicit input", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1037, height: 724 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "networkidle" });
  const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
  const parked = await readGame(canvas);
  await page.waitForTimeout(300);
  expect(await readGame(canvas)).toEqual(parked);
  await canvas.focus();
  const started = await dispatchKeyAndReadGame(canvas, "ArrowUp");
  expect(started.state).toBe("running");
  expect(started.dinoY).toBeLessThan(64);
  await context.close();
});

test("cleans up RAF, input, visibility, and resize work on client unmount", async ({ page }) => {
  await page.setViewportSize({ width: 1037, height: 724 });
  await page.goto("/", { waitUntil: "networkidle" });
  const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
  await canvas.focus();
  await page.keyboard.press("Space");
  await expect.poll(async () => (await readGame(canvas)).frameCount).toBeGreaterThan(2);

  await page.evaluate(() => {
    const testWindow = window as unknown as Window & {
      dinoSentinel?: string;
      oldDino?: DinoCanvas;
      oldDinoSnapshot?: () => DinoSnapshot;
      next: { router: { push: (path: string) => void } };
    };
    testWindow.dinoSentinel = "alive";
    testWindow.oldDino = document.querySelector<DinoCanvas>("canvas.dino-game")!;
    testWindow.oldDinoSnapshot = testWindow.oldDino.__getDinoSnapshot;
    testWindow.next.router.push("/ethereal-baseline");
  });
  await page.waitForURL("**/ethereal-baseline");
  await expect(page.locator("canvas.dino-game")).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as Window & { dinoSentinel?: string }).dinoSentinel)).toBe("alive");

  await page.waitForTimeout(100);
  const parked = await page.evaluate(() => {
    const testWindow = window as unknown as Window & {
      oldDino: DinoCanvas;
      oldDinoSnapshot: () => DinoSnapshot;
    };
    return {
      connected: testWindow.oldDino.isConnected,
      getterRemoved: testWindow.oldDino.__getDinoSnapshot === undefined,
      snapshot: testWindow.oldDinoSnapshot(),
    };
  });
  expect(parked.connected).toBe(false);
  expect(parked.getterRemoved).toBe(true);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() =>
    (window as unknown as Window & { oldDinoSnapshot: () => DinoSnapshot }).oldDinoSnapshot(),
  )).toEqual(parked.snapshot);

  await page.evaluate(() => {
    const canvas = (window as unknown as Window & { oldDino: DinoCanvas }).oldDino;
    canvas.dispatchEvent(new KeyboardEvent("keydown", { code: "Space", bubbles: true, cancelable: true }));
    canvas.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.waitForTimeout(150);
  expect(await page.evaluate(() =>
    (window as unknown as Window & { oldDinoSnapshot: () => DinoSnapshot }).oldDinoSnapshot(),
  )).toEqual(parked.snapshot);
});

test("an unassisted run reaches game over, parks, and restarts", async ({ page }) => {
  await page.setViewportSize({ width: 1037, height: 724 });
  const failures = collectBrowserFailures(page);
  await page.goto("/", { waitUntil: "networkidle" });

  const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
  await canvas.focus();
  await page.keyboard.press("Space");
  await expect.poll(async () => (await readGame(canvas)).state, { timeout: 12_000 }).toBe("game-over");
  await expect(page.getByRole("status")).toHaveText(
    /Game over\. Score \d+\. Press Space or Arrow Up, or tap, to restart\./,
  );

  const stopped = await readGame(canvas);
  expect(stopped.score).toBeGreaterThan(0);
  await page.waitForTimeout(300);
  expect(await readGame(canvas)).toEqual(stopped);

  const restarted = await dispatchKeyAndReadGame(canvas, "Space");
  expect(restarted.state).toBe("running");
  expect(restarted.dinoY).toBeLessThan(64);
  expect(restarted.score).toBeLessThan(stopped.score);
  expect(failures).toEqual([]);
});
