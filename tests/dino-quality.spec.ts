import { expect, test, type Locator, type Page } from "@playwright/test";

type DinoSnapshot = {
  state: "idle" | "running" | "game-over";
  score: number;
  frameCount: number;
  paintCount: number;
  dinoY: number;
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

async function installCanvasWorkCounters(page: Page) {
  await page.addInitScript(() => {
    const testWindow = window as Window & {
      dinoWorkStats?: {
        contextCalls: number;
        widthWrites: number;
        heightWrites: number;
        clientWidthReads: number;
        clientHeightReads: number;
      };
    };
    testWindow.dinoWorkStats = {
      contextCalls: 0,
      widthWrites: 0,
      heightWrites: 0,
      clientWidthReads: 0,
      clientHeightReads: 0,
    };

    const prototype = HTMLCanvasElement.prototype;
    const originalGetContext = prototype.getContext;
    Object.defineProperty(prototype, "getContext", {
      configurable: true,
      value(this: HTMLCanvasElement, ...args: unknown[]) {
        if (this.classList.contains("dino-game")) testWindow.dinoWorkStats!.contextCalls += 1;
        return Reflect.apply(originalGetContext, this, args);
      },
    });

    for (const key of ["width", "height"] as const) {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, key)!;
      Object.defineProperty(prototype, key, {
        ...descriptor,
        set(this: HTMLCanvasElement, value: number) {
          if (this.classList.contains("dino-game")) {
            if (key === "width") testWindow.dinoWorkStats!.widthWrites += 1;
            else testWindow.dinoWorkStats!.heightWrites += 1;
          }
          descriptor.set!.call(this, value);
        },
      });
    }

    for (const key of ["clientWidth", "clientHeight"] as const) {
      const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, key)!;
      Object.defineProperty(Element.prototype, key, {
        ...descriptor,
        get(this: Element) {
          if (this instanceof HTMLCanvasElement && this.classList.contains("dino-game")) {
            if (key === "clientWidth") testWindow.dinoWorkStats!.clientWidthReads += 1;
            else testWindow.dinoWorkStats!.clientHeightReads += 1;
          }
          return descriptor.get!.call(this);
        },
      });
    }
  });
}

async function installResolutionListenerCounters(page: Page) {
  await page.addInitScript(() => {
    const stats = { queries: 0, added: 0, removed: 0 };
    const activeListeners = new Set<EventListenerOrEventListenerObject>();
    const nativeMatchMedia = window.matchMedia.bind(window);
    const testWindow = window as unknown as Window & {
      fireDinoResolutionChange?: () => void;
      getDinoResolutionStats?: () => typeof stats & { active: number };
    };
    testWindow.getDinoResolutionStats = () => ({ ...stats, active: activeListeners.size });

    window.matchMedia = ((query: string) => {
      const mediaQuery = nativeMatchMedia(query);
      if (!query.startsWith("(resolution:")) return mediaQuery;
      stats.queries += 1;
      const nativeAdd = mediaQuery.addEventListener.bind(mediaQuery);
      const nativeRemove = mediaQuery.removeEventListener.bind(mediaQuery);
      Object.defineProperty(mediaQuery, "addEventListener", {
        configurable: true,
        value(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
          if (type === "change") {
            activeListeners.add(listener);
            stats.added += 1;
          }
          return nativeAdd(type, listener, options);
        },
      });
      Object.defineProperty(mediaQuery, "removeEventListener", {
        configurable: true,
        value(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) {
          if (type === "change" && activeListeners.delete(listener)) stats.removed += 1;
          return nativeRemove(type, listener, options);
        },
      });
      testWindow.fireDinoResolutionChange = () => mediaQuery.dispatchEvent(new Event("change"));
      return mediaQuery;
    }) as typeof window.matchMedia;
  });
}

test("announces real live-region content without adding visible copy", async ({ page }) => {
  await page.setViewportSize({ width: 1037, height: 724 });
  await page.goto("/", { waitUntil: "networkidle" });

  const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
  const status = page.getByRole("status");
  await expect(status).toHaveText("Ready. Score 0.");
  await expect(status).not.toHaveAttribute("aria-label");
  await expect(status).toHaveCSS("position", "absolute");
  await expect(status).toHaveCSS("width", "1px");
  await expect(status).toHaveCSS("height", "1px");
  await expect(status).toHaveCSS("overflow", "hidden");
  expect((await page.locator("body").innerText()).trim()).toBe("Victor Qi\nReady. Score 0.");

  await canvas.focus();
  await page.keyboard.press("Space");
  await expect(status).toHaveText("Running. Score 0.");
  await expect.poll(async () => (await readGame(canvas)).state, { timeout: 12_000 }).toBe("game-over");
  await expect(status).toHaveText(
    /Game over\. Score \d+\. Press Space or Arrow Up, or tap, to restart\./,
  );
});

test("caches canvas resources and keeps test telemetry out of the RAF DOM path", async ({ page }) => {
  await installCanvasWorkCounters(page);
  await page.setViewportSize({ width: 1037, height: 724 });
  await page.goto("/", { waitUntil: "networkidle" });

  const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
  const idle = await readGame(canvas);
  expect(idle.state).toBe("idle");
  const baseline = await page.evaluate(() =>
    (window as unknown as Window & {
      dinoWorkStats: {
        contextCalls: number;
        widthWrites: number;
        heightWrites: number;
        clientWidthReads: number;
        clientHeightReads: number;
      };
    }).dinoWorkStats,
  );
  await canvas.evaluate((element) => {
    const testWindow = window as unknown as Window & { dinoAttributeMutations?: string[] };
    testWindow.dinoAttributeMutations = [];
    new MutationObserver((records) => {
      for (const record of records) {
        if (record.attributeName) testWindow.dinoAttributeMutations!.push(record.attributeName);
      }
    }).observe(element, { attributes: true });
  });

  await canvas.focus();
  await page.keyboard.press("Space");
  await expect.poll(async () => (await readGame(canvas)).state, { timeout: 12_000 }).toBe("game-over");
  const after = await page.evaluate(() => ({
    stats: (window as unknown as Window & {
      dinoWorkStats: {
        contextCalls: number;
        widthWrites: number;
        heightWrites: number;
        clientWidthReads: number;
        clientHeightReads: number;
      };
    }).dinoWorkStats,
    mutations: (window as unknown as Window & { dinoAttributeMutations: string[] }).dinoAttributeMutations,
  }));

  expect(after.stats.contextCalls).toBe(1);
  expect(after.stats.widthWrites).toBe(baseline.widthWrites);
  expect(after.stats.heightWrites).toBe(baseline.heightWrites);
  expect(after.stats.clientWidthReads).toBe(baseline.clientWidthReads);
  expect(after.stats.clientHeightReads).toBe(baseline.clientHeightReads);
  expect(after.mutations).toEqual([]);
});

test("repaints an idle canvas when DPR changes without a CSS resize", async ({ page }) => {
  await installResolutionListenerCounters(page);
  await page.setViewportSize({ width: 1037, height: 724 });
  await page.goto("/", { waitUntil: "networkidle" });
  const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
  const before = await readGame(canvas);
  const cssBox = await canvas.evaluate((element) => ({ width: element.clientWidth, height: element.clientHeight }));
  expect(await page.evaluate(() =>
    (window as unknown as Window & {
      getDinoResolutionStats: () => { queries: number; added: number; removed: number; active: number };
    }).getDinoResolutionStats(),
  )).toEqual({ queries: 1, added: 1, removed: 0, active: 1 });

  await page.evaluate(() => {
    const testWindow = window as unknown as Window & { fireDinoResolutionChange: () => void };
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, get: () => 2 });
    testWindow.fireDinoResolutionChange();
  });
  await expect.poll(async () =>
    canvas.evaluate((element) => {
      const surface = element as HTMLCanvasElement;
      return {
        x: surface.width / surface.clientWidth,
        y: surface.height / surface.clientHeight,
      };
    }),
  ).toEqual({ x: 2, y: 2 });
  const after = await readGame(canvas);
  expect(after.state).toBe("idle");
  expect(after.paintCount).toBeGreaterThan(before.paintCount);
  expect(await canvas.evaluate((element) => ({ width: element.clientWidth, height: element.clientHeight }))).toEqual(cssBox);
  expect(await page.evaluate(() =>
    (window as unknown as Window & {
      getDinoResolutionStats: () => { queries: number; added: number; removed: number; active: number };
    }).getDinoResolutionStats(),
  )).toEqual({ queries: 2, added: 2, removed: 1, active: 1 });

  await page.evaluate(() => {
    const testWindow = window as unknown as Window & {
      oldDinoSnapshot?: () => DinoSnapshot;
      next: { router: { push: (path: string) => void } };
    };
    const oldCanvas = document.querySelector<DinoCanvas>("canvas.dino-game")!;
    testWindow.oldDinoSnapshot = oldCanvas.__getDinoSnapshot;
    testWindow.next.router.push("/ethereal-baseline");
  });
  await page.waitForURL("**/ethereal-baseline");
  const parked = await page.evaluate(() => {
    const testWindow = window as unknown as Window & {
      fireDinoResolutionChange: () => void;
      getDinoResolutionStats: () => { queries: number; added: number; removed: number; active: number };
      oldDinoSnapshot: () => DinoSnapshot;
    };
    const snapshot = testWindow.oldDinoSnapshot();
    testWindow.fireDinoResolutionChange();
    return { snapshot, listenerStats: testWindow.getDinoResolutionStats() };
  });
  expect(parked.listenerStats).toEqual({ queries: 2, added: 2, removed: 2, active: 0 });
  await page.waitForTimeout(100);
  expect(await page.evaluate(() =>
    (window as unknown as Window & { oldDinoSnapshot: () => DinoSnapshot }).oldDinoSnapshot(),
  )).toEqual(parked.snapshot);
});

test("disconnects its ResizeObserver during client-route cleanup", async ({ page }) => {
  await page.addInitScript(() => {
    const NativeResizeObserver = window.ResizeObserver;
    const stats = { created: 0, disconnected: 0 };
    (window as unknown as Window & { dinoResizeObserverStats?: typeof stats }).dinoResizeObserverStats = stats;
    window.ResizeObserver = class TrackingResizeObserver extends NativeResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        super(callback);
        stats.created += 1;
      }

      override disconnect() {
        stats.disconnected += 1;
        super.disconnect();
      }
    };
  });
  await page.setViewportSize({ width: 1037, height: 724 });
  await page.goto("/", { waitUntil: "networkidle" });
  const canvas = page.getByRole("application", { name: "Dinosaur runner game" });
  await canvas.focus();
  await page.keyboard.press("Space");
  await expect.poll(async () => (await readGame(canvas)).frameCount).toBeGreaterThan(2);

  await page.evaluate(() => {
    const testWindow = window as unknown as Window & {
      oldDino?: DinoCanvas;
      next: { router: { push: (path: string) => void } };
    };
    testWindow.oldDino = document.querySelector<DinoCanvas>("canvas.dino-game")!;
    testWindow.next.router.push("/ethereal-baseline");
  });
  await page.waitForURL("**/ethereal-baseline");
  const stats = await page.evaluate(() =>
    (window as unknown as Window & {
      dinoResizeObserverStats: { created: number; disconnected: number };
    }).dinoResizeObserverStats,
  );
  expect(stats.created).toBeGreaterThan(0);
  expect(stats.disconnected).toBe(stats.created);
});
