import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const artifactDir = path.resolve(".hermes/artifacts/portfolio");

test("capture responsive portfolio artifacts", async ({ browser }) => {
  await mkdir(artifactDir, { recursive: true });
  for (const [name, viewport] of [["desktop", { width: 1440, height: 1000 }], ["mobile", { width: 390, height: 844 }]] as const) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const failures: string[] = [];
    page.on("console", (message) => { if (message.type() === "error") failures.push(message.text()); });
    page.on("pageerror", (error) => failures.push(error.message));
    await page.goto("/", { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(artifactDir, `${name}-full.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    expect(failures).toEqual([]);
    await context.close();
  }
});
