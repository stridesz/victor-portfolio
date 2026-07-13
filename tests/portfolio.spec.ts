import { readdir } from "node:fs/promises";
import { join } from "node:path";
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

test("hero shadow field is a single local decorative layer behind the homepage hero", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const field = page.locator(".hero > .hero-shadow-field");
  const heroGrid = page.locator(".hero > .hero__grid");
  await expect(field).toHaveCount(1);
  await expect(field).toHaveAttribute("aria-hidden", "true");
  await expect(page.locator(".hero-shadow-field")).toHaveCount(1);
  await expect(heroGrid.getByRole("heading", { level: 1, name: "Victor Qi" })).toBeVisible();
  await expect(page.locator(".hero-intro-burst")).toHaveCount(1);
  await expect(page.locator(".ambient-grid")).toHaveCount(1);

  const stacking = await field.evaluate((element) => {
    const fieldStyles = getComputedStyle(element);
    const grid = element.parentElement?.querySelector<HTMLElement>(".hero__grid");
    if (!grid) throw new Error("Hero grid is missing");
    return {
      fieldZIndex: Number.parseInt(fieldStyles.zIndex, 10),
      gridZIndex: Number.parseInt(getComputedStyle(grid).zIndex, 10),
      pointerEvents: fieldStyles.pointerEvents,
    };
  });
  expect(stacking.fieldZIndex).toBeLessThan(stacking.gridZIndex);
  expect(stacking.pointerEvents).toBe("none");

  const maskImage = await field.locator(".hero-shadow-field__mask").evaluate((element) => {
    const styles = getComputedStyle(element);
    return styles.getPropertyValue("mask-image") || styles.getPropertyValue("-webkit-mask-image");
  });
  expect(maskImage).toContain("/backgrounds/ethereal-shadow-mask.webp");
  expect(maskImage).not.toContain("framerusercontent");
  await expect(field.locator("filter, feTurbulence")).toHaveCount(0);
});

test("hero shadow field is absent from Moments", async ({ page }) => {
  await page.goto("/moments", { waitUntil: "networkidle" });
  await expect(page.locator(".hero-shadow-field")).toHaveCount(0);
});

test("hero shadow field uses restrained slow transform drift on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "networkidle" });

  const field = page.locator(".hero-shadow-field");
  const mask = field.locator(".hero-shadow-field__mask");
  await expect(field).toHaveAttribute("data-active", "true");
  await expect(mask).toBeVisible();

  const motion = await mask.evaluate((element) => {
    const styles = getComputedStyle(element);
    const animation = element.getAnimations().find(({ playState }) => playState === "running");
    if (!animation) throw new Error("Running hero shadow animation is missing");

    const effect = animation.effect as (AnimationEffect & { getKeyframes: () => ComputedKeyframe[] }) | null;
    if (!effect || typeof effect.getKeyframes !== "function") throw new Error("Hero shadow animation keyframes are missing");
    const keyframes = effect.getKeyframes();
    const duration = effect.getComputedTiming().duration;
    if (typeof duration !== "number") throw new Error("Hero shadow animation duration is not numeric");

    const originalCurrentTime = typeof animation.currentTime === "number" ? animation.currentTime : null;
    const readTranslation = () => {
      const transform = getComputedStyle(element).transform;
      const matrix = new DOMMatrixReadOnly(transform === "none" ? undefined : transform);
      return { x: matrix.m41, y: matrix.m42 };
    };

    animation.pause();
    let translationDeltaPixels: number;
    try {
      animation.currentTime = 0;
      const start = readTranslation();
      animation.currentTime = duration / 2;
      const midpoint = readTranslation();
      translationDeltaPixels = Math.hypot(midpoint.x - start.x, midpoint.y - start.y);
    } finally {
      if (originalCurrentTime !== null) animation.currentTime = originalCurrentTime;
      animation.play();
    }

    return {
      animationName: styles.animationName,
      durationSeconds: Number.parseFloat(styles.animationDuration),
      backgroundColor: styles.backgroundColor,
      filter: styles.filter,
      opacity: Number.parseFloat(styles.opacity),
      playState: animation.playState,
      keyframes,
      translationDeltaPixels,
    };
  });
  expect(motion.animationName).toBe("hero-shadow-drift");
  expect.soft(motion.durationSeconds).toBeGreaterThanOrEqual(18);
  expect.soft(motion.durationSeconds).toBeLessThanOrEqual(22);
  expect(motion.backgroundColor).toBe("rgb(35, 65, 95)");
  const blurMatch = motion.filter.match(/blur\(([\d.]+)px\)/);
  expect(blurMatch).not.toBeNull();
  const blurPixels = Number.parseFloat(blurMatch?.[1] ?? "NaN");
  expect(blurPixels).toBeGreaterThanOrEqual(10);
  expect(blurPixels).toBeLessThanOrEqual(18);
  expect.soft(motion.opacity).toBeGreaterThanOrEqual(0.24);
  expect.soft(motion.opacity).toBeLessThanOrEqual(0.29);
  expect(motion.playState).toBe("running");
  expect.soft(motion.translationDeltaPixels).toBeGreaterThanOrEqual(30);
  expect(motion.keyframes.length).toBeGreaterThanOrEqual(2);

  const keyframeMetadata = new Set(["offset", "computedOffset", "easing", "composite"]);
  const animatedProperties = new Set(
    motion.keyframes.flatMap((keyframe) => Object.keys(keyframe).filter((property) => !keyframeMetadata.has(property))),
  );
  expect(animatedProperties).toContain("transform");
  expect([...animatedProperties].filter((property) => /filter|hue|color/i.test(property))).toEqual([]);
  expect(JSON.stringify(motion.keyframes)).not.toMatch(/hue-rotate|turbulence/i);
});

test("hero shadow preserves the inline body grain without supplied external noise", async ({ page }) => {
  const backgroundFiles = await readdir(join(process.cwd(), "public", "backgrounds"));
  const shadowOrNoiseFiles = backgroundFiles.filter((filename) => /shadow|noise/i.test(filename)).sort();
  expect(shadowOrNoiseFiles.filter((filename) => /shadow/i.test(filename))).toEqual(["ethereal-shadow-mask.webp"]);
  expect(shadowOrNoiseFiles.filter((filename) => /noise/i.test(filename))).toEqual([]);

  await page.goto("/", { waitUntil: "networkidle" });
  const grain = await page.evaluate(() => {
    const styles = getComputedStyle(document.body, "::before");
    return {
      backgroundImage: styles.backgroundImage,
      opacity: Number.parseFloat(styles.opacity),
    };
  });
  expect(grain.backgroundImage).toContain("data:image/svg+xml");
  expect(decodeURIComponent(grain.backgroundImage)).toContain("<feTurbulence");
  expect(decodeURIComponent(grain.backgroundImage)).toContain("fractalNoise");
  expect(grain.opacity).toBe(0.07);

  const pageStyles = await page.evaluate(() =>
    Array.from(document.styleSheets)
      .flatMap((styleSheet) => Array.from(styleSheet.cssRules, (rule) => rule.cssText))
      .join("\n"),
  );
  expect(pageStyles).not.toContain("framerusercontent");
});

test("hero shadow field is a complete static state with reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });

  const mask = page.locator(".hero-shadow-field__mask");
  await expect(mask).toBeVisible();
  await expect(mask).toHaveCSS("animation-name", "none");
  expect(Number.parseFloat(await mask.evaluate((element) => getComputedStyle(element).opacity))).toBeGreaterThan(0);
});

test("hero shadow field is visible and static on narrow mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "networkidle" });

  const mask = page.locator(".hero-shadow-field__mask");
  await expect(mask).toBeVisible();
  await expect(mask).toHaveCSS("animation-name", "none");
  expect(Number.parseFloat(await mask.evaluate((element) => getComputedStyle(element).opacity))).toBeGreaterThan(0);
});

test("hero shadow field pauses offscreen and resumes when the hero returns", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "networkidle" });

  const field = page.locator(".hero-shadow-field");
  const mask = field.locator(".hero-shadow-field__mask");
  await expect(field).toHaveAttribute("data-active", "true");
  await expect(mask).toHaveCSS("animation-play-state", "running");

  await page.locator("#projects").scrollIntoViewIfNeeded();
  await expect(field).toHaveAttribute("data-active", "false");
  await expect(mask).toHaveCSS("animation-play-state", "paused");

  await page.locator(".hero").scrollIntoViewIfNeeded();
  await expect(field).toHaveAttribute("data-active", "true");
  await expect(mask).toHaveCSS("animation-play-state", "running");
});

test("hero shadow field pauses while the document is hidden", async ({ page }) => {
  await page.addInitScript(() => {
    const tracked = window as typeof window & { __setShadowDocumentHidden: (hidden: boolean) => void };
    let hidden = false;
    Object.defineProperty(Document.prototype, "hidden", { configurable: true, get: () => hidden });
    tracked.__setShadowDocumentHidden = (next) => { hidden = next; };
  });
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });

  const field = page.locator(".hero-shadow-field");
  await expect(field).toHaveAttribute("data-active", "true");
  await page.evaluate(() => {
    (window as typeof window & { __setShadowDocumentHidden: (hidden: boolean) => void }).__setShadowDocumentHidden(true);
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(field).toHaveAttribute("data-active", "false");
  await page.evaluate(() => {
    (window as typeof window & { __setShadowDocumentHidden: (hidden: boolean) => void }).__setShadowDocumentHidden(false);
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(field).toHaveAttribute("data-active", "true");
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

test("Projects render as two centered 4:5 logo-gallery cards", async ({ page }) => {
  const expectedProjects = [
    {
      name: "Tablr",
      alt: "Tablr logo",
      href: "https://jointablr.com",
      tint: "#20c060",
      index: "01 / 02",
      status: "Current",
      description:
        "A social dining concept for students, focused on turning meals into easier ways to meet people and build real campus connections.",
    },
    {
      name: "The Fractional Few",
      alt: "The Fractional Few logo",
      href: "https://whop.com/the-fractional-few",
      tint: "#4fbc2a",
      index: "02 / 02",
      status: "Current",
      description:
        "A market-research community focused on reverse stock splits and the information gaps around a niche public-markets setup.",
    },
  ];

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/", { waitUntil: "networkidle" });

  const folios = page.locator("#projects .project-folios");
  const cards = folios.locator("article.project-card");
  await expect(cards).toHaveCount(2);
  await expect(cards.locator("h3")).toHaveCount(2);
  await expect(cards.locator("img")).toHaveCount(2);
  await expect(cards.locator("a")).toHaveCount(2);
  expect(await cards.locator("h3").allTextContents()).toEqual(expectedProjects.map(({ name }) => name));
  expect(await cards.locator("img").evaluateAll((images) => images.map((image) => image.getAttribute("alt")))).toEqual(
    expectedProjects.map(({ alt }) => alt),
  );
  await expect(cards.locator(".project-card__visual")).toHaveCount(2);
  await expect(cards.locator(".project-card__caption")).toHaveCount(2);
  await expect(cards.locator(".project-card__tags")).toHaveCount(0);

  for (const [index, project] of expectedProjects.entries()) {
    const card = cards.nth(index);
    const caption = card.locator(".project-card__caption");
    await expect(card.getByRole("heading", { level: 3, name: project.name })).toHaveCount(1);
    await expect(card.getByRole("img", { name: project.alt })).toHaveCount(1);
    await expect(card.getByRole("link", { name: `Open ${project.name}` })).toHaveAttribute("href", project.href);
    await expect(caption).toContainText(project.index);
    await expect(caption).toContainText(project.status);
    await expect(caption).toContainText(project.name);
    await expect(caption).toContainText(project.description);
    await expect(caption.getByRole("link", { name: `Open ${project.name}` })).toHaveCount(1);
  }

  const desktopGrid = await folios.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      columns: getComputedStyle(element).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
    };
  });
  expect(desktopGrid.columns).toBe(2);
  expect(desktopGrid.width).toBeCloseTo(980, 0);

  const desktopCards = await cards.evaluateAll((elements) =>
    elements.map((card) => {
      const visual = card.querySelector<HTMLElement>(".project-card__visual");
      const logo = visual?.querySelector<HTMLElement>("img");
      if (!visual || !logo) throw new Error("Project visual or logo is missing");
      const panelRect = visual.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      const styles = getComputedStyle(visual);
      return {
        tint: getComputedStyle(card).getPropertyValue("--project-tint").trim(),
        panel: { width: panelRect.width, height: panelRect.height },
        centerDelta: {
          x: Math.abs(panelRect.left + panelRect.width / 2 - (logoRect.left + logoRect.width / 2)),
          y: Math.abs(panelRect.top + panelRect.height / 2 - (logoRect.top + logoRect.height / 2)),
        },
        backgroundImage: styles.backgroundImage,
        backgroundColor: styles.backgroundColor,
      };
    }),
  );

  expect(desktopCards.map(({ tint }) => tint)).toEqual(expectedProjects.map(({ tint }) => tint));
  for (const card of desktopCards) {
    expect(card.panel.width / card.panel.height).toBeCloseTo(0.8, 2);
    expect(card.centerDelta.x).toBeLessThanOrEqual(2);
    expect(card.centerDelta.y).toBeLessThanOrEqual(2);
    expect(card.backgroundImage).not.toBe("none");
    expect(card.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  }
  expect(Math.abs(desktopCards[0].panel.width - desktopCards[1].panel.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(desktopCards[0].panel.height - desktopCards[1].panel.height)).toBeLessThanOrEqual(1);
  expect(desktopCards[0].backgroundImage).not.toBe(desktopCards[1].backgroundImage);
  expect(desktopCards[0].backgroundColor).not.toBe(desktopCards[1].backgroundColor);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileGrid = await folios.evaluate((element) => ({
    columns: getComputedStyle(element).gridTemplateColumns.split(/\s+/).filter(Boolean).length,
    rect: element.getBoundingClientRect().toJSON(),
  }));
  expect(mobileGrid.columns).toBe(1);
  expect(mobileGrid.rect.left).toBeGreaterThanOrEqual(0);
  expect(mobileGrid.rect.right).toBeLessThanOrEqual(390);

  const mobileReveals = folios.locator(":scope > .reveal-card");
  for (let index = 0; index < await mobileReveals.count(); index += 1) {
    const reveal = mobileReveals.nth(index);
    await reveal.scrollIntoViewIfNeeded();
    await expect(reveal).toHaveAttribute("data-reveal-state", "visible");
    await expect(reveal).toHaveCSS("transform", "none");
  }

  const mobilePanels = await cards.locator(".project-card__visual").evaluateAll((elements) =>
    elements.map((element) => {
      const rect = element.getBoundingClientRect();
      const logo = element.querySelector<HTMLElement>("img");
      if (!logo) throw new Error("Project logo is missing");
      const logoRect = logo.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        right: rect.right,
        centerDelta: {
          x: Math.abs(rect.left + rect.width / 2 - (logoRect.left + logoRect.width / 2)),
          y: Math.abs(rect.top + rect.height / 2 - (logoRect.top + logoRect.height / 2)),
        },
      };
    }),
  );
  for (const panel of mobilePanels) {
    expect(panel.width / panel.height).toBeCloseTo(0.8, 2);
    expect(panel.right).toBeLessThanOrEqual(390);
    expect(panel.centerDelta.x).toBeLessThanOrEqual(2);
    expect(panel.centerDelta.y).toBeLessThanOrEqual(2);
  }
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
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
