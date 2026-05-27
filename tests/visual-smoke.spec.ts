import { expect, test } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const pages = [
  { path: "/", name: "home" },
  { path: "/wills", name: "wills" },
  { path: "/estate-planning", name: "estate-planning" },
  { path: "/faq", name: "faq" },
  { path: "/contact", name: "contact" },
  { path: "/chat", name: "chat" },
];

test.describe("visual UX smoke", () => {
  for (const pageInfo of pages) {
    test(`${pageInfo.name} renders cleanly`, async ({ page }, testInfo) => {
      const browserErrors: string[] = [];

      page.on("console", (message) => {
        if (message.type() === "error") browserErrors.push(message.text());
      });
      page.on("pageerror", (error) => browserErrors.push(error.message));

      const response = await page.goto(pageInfo.path, { waitUntil: "networkidle" });
      expect(response?.ok(), `${pageInfo.path} should return a successful response`).toBeTruthy();

      await expect(page.locator("body")).toContainText("Pathway");
      await expect(page.locator("nav")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      await expect(page.locator("h1").first()).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(hasHorizontalOverflow, `${pageInfo.path} should not horizontally overflow`).toBe(false);

      const hasNextErrorOverlay = await page.locator("[data-nextjs-dialog]").count();
      expect(hasNextErrorOverlay, `${pageInfo.path} should not show a Next.js error overlay`).toBe(0);

      const screenshotDir = path.join(process.cwd(), "screenshots", "ux");
      await fs.mkdir(screenshotDir, { recursive: true });
      await page.screenshot({
        path: path.join(screenshotDir, `${testInfo.project.name}-${pageInfo.name}.png`),
        fullPage: true,
      });

      expect(browserErrors, `${pageInfo.path} should not emit browser errors`).toEqual([]);
    });
  }

  test("planning assistant opens and streams a guarded answer", async ({ page }, testInfo) => {
    const browserErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));

    const response = await page.goto("/", { waitUntil: "networkidle" });
    expect(response?.ok(), "home should return a successful response").toBeTruthy();

    await page.getByRole("button", { name: "Open planning assistant" }).click();
    await expect(page.getByRole("heading", { name: "Ask Pathway" })).toBeVisible();

    await page.getByPlaceholder("Ask a general estate planning question...").fill("Can you explain LPAs in plain English?");
    await page.getByRole("button", { name: "Send message" }).click();

    const assistantPanel = page.getByLabel("Pathway planning assistant");
    await expect(assistantPanel.getByText(/Lasting Power of Attorney|Power of Attorney|trusted people|decisions/i).first()).toBeVisible({ timeout: 15_000 });

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(hasHorizontalOverflow, "assistant should not create horizontal overflow").toBe(false);

    const screenshotDir = path.join(process.cwd(), "screenshots", "ux");
    await fs.mkdir(screenshotDir, { recursive: true });
    await page.screenshot({
      path: path.join(screenshotDir, `${testInfo.project.name}-assistant.png`),
      fullPage: true,
    });

    expect(browserErrors, "assistant should not emit browser errors").toEqual([]);
  });

  test("planning assistant can navigate to an inferred destination", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "networkidle" });
    expect(response?.ok(), "home should return a successful response").toBeTruthy();

    await page.getByRole("button", { name: "Open planning assistant" }).click();
    await page.getByPlaceholder("Ask a general estate planning question...").fill("Show me where you explain trusts");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page).toHaveURL(/\/trusts\?highlight=(main|trusts-[^#]+)(#trusts-[^#]+)?/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /Trusts/i }).first()).toBeVisible();
    await expect(page.locator(".semantic-target-highlight")).toBeVisible({ timeout: 10_000 });
    const spotlight = page.getByRole("dialog", { name: /Trusts/i });
    await expect(spotlight).toBeVisible();
    await expect(spotlight).toContainText("Found on the site");
    await expect(spotlight).toContainText(/protecting assets|supporting children|future generations/i);
    await spotlight.getByRole("button", { name: "Got it" }).click();
    await expect(spotlight).toBeHidden();
  });

  test("semantic spotlight highlights direct hash targets", async ({ page }) => {
    const response = await page.goto("/?highlight=where-we-work", { waitUntil: "networkidle" });
    expect(response?.ok(), "home highlight URL should return a successful response").toBeTruthy();

    await expect(page.locator("#where-we-work.semantic-target-highlight")).toBeVisible({ timeout: 10_000 });
    const spotlight = page.getByRole("dialog", { name: /Found on the site|Closest place/i });
    await expect(spotlight).toBeVisible();
    await spotlight.getByRole("button", { name: "Got it" }).click();
    await expect(spotlight).toBeHidden();
  });

  test("semantic spotlight can highlight an exact content block", async ({ page }) => {
    const response = await page.goto("/glossary?highlight=glossary-of-terms-card-probate#glossary-of-terms-card-probate", { waitUntil: "networkidle" });
    expect(response?.ok(), "glossary semantic block highlight URL should return a successful response").toBeTruthy();

    const target = page.locator("#glossary-of-terms-card-probate.semantic-target-highlight");
    await expect(target).toBeVisible({ timeout: 10_000 });
    await expect(target).toContainText("Probate");
    const spotlight = page.getByRole("dialog", { name: /Found on the site|Probate/i });
    await expect(spotlight).toBeVisible();
    await spotlight.getByRole("button", { name: "Got it" }).click();
    await expect(spotlight).toBeHidden();
  });

  test("full chat can navigate and trigger the same spotlight", async ({ page }) => {
    const response = await page.goto("/chat", { waitUntil: "networkidle" });
    expect(response?.ok(), "chat should return a successful response").toBeTruthy();

    await page.getByPlaceholder("Ask a general estate planning question...").fill("Take me to the contact page");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page).toHaveURL(/\/contact\?highlight=main/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: /Contact|Start with/i }).first()).toBeVisible();
    const spotlight = page.getByRole("dialog", { name: /Contact Pathway/i });
    await expect(spotlight).toBeVisible({ timeout: 10_000 });
    await expect(spotlight).toContainText("Found on the site");
  });
});
