import { expect, test, type Page } from "@playwright/test";

const retainedRoutes = ["/", "/moments"];
const removedRoutes = ["/about", "/projects", "/blog"];

function collectBrowserFailures(page: Page) {
  const failures: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    const url = new URL(request.url());
    if (url.origin === "http://127.0.0.1:4173") {
      failures.push(`requestfailed: ${url.pathname} (${request.failure()?.errorText ?? "unknown"})`);
    }
  });
  return failures;
}

for (const route of retainedRoutes) {
  test(`${route} returns 200 without browser failures`, async ({ page }) => {
    const failures = collectBrowserFailures(page);
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    expect(failures).toEqual([]);
  });

  test(`${route} has no horizontal overflow on desktop or mobile`, async ({ page }) => {
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      await page.goto(route, { waitUntil: "networkidle" });
      const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
      expect(dimensions.width).toBeLessThanOrEqual(dimensions.client);
    }
  });
}

for (const route of removedRoutes) {
  test(`${route} returns a native 404`, async ({ request }) => {
    const response = await request.get(route, { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });
}

test("homepage retains content, links, and named motion components", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Victor Qi" })).toBeVisible();
  await expect(page.getByText("Northeastern University")).toBeVisible();
  await expect(page.getByText("3.97", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Moments" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open Tablr/i })).toHaveAttribute("href", "https://jointablr.com");
  await expect(page.getByRole("link", { name: /Open The Fractional Few/i })).toHaveAttribute("href", "https://whop.com/the-fractional-few");
  await expect(page.locator(".hero-intro-burst")).toHaveCount(1);
  await expect(page.locator(".ambient-grid")).toHaveCount(1);
  await expect(page.locator('[data-reveal="true"]')).toHaveCount(8);
  for (const route of removedRoutes) await expect(page.locator(`a[href="${route}"]`)).toHaveCount(0);
});

test("homepage hero content follows the name as a coordinated second beat", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  const motion = await page.locator("#hero-title, .hero__contact, .intro-card--facts").evaluateAll((elements) =>
    elements.map((element) => {
      const styles = getComputedStyle(element);
      return {
        animationName: styles.animationName,
        animationDelay: styles.animationDelay,
        animationDuration: styles.animationDuration,
      };
    }),
  );

  expect(motion).toEqual([
    { animationName: "name-arrive", animationDelay: "0s", animationDuration: "0.7s" },
    { animationName: "hero-content-arrive", animationDelay: "0.72s", animationDuration: "0.48s" },
    { animationName: "hero-content-arrive", animationDelay: "0.72s", animationDuration: "0.48s" },
  ]);
});

test("every aria-labelledby reference resolves to an element", async ({ page }) => {
  await page.goto("/");
  const missingTargets = await page.locator("[aria-labelledby]").evaluateAll((elements) =>
    elements.flatMap((element) =>
      (element.getAttribute("aria-labelledby") ?? "")
        .split(/\s+/)
        .filter((id) => id && !document.getElementById(id)),
    ),
  );
  expect(missingTargets).toEqual([]);
});

for (const route of retainedRoutes) {
  test(`reduced-motion ${route} is hydration-safe and complete`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const failures = collectBrowserFailures(page);
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    if (route === "/") {
      await expect(page.getByText("$280K Peak Yearly Revenue")).toBeVisible();
      await expect(page.getByText("Intern · Event Management Team")).toBeVisible();
      for (const selector of ["#hero-title", ".hero__contact", ".intro-card--facts"]) {
        await expect(page.locator(selector)).toHaveCSS("animation-name", "none");
      }
      for (const selector of [".hero__contact", ".intro-card--facts"]) {
        await expect(page.locator(selector)).toHaveCSS("opacity", "1");
      }
    } else {
      await expect(page.getByText("Photographs will appear here when I have some I want to share.")).toBeVisible();
    }
    expect(failures).toEqual([]);
  });
}

test("Projects mood transitions in and resets after the section", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-mood", "default");

  await page.locator("#projects").evaluate((section) => {
    const rect = section.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + rect.top + Math.min(rect.height * 0.35, 560) - window.innerHeight / 2, behavior: "instant" });
  });
  await expect(root).toHaveAttribute("data-mood", "projects");

  await page.locator('section[aria-labelledby="proof-title"]').evaluate((section) => {
    const rect = section.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + rect.top + Math.min(rect.height * 0.35, 420) - window.innerHeight / 2, behavior: "instant" });
  });
  await expect(root).toHaveAttribute("data-mood", "default");
});

test("client navigation from Moments starts the home burst and Projects mood", async ({ page }) => {
  await page.addInitScript(() => {
    const tracked = window as typeof window & { __heroBurstDrawCount: number };
    tracked.__heroBurstDrawCount = 0;
    const original = CanvasRenderingContext2D.prototype.stroke;
    CanvasRenderingContext2D.prototype.stroke = function (...args) {
      if (this.canvas.classList.contains("hero-intro-burst")) tracked.__heroBurstDrawCount += 1;
      return original.apply(this, args);
    };
  });
  await page.goto("/moments", { waitUntil: "networkidle" });
  const burst = page.locator("canvas.hero-intro-burst");
  await expect(burst).toHaveJSProperty("width", 300);
  await expect(burst).toHaveJSProperty("height", 150);

  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __heroBurstDrawCount: number }).__heroBurstDrawCount)).toBeGreaterThan(0);

  await page.locator("#projects").scrollIntoViewIfNeeded();
  await expect(page.locator("html")).toHaveAttribute("data-mood", "projects");
});

test("Projects mood reacquires its section after returning Home a second time", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Moments" }).click();
  await expect(page).toHaveURL("/moments");
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page).toHaveURL("/");
  await page.locator("#projects").scrollIntoViewIfNeeded();
  await expect(page.locator("html")).toHaveAttribute("data-mood", "projects");
});

test("completed hero burst stays released after viewport resize", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const burst = page.locator("canvas.hero-intro-burst");
  await expect(burst).toHaveJSProperty("width", 1, { timeout: 2500 });
  await expect(burst).toHaveJSProperty("height", 1);

  await page.setViewportSize({ width: 900, height: 700 });
  await page.waitForTimeout(100);
  await expect(burst).toHaveJSProperty("width", 1);
  await expect(burst).toHaveJSProperty("height", 1);
});

test("hero burst hidden past its deadline releases and parks when visible", async ({ page }) => {
  await page.addInitScript(() => {
    const tracked = window as typeof window & {
      __heroBurstDrawCount: number;
      __heroBurstHiddenTriggered: boolean;
      __heroBurstWidthWhenHidden: number;
      __portfolioRafCount: number;
      __setDocumentHidden: (hidden: boolean) => void;
    };
    let hidden = false;
    Object.defineProperty(Document.prototype, "hidden", { configurable: true, get: () => hidden });
    tracked.__setDocumentHidden = (next) => { hidden = next; };
    const originalStroke = CanvasRenderingContext2D.prototype.stroke;
    tracked.__heroBurstDrawCount = 0;
    tracked.__heroBurstHiddenTriggered = false;
    tracked.__heroBurstWidthWhenHidden = 0;
    CanvasRenderingContext2D.prototype.stroke = function (...args) {
      if (this.canvas.classList.contains("hero-intro-burst")) {
        tracked.__heroBurstDrawCount += 1;
        if (!tracked.__heroBurstHiddenTriggered) {
          tracked.__heroBurstWidthWhenHidden = this.canvas.width;
          hidden = true;
          tracked.__heroBurstHiddenTriggered = true;
          queueMicrotask(() => document.dispatchEvent(new Event("visibilitychange")));
        }
      }
      return originalStroke.apply(this, args);
    };
    const originalRaf = window.requestAnimationFrame.bind(window);
    tracked.__portfolioRafCount = 0;
    window.requestAnimationFrame = (callback) => {
      tracked.__portfolioRafCount += 1;
      return originalRaf(callback);
    };
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const burst = page.locator("canvas.hero-intro-burst");
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __heroBurstHiddenTriggered: boolean }).__heroBurstHiddenTriggered)).toBe(true);
  const widthWhenHidden = await page.evaluate(() => (window as typeof window & { __heroBurstWidthWhenHidden: number }).__heroBurstWidthWhenHidden);
  expect(widthWhenHidden).toBeGreaterThan(1);
  expect(await burst.evaluate((canvas) => (canvas as HTMLCanvasElement).width)).toBeGreaterThan(1);
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const tracked = window as typeof window & { __setDocumentHidden: (hidden: boolean) => void };
    tracked.__setDocumentHidden(false);
    document.dispatchEvent(new Event("visibilitychange"));
  });

  await expect(burst).toHaveJSProperty("width", 1);
  await expect(burst).toHaveJSProperty("height", 1);
  await page.waitForTimeout(100);
  const parkedStart = await page.evaluate(() => (window as typeof window & { __portfolioRafCount: number }).__portfolioRafCount);
  await page.waitForTimeout(350);
  const parkedEnd = await page.evaluate(() => (window as typeof window & { __portfolioRafCount: number }).__portfolioRafCount);
  expect(parkedEnd - parkedStart).toBe(0);
});

test("Projects render as two compact semantic ledger records", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });
  const cards = page.locator("#projects .project-card");
  await expect(cards).toHaveCount(2);
  expect(await cards.locator("h3").allTextContents()).toEqual(["Tablr", "The Fractional Few"]);
  await expect(cards.locator("img")).toHaveCount(2);
  await expect(cards.locator(".project-card__tags[aria-label]")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Open Tablr/i })).toHaveAttribute("href", "https://jointablr.com");
  await expect(page.getByRole("link", { name: /Open The Fractional Few/i })).toHaveAttribute("href", "https://whop.com/the-fractional-few");

  const desktopHeights = await cards.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));
  expect(Math.max(...desktopHeights)).toBeLessThan(260);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileMetrics = await cards.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  expect(Math.max(...mobileMetrics.map(({ width }) => width))).toBeLessThanOrEqual(390);
  expect(Math.max(...mobileMetrics.map(({ height }) => height))).toBeLessThan(460);
});

test("AmbientGrid parks when idle and caps its backing-store DPR", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 3 });
  await context.addInitScript(() => {
    const tracked = window as typeof window & { __portfolioRafCount: number };
    const original = window.requestAnimationFrame.bind(window);
    tracked.__portfolioRafCount = 0;
    window.requestAnimationFrame = (callback) => {
      tracked.__portfolioRafCount += 1;
      return original(callback);
    };
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1700);

  const readCount = () => page.evaluate(() => (window as typeof window & { __portfolioRafCount: number }).__portfolioRafCount);
  const idleStart = await readCount();
  await page.waitForTimeout(450);
  expect((await readCount()) - idleStart).toBe(0);

  const wakeStart = await readCount();
  await page.mouse.move(380, 260);
  await page.waitForTimeout(140);
  expect((await readCount()) - wakeStart).toBeGreaterThan(0);

  await page.waitForTimeout(1500);
  const parkedStart = await readCount();
  await page.waitForTimeout(450);
  expect((await readCount()) - parkedStart).toBe(0);

  const dpr = await page.locator("canvas.ambient-grid").evaluate((canvas) => {
    const rect = canvas.getBoundingClientRect();
    return { x: (canvas as HTMLCanvasElement).width / rect.width, y: (canvas as HTMLCanvasElement).height / rect.height };
  });
  expect(dpr.x).toBeLessThanOrEqual(2);
  expect(dpr.y).toBeLessThanOrEqual(2);
  await context.close();

  const reduced = await browser.newContext({ viewport: { width: 800, height: 600 }, reducedMotion: "reduce" });
  await reduced.addInitScript(() => {
    const tracked = window as typeof window & { __portfolioRafCount: number };
    const original = window.requestAnimationFrame.bind(window);
    tracked.__portfolioRafCount = 0;
    window.requestAnimationFrame = (callback) => {
      tracked.__portfolioRafCount += 1;
      return original(callback);
    };
  });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto("/", { waitUntil: "networkidle" });
  await reducedPage.waitForTimeout(700);
  const reducedStart = await reducedPage.evaluate(() => (window as typeof window & { __portfolioRafCount: number }).__portfolioRafCount);
  await reducedPage.waitForTimeout(450);
  const reducedEnd = await reducedPage.evaluate(() => (window as typeof window & { __portfolioRafCount: number }).__portfolioRafCount);
  expect(reducedEnd - reducedStart).toBe(0);
  await reduced.close();
});
