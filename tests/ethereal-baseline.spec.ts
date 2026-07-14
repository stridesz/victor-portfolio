import { expect, test, type Page } from "@playwright/test";

const maskUrl = "https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png";
const noiseUrl = "https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png";

function collectBrowserFailures(page: Page) {
  const failures: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) => {
    failures.push(`requestfailed: ${request.url()} (${request.failure()?.errorText ?? "unknown"})`);
  });
  return failures;
}

test("faithfully renders the isolated 21st.dev ethereal-shadow baseline", async ({ page }) => {
  await page.setViewportSize({ width: 1037, height: 724 });
  const failures = collectBrowserFailures(page);
  const assetResponses = new Map<string, number>();
  page.on("response", (response) => {
    if (response.url() === maskUrl || response.url() === noiseUrl) {
      assetResponses.set(response.url(), response.status());
    }
  });

  const response = await page.goto("/ethereal-baseline", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  expect(failures).toEqual([]);
  expect(assetResponses.get(maskUrl)).toBeGreaterThanOrEqual(200);
  expect(assetResponses.get(maskUrl)).toBeLessThan(400);
  expect(assetResponses.get(noiseUrl)).toBeGreaterThanOrEqual(200);
  expect(assetResponses.get(noiseUrl)).toBeLessThan(400);

  const heading = page.getByRole("heading", { level: 1, name: "Etheral Shadows", exact: true });
  await expect(heading).toHaveCount(1);
  await expect(heading).toBeVisible();

  const shell = page.locator(".fixed.inset-0.z-\\[100\\].bg-white");
  await expect(shell).toHaveCount(1);
  const component = heading.locator("xpath=../..");
  const geometry = await page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    document: {
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    },
  }));
  expect(geometry).toEqual({
    viewport: { width: 1037, height: 724 },
    document: { width: 1037, height: 724 },
  });
  for (const locator of [shell, component]) {
    const box = await locator.boundingBox();
    expect(box).toEqual({ x: 0, y: 0, width: 1037, height: 724 });
  }
  await expect(shell).toHaveCSS("background-color", "rgb(255, 255, 255)");
  const headingBox = await heading.boundingBox();
  expect(headingBox).not.toBeNull();
  expect(Math.abs((headingBox?.x ?? 0) + (headingBox?.width ?? 0) / 2 - 518.5)).toBeLessThanOrEqual(1);
  expect(Math.abs((headingBox?.y ?? 0) + (headingBox?.height ?? 0) / 2 - 362)).toBeLessThanOrEqual(1);

  const mask = component.locator('div[style*="mask-image"]');
  const noise = component.locator('div[style*="background-image"]');
  await expect(mask).toHaveCount(1);
  await expect(noise).toHaveCount(1);
  const visualStyles = await Promise.all([
    mask.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        backgroundColor: styles.backgroundColor,
        maskImage: styles.maskImage || styles.getPropertyValue("-webkit-mask-image"),
        maskSize: styles.maskSize || styles.getPropertyValue("-webkit-mask-size"),
        filter: getComputedStyle(element.parentElement as Element).filter,
      };
    }),
    noise.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        backgroundImage: styles.backgroundImage,
        backgroundRepeat: styles.backgroundRepeat,
        backgroundSize: styles.backgroundSize,
        opacity: styles.opacity,
      };
    }),
  ]);
  expect(visualStyles[0]).toEqual({
    backgroundColor: "rgb(128, 128, 128)",
    maskImage: `url("${maskUrl}")`,
    maskSize: "cover",
    filter: expect.stringContaining("blur(4px)"),
  });
  expect(visualStyles[1]).toEqual({
    backgroundImage: `url("${noiseUrl}")`,
    backgroundRepeat: "repeat",
    backgroundSize: "240px",
    opacity: "0.5",
  });

  const turbulence = component.locator("feTurbulence");
  await expect(turbulence).toHaveAttribute("type", "turbulence");
  await expect(turbulence).toHaveAttribute("numOctaves", "2");
  await expect(turbulence).toHaveAttribute("seed", "0");
  await expect(turbulence).toHaveAttribute("baseFrequency", "0.0005,0.002");

  const displacementMaps = component.locator("feDisplacementMap");
  await expect(displacementMaps).toHaveCount(2);
  expect(await displacementMaps.evaluateAll((elements) =>
    elements.map((element) => ({
      in: element.getAttribute("in"),
      in2: element.getAttribute("in2"),
      scale: element.getAttribute("scale"),
      result: element.getAttribute("result"),
    })),
  )).toEqual([
    { in: "SourceGraphic", in2: "circulation", scale: "100", result: "dist" },
    { in: "dist", in2: "undulation", scale: "100", result: "output" },
  ]);

  const hueRotate = component.locator('feColorMatrix[type="hueRotate"]');
  const firstHueValue = await hueRotate.getAttribute("values");
  await page.waitForTimeout(200);
  const secondHueValue = await hueRotate.getAttribute("values");
  expect(firstHueValue).not.toBeNull();
  expect(secondHueValue).not.toBeNull();
  expect(secondHueValue).not.toBe(firstHueValue);
});

for (const viewport of [{ width: 1037, height: 724 }, { width: 390, height: 844 }]) {
  test(`new vision adapts only the title at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const failures = collectBrowserFailures(page);
    const assetResponses = new Map<string, number>();
    page.on("response", (response) => {
      if (response.url() === maskUrl || response.url() === noiseUrl) {
        assetResponses.set(response.url(), response.status());
      }
    });

    const response = await page.goto("/", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    expect(failures).toEqual([]);
    for (const assetUrl of [maskUrl, noiseUrl]) {
      expect(assetResponses.get(assetUrl)).toBeGreaterThanOrEqual(200);
      expect(assetResponses.get(assetUrl)).toBeLessThan(300);
    }

    const heading = page.getByRole("heading", { level: 1, name: "Victor Qi", exact: true });
    await expect(heading).toHaveCount(1);
    await expect(heading).toBeVisible();
    await expect(page.getByText("Etheral Shadows", { exact: true })).toHaveCount(0);
    expect((await page.locator("body").innerText()).trim()).toBe("Victor Qi\nReady. Score 0.");

    const shell = page.locator(".fixed.inset-0.z-\\[100\\].bg-white");
    const component = shell.locator(":scope > div");
    await expect(shell).toHaveCount(1);
    for (const locator of [shell, component]) {
      expect(await locator.boundingBox()).toEqual({ x: 0, y: 0, ...viewport });
    }
    await expect(shell).toHaveCSS("background-color", "rgb(255, 255, 255)");
    expect(await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }))).toEqual(viewport);

    const headingGeometry = await heading.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const styles = getComputedStyle(element);
      const range = document.createRange();
      range.selectNodeContents(element);
      const textRects = Array.from(range.getClientRects());
      return {
        x: box.x,
        centerY: box.y + box.height / 2,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        textAlign: styles.textAlign,
        whiteSpace: styles.whiteSpace,
        animationName: styles.animationName,
        textLines: textRects.length,
      };
    });
    const expectedLeft = Math.min(96, Math.max(24, viewport.width * 0.06));
    const expectedFontSize = Math.min(80, Math.max(52, viewport.width * 0.075));
    expect(Math.abs(headingGeometry.x - expectedLeft)).toBeLessThanOrEqual(1);
    expect(Math.abs(headingGeometry.centerY - viewport.height / 2)).toBeLessThanOrEqual(1);
    expect(Number.parseFloat(headingGeometry.fontSize)).toBeCloseTo(expectedFontSize, 1);
    expect(Number.parseFloat(headingGeometry.fontSize)).toBeLessThanOrEqual(80);
    expect(Number.parseInt(headingGeometry.fontWeight, 10)).toBeGreaterThanOrEqual(700);
    expect(headingGeometry.fontFamily).toContain("Geist");
    expect(headingGeometry.textAlign).toBe("left");
    expect(headingGeometry.whiteSpace).toBe("nowrap");
    expect(headingGeometry.animationName).toBe("none");
    expect(headingGeometry.textLines).toBe(1);

    const expectedSocials = [
      { label: "LinkedIn", href: "https://www.linkedin.com/in/victor-qi/", external: true },
      { label: "Instagram", href: "https://www.instagram.com/victor.qii/", external: true },
      { label: "X", href: "https://x.com/stridesoles", external: true },
      { label: "Email", href: "mailto:victorqi0707@gmail.com", external: false },
    ];
    const socialNav = page.getByRole("navigation", { name: "Social links" });
    const socialLinks = socialNav.getByRole("link");
    await expect(socialLinks).toHaveCount(4);
    expect(await socialLinks.evaluateAll((links) => links.map((link) => ({
      label: link.getAttribute("aria-label"),
      href: link.getAttribute("href"),
      target: link.getAttribute("target"),
      rel: link.getAttribute("rel"),
      text: link.textContent,
    })))).toEqual(expectedSocials.map(({ label, href, external }) => ({
      label,
      href,
      target: external ? "_blank" : null,
      rel: external ? "noopener noreferrer" : null,
      text: "",
    })));
    await expect(socialLinks.locator("svg")).toHaveCount(4);

    const navGeometry = await socialNav.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const styles = getComputedStyle(element);
      return {
        x: box.x,
        y: box.y,
        position: styles.position,
        top: styles.top,
        marginTop: styles.marginTop,
        gap: styles.gap,
        flexWrap: styles.flexWrap,
      };
    });
    const headingBox = await heading.boundingBox();
    expect(headingBox).not.toBeNull();
    expect(Math.abs(navGeometry.x - (headingBox?.x ?? 0))).toBeLessThanOrEqual(1);
    expect(navGeometry.y).toBe((headingBox?.y ?? 0) + (headingBox?.height ?? 0) - 8);
    expect(navGeometry.position).toBe("absolute");
    expect(navGeometry.marginTop).toBe("-8px");
    expect(navGeometry.gap).toBe("8px");
    expect(navGeometry.flexWrap).toBe("nowrap");

    const socialGeometry = await socialLinks.evaluateAll((links) => links.map((link) => {
      const box = link.getBoundingClientRect();
      const styles = getComputedStyle(link);
      const iconBox = link.querySelector("svg")?.getBoundingClientRect();
      return {
        x: box.x,
        y: box.y,
        right: box.right,
        bottom: box.bottom,
        width: box.width,
        height: box.height,
        borderRadius: styles.borderRadius,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderColor: styles.borderColor,
        borderStyle: styles.borderStyle,
        borderWidth: styles.borderWidth,
        boxShadow: styles.boxShadow,
        iconWidth: iconBox?.width,
        iconHeight: iconBox?.height,
      };
    }));
    for (const geometry of socialGeometry) {
      expect(geometry.width).toBe(32);
      expect(geometry.height).toBe(32);
      expect(geometry.borderRadius).toBe("0px");
      expect(geometry.backgroundColor).toBe("rgba(0, 0, 0, 0)");
      expect(geometry.color).toBe("rgb(7, 7, 7)");
      expect(geometry.borderStyle).toBe("none");
      expect(geometry.borderWidth).toBe("0px");
      expect(geometry.boxShadow).toBe("none");
      expect(geometry.iconWidth).toBe(20);
      expect(geometry.iconHeight).toBe(20);
      expect(geometry.x).toBeGreaterThanOrEqual(0);
      expect(geometry.y).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(viewport.width);
      expect(geometry.bottom).toBeLessThanOrEqual(viewport.height);
    }
    expect(new Set(socialGeometry.map(({ y }) => y)).size).toBe(1);

    const mask = component.locator('div[style*="mask-image"]');
    const noise = component.locator('div[style*="background-image"]');
    const background = await Promise.all([
      mask.evaluate((element) => {
        const styles = getComputedStyle(element);
        return {
          backgroundColor: styles.backgroundColor,
          maskImage: styles.maskImage || styles.getPropertyValue("-webkit-mask-image"),
          maskSize: styles.maskSize || styles.getPropertyValue("-webkit-mask-size"),
          filter: getComputedStyle(element.parentElement as Element).filter,
        };
      }),
      noise.evaluate((element) => {
        const styles = getComputedStyle(element);
        return {
          backgroundImage: styles.backgroundImage,
          backgroundRepeat: styles.backgroundRepeat,
          backgroundSize: styles.backgroundSize,
          opacity: styles.opacity,
        };
      }),
    ]);
    expect(background).toEqual([
      {
        backgroundColor: "rgb(128, 128, 128)",
        maskImage: `url("${maskUrl}")`,
        maskSize: "cover",
        filter: expect.stringContaining("blur(4px)"),
      },
      {
        backgroundImage: `url("${noiseUrl}")`,
        backgroundRepeat: "repeat",
        backgroundSize: "240px",
        opacity: "0.5",
      },
    ]);

    const turbulence = component.locator("feTurbulence");
    await expect(turbulence).toHaveAttribute("type", "turbulence");
    await expect(turbulence).toHaveAttribute("numOctaves", "2");
    await expect(turbulence).toHaveAttribute("seed", "0");
    await expect(turbulence).toHaveAttribute("baseFrequency", "0.0005,0.002");
    expect(await component.locator("feDisplacementMap").evaluateAll((elements) =>
      elements.map((element) => ({
        in: element.getAttribute("in"),
        in2: element.getAttribute("in2"),
        scale: element.getAttribute("scale"),
        result: element.getAttribute("result"),
      })),
    )).toEqual([
      { in: "SourceGraphic", in2: "circulation", scale: "100", result: "dist" },
      { in: "dist", in2: "undulation", scale: "100", result: "output" },
    ]);

    const hueRotate = component.locator('feColorMatrix[type="hueRotate"]');
    const firstHueValue = await hueRotate.getAttribute("values");
    await page.waitForTimeout(200);
    expect(await hueRotate.getAttribute("values")).not.toBe(firstHueValue);
  });
}
