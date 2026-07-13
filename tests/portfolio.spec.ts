import { expect, test, type Page } from "@playwright/test";

function collectBrowserFailures(page: Page) {
  const failures: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    if (new URL(request.url()).origin === "http://127.0.0.1:4173") {
      failures.push(`requestfailed: ${request.url()} (${request.failure()?.errorText ?? "unknown"})`);
    }
  });
  return failures;
}

test("portfolio presents the approved hero and project order", async ({ page }) => {
  const failures = collectBrowserFailures(page);
  await page.goto("/", { waitUntil: "networkidle" });

  const hero = page.locator("#hero");
  await expect(hero.getByRole("heading", { level: 1, name: "Victor Qi" })).toBeVisible();
  await expect(hero.getByText("I love being Victor its awesome", { exact: true })).toBeVisible();
  await expect(hero).toHaveCSS("background-image", /hero-bg\.jpg/);

  const projectNames = await page.locator("#projects article h3").allTextContents();
  expect(projectNames).toEqual(["Tablr", "RSA Bot", "Flaxwell & Co."]);
  await expect(page.locator("#projects a[target='_blank']")).toHaveCount(0);
  expect(failures).toEqual([]);
});

test("contact form is honest when Formspree is not configured", async ({ page }) => {
  await page.goto("/");
  const form = page.locator("#contact form");
  await expect(form).toHaveAttribute("data-disabled", "true");
  await expect(form.getByRole("button", { name: "Contact form unavailable" })).toBeDisabled();
  await expect(form.getByText("Set NEXT_PUBLIC_FORMSPREE_ENDPOINT to enable this form.", { exact: true })).toBeVisible();
});

test("page is responsive, accessible, and reduced-motion safe", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "networkidle" });
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      missingLabels: [...document.querySelectorAll("input, textarea")].filter((field) => !field.labels?.length).length,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    expect(dimensions.missingLabels).toBe(0);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Work that shows how I think." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Let’s talk about work worth doing." })).toBeVisible();
  }
});
