import { expect, test } from "@playwright/test";

test("console shows empty state and cross-run AI usage panel", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toContainText("PM 到 PR", { timeout: 30_000 });
  await expect(page.getByText("跨运行 AI 用量")).toBeVisible();
  await expect(page.getByText("运行后这里会展示需求卡片")).toBeVisible();
});

test("run lifecycle surfaces requirement panel after start", async ({ page }) => {
  test.skip(!process.env.RUN_E2E_RUN, "Set RUN_E2E_RUN=1 to execute full delivery E2E");

  await page.goto("/");
  await page.getByLabel("PM 需求").fill("给文章列表加阅读量展示，前端假数据即可，不改后端。");
  await page.getByRole("button", { name: "开始运行" }).click();
  await expect(page.getByText("需求")).toBeVisible({ timeout: 120_000 });
  await expect(page.getByText("阅读量")).toBeVisible();
});
