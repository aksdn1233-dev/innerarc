import { expect, test } from "@playwright/test";

test("the report closes with a bounded, mobile-safe retention survey", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ko/samples/saju");
  const survey = page.getByRole("region", { name: "태령당을 어디에서 처음 알게 되셨나요?" });
  await survey.scrollIntoViewIfNeeded();
  await expect(survey).toBeVisible();
  await expect(survey.getByRole("radio")).toHaveCount(9);
  await survey.getByRole("button", { name: "다음" }).click();
  await expect(survey.getByRole("alert")).toContainText("유입 경로");
  await survey.getByRole("radio", { name: "네이버 검색" }).click();
  await survey.getByRole("button", { name: "다음" }).click();

  const usefulness = page.getByRole("region", { name: "이번 리포트는 얼마나 도움이 됐나요?" });
  await usefulness.getByRole("radio", { name: /5.*매우 도움이 됐어요/ }).click();
  await usefulness.getByRole("radio", { name: "꼭 다시 이용하고 싶어요" }).click();
  await usefulness.getByRole("button", { name: "다음" }).click();

  const retention = page.getByRole("region", { name: "다시 찾고 싶어지는 경험은 무엇인가요?" });
  await retention.getByRole("radio", { name: "매일 짧게 보는 오늘의 흐름" }).click();
  await retention.getByRole("radio", { name: "한 달에 한 번" }).click();
  await retention.getByRole("button", { name: "다음" }).click();

  const review = page.getByRole("region", { name: "마지막으로 답변을 확인해 주세요" });
  await expect(review).toContainText("네이버 검색");
  await expect(review).toContainText("한 달에 한 번");
  await review.getByRole("button", { name: "설문 제출하기" }).click();
  await expect(page.getByRole("region", { name: "답변이 저장되었습니다" })).toContainText(
    "예시 화면에서는 서버에 저장하지 않습니다.",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
