import { expect, test } from "@playwright/test";

test("the report closes with one clear, mobile-safe acquisition question", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ko/samples/saju");
  const survey = page.getByRole("region", { name: "결을 어디에서 처음 알게 되셨나요?" });
  await survey.scrollIntoViewIfNeeded();
  await expect(survey).toBeVisible();
  await expect(survey.getByRole("radio")).toHaveCount(9);
  await expect(survey.getByRole("button", { name: "선택 완료" })).toBeDisabled();
  await survey.getByRole("radio", { name: "네이버 검색" }).click();
  await expect(survey.getByRole("button", { name: "선택 완료" })).toBeEnabled();
  await survey.getByRole("button", { name: "선택 완료" }).click();
  await expect(page.getByRole("region", { name: "답변이 저장되었습니다" })).toContainText(
    "예시 화면에서는 서버에 저장하지 않습니다.",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
