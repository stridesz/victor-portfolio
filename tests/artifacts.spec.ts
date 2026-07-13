import { expect, test, type Browser, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const artifactDir = path.resolve(".hermes/artifacts/green-ledger");
const screenshots = [
  "desktop-home-top.png", "desktop-home-projects.png", "desktop-home-proof.png", "desktop-moments.png",
  "mobile-home-top.png", "mobile-home-projects.png", "mobile-home-proof.png", "mobile-moments.png",
  "desktop-home-reduced-motion.png", "desktop-home-full.png", "mobile-home-full.png",
];

function collectFailures(page: Page, label: string, failures: string[]) {
  page.on("console", (message) => { if (message.type() === "error") failures.push(`${label} console: ${message.text()}`); });
  page.on("pageerror", (error) => failures.push(`${label} pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    if (new URL(request.url()).origin === "http://127.0.0.1:4173") {
      failures.push(`${label} request: ${request.url()} (${request.failure()?.errorText ?? "unknown"})`);
    }
  });
}

async function settle(page: Page, delay = 250) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(delay);
}

async function scrollSectionBelowNav(page: Page, headingId: string) {
  await page.evaluate((id) => {
    const heading = document.getElementById(id);
    const nav = document.querySelector(".site-nav-wrap");
    if (!heading || !nav) throw new Error(`Missing section heading or nav for ${id}`);
    const section = heading.closest("section") ?? heading;
    const navBottom = nav.getBoundingClientRect().bottom;
    window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top - navBottom - 16, behavior: "instant" });
  }, headingId);
  await page.waitForTimeout(750);
  const positions = await page.evaluate((id) => {
    const heading = document.getElementById(id);
    const nav = document.querySelector(".site-nav-wrap");
    if (!heading || !nav) throw new Error(`Missing section heading or nav for ${id}`);
    return { headingTop: heading.getBoundingClientRect().top, navBottom: nav.getBoundingClientRect().bottom };
  }, headingId);
  expect(positions.headingTop).toBeGreaterThan(positions.navBottom);
  return positions;
}

async function captureHome(page: Page, prefix: "desktop" | "mobile") {
  await page.goto("/", { waitUntil: "networkidle" });
  await settle(page, 1550);
  await page.screenshot({ path: path.join(artifactDir, `${prefix}-home-top.png`) });
  const projects = await scrollSectionBelowNav(page, "projects-title");
  await page.screenshot({ path: path.join(artifactDir, `${prefix}-home-projects.png`) });
  const proof = await scrollSectionBelowNav(page, "proof-title");
  await page.screenshot({ path: path.join(artifactDir, `${prefix}-home-proof.png`) });
  await scrollSectionBelowNav(page, "projects-title");
  await scrollSectionBelowNav(page, "proof-title");
  await page.screenshot({ path: path.join(artifactDir, `${prefix}-home-full.png`), fullPage: true });
  return { projects, proof };
}

async function measureCanvasLifecycle(browser: Browser) {
  const installRafCounter = (page: Page) => page.addInitScript(() => {
    const tracked = window as typeof window & { __portfolioRafCount: number };
    const original = window.requestAnimationFrame.bind(window);
    tracked.__portfolioRafCount = 0;
    window.requestAnimationFrame = (callback) => {
      tracked.__portfolioRafCount += 1;
      return original(callback);
    };
  });
  const readCount = (page: Page) => page.evaluate(() => (window as typeof window & { __portfolioRafCount: number }).__portfolioRafCount);

  const context = await browser.newContext({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 3 });
  const page = await context.newPage();
  await installRafCounter(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1700);
  const idleStart = await readCount(page);
  await page.waitForTimeout(450);
  const idleRafRequests = (await readCount(page)) - idleStart;
  const wakeStart = await readCount(page);
  await page.mouse.move(380, 260);
  await page.waitForTimeout(140);
  const wakeRafRequests = (await readCount(page)) - wakeStart;
  await page.waitForTimeout(1500);
  const parkedStart = await readCount(page);
  await page.waitForTimeout(450);
  const parkedRafRequests = (await readCount(page)) - parkedStart;
  const dpr = await page.locator("canvas.ambient-grid").evaluate((canvas) => {
    const rect = canvas.getBoundingClientRect();
    const surface = canvas as HTMLCanvasElement;
    return {
      requested: window.devicePixelRatio,
      effectiveX: surface.width / rect.width,
      effectiveY: surface.height / rect.height,
      backingStore: { width: surface.width, height: surface.height },
      css: { width: rect.width, height: rect.height },
    };
  });
  await context.close();

  const reduced = await browser.newContext({ viewport: { width: 800, height: 600 }, reducedMotion: "reduce" });
  const reducedPage = await reduced.newPage();
  await installRafCounter(reducedPage);
  await reducedPage.goto("/", { waitUntil: "networkidle" });
  await reducedPage.waitForTimeout(700);
  const reducedStart = await readCount(reducedPage);
  await reducedPage.waitForTimeout(450);
  const reducedMotionRafRequests = (await readCount(reducedPage)) - reducedStart;
  await reduced.close();

  return { idleRafRequests, wakeRafRequests, parkedRafRequests, reducedMotionRafRequests, dpr };
}

test("capture required production artifacts and manifest", async ({ browser, request }) => {
  await mkdir(artifactDir, { recursive: true });
  const failures: string[] = [];
  const records: Array<Record<string, unknown>> = [];

  for (const [prefix, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]] as const) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    collectFailures(page, prefix, failures);
    const sections = await captureHome(page, prefix);
    records.push({ route: "/", viewport, screenshotViewport: await page.evaluate(() => ({ width: innerWidth, height: innerHeight })), reducedMotion: false, horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), sections });
    await page.goto("/moments", { waitUntil: "networkidle" });
    await settle(page);
    await page.screenshot({ path: path.join(artifactDir, `${prefix}-moments.png`), fullPage: false });
    records.push({ route: "/moments", viewport, screenshotViewport: await page.evaluate(() => ({ width: innerWidth, height: innerHeight })), reducedMotion: false, horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) });
    await context.close();
  }

  const reducedViewport = { width: 1440, height: 1000 };
  const reduced = await browser.newContext({ viewport: reducedViewport, reducedMotion: "reduce" });
  const reducedPage = await reduced.newPage();
  collectFailures(reducedPage, "reduced", failures);
  await reducedPage.goto("/", { waitUntil: "networkidle" });
  await settle(reducedPage, 1550);
  await reducedPage.screenshot({ path: path.join(artifactDir, "desktop-home-reduced-motion.png") });
  records.push({ route: "/", viewport: reducedViewport, screenshotViewport: await reducedPage.evaluate(() => ({ width: innerWidth, height: innerHeight })), reducedMotion: true, horizontalOverflow: await reducedPage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) });
  await reduced.close();

  const routeStatuses: Record<string, number> = {};
  for (const route of ["/", "/moments", "/about", "/projects", "/blog"]) routeStatuses[route] = (await request.get(route, { maxRedirects: 0 })).status();
  const lifecycle = await measureCanvasLifecycle(browser);
  await writeFile(path.join(artifactDir, "manifest.json"), JSON.stringify({ generatedFrom: "optimized Next.js production server", routeStatuses, records, failures, lifecycle, screenshots }, null, 2));
  expect(failures).toEqual([]);
  expect(lifecycle.idleRafRequests).toBe(0);
  expect(lifecycle.wakeRafRequests).toBeGreaterThan(0);
  expect(lifecycle.parkedRafRequests).toBe(0);
  expect(lifecycle.reducedMotionRafRequests).toBe(0);
  expect(lifecycle.dpr.effectiveX).toBeLessThanOrEqual(2);
  expect(lifecycle.dpr.effectiveY).toBeLessThanOrEqual(2);
});