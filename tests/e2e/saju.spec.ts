import { expect, test, type Page } from "@playwright/test";
import axe from "axe-core";
import { resolveProductPricing } from "../../src/core/product-prices";

const pricing = resolveProductPricing();

async function answerIntake(page: Page, options: { hour?: string; focus?: string; question?: string; typedQuestion?: string; submit?: boolean } = {}) {
  await page.locator("#saju-readingName").fill("결이");
  await page.getByRole("button", { name: /다음/ }).click();
  await page.getByRole("radio", { name: "여성" }).click();
  await page.getByRole("button", { name: /다음/ }).click();
  await page.locator("#saju-birthDate").fill("1994-11-04");
  await page.getByRole("button", { name: /다음/ }).click();
  await page.locator("#saju-birthHour").selectOption(options.hour ?? "사시");
  await page.getByRole("button", { name: /다음/ }).click();
  await page.getByRole("radio", { name: options.focus ?? "돈", exact: true }).click();
  await page.getByRole("button", { name: /다음/ }).click();
  await page.getByRole("button", { name: options.question ?? "언제쯤 돈이 모일까요?", exact: true }).click();
  if (options.typedQuestion) await page.locator("#saju-concern").fill(options.typedQuestion);
  const consent = page.getByRole("checkbox");
  await consent.check();
  if (options.submit !== false) await page.getByRole("button", { name: /무료 풀이 보기/ }).click();
}

test("six questions lead to free chapters before any fee", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ko/saju");
  await expect(page.locator(".saju-intake-heading h1")).toBeVisible();
  const portrait = await page.locator(".saju-intake-heading img").boundingBox();
  expect(portrait?.width).toBe(64);
  expect(portrait?.height).toBe(64);
  await expect(page.locator("#saju-readingName")).toBeInViewport();
  await expect(page.getByText("1/6단계")).toBeVisible();
  await page.getByRole("button", { name: /다음/ }).click();
  await expect(page.locator(".saju-story-bubble")).toContainText("손님,");
  await expect(page.locator(".saju-story-bubble")).not.toContainText("손님님");
  await page.getByRole("button", { name: "이전 단계" }).click();
  await answerIntake(page);

  await expect(page.locator(".saju-story-chapter")).toHaveText("서막");
  await page.getByRole("button", { name: "다음 챕터" }).click();
  await expect(page.locator(".saju-story-pillar")).toHaveCount(4);
  await page.getByRole("button", { name: "다음 챕터" }).click();
  await expect(page.locator(".saju-story-stages li")).toHaveCount(3);
  await expect(page.locator(".saju-story-evidence").first()).toContainText("📐 근거");
  await page.getByRole("button", { name: "다음 챕터" }).click();
  // 1994-11-04: 1+9+9+4+1+1+0+4 = 29 → 2+9 = 11, a master number kept as is.
  await expect(page.locator('.saju-story-numbers [data-main="true"] dd')).toHaveText("11");
  await page.getByRole("button", { name: "다음 챕터" }).click();
  await expect(page.locator(".saju-story-pastlife")).toBeVisible({ timeout: 5_000 });
  await page.getByRole("button", { name: "다음 챕터" }).click();
  await expect(page.locator(".saju-story-meter")).toBeVisible();
  await expect(page.locator(".saju-story-share button")).toBeVisible();
  await expect(page.getByText(/태령/)).toHaveCount(0);
});

test("the fee chapter hands the chosen product to the existing checkout", async ({ page }) => {
  await page.goto("/ko/saju");
  await answerIntake(page);
  await page.getByRole("button", { name: "다음 챕터" }).click();
  await page.getByRole("button", { name: /잠긴 풀이 4개/ }).click();
  await expect(page.locator('[data-product-option="pro_30d"]')).toHaveAttribute("aria-checked", "true");
  await expect(page.locator('[data-product-option="plus_30d"]')).toContainText(pricing.prices.plus_30d.toLocaleString("ko-KR"));
  await page.locator('[data-product-option="plus_30d"]').click();
  await page.getByRole("button", { name: /원국 풀이 열기/ }).click();

  await expect(page).toHaveURL(/\/ko\/plans\?product=plus_30d$/);
  const draft = await page.evaluate(() => JSON.parse(sessionStorage.getItem("innerarc.checkoutDraft.v1") ?? "null"));
  expect(draft.name).toBe("결이");
  expect(draft.readingKind).toBe("saju_chart");
  expect(draft.focusId).toBe("money");
  expect(draft.birthTime).toBe("10:30");
});

test("an unknown birth time leaves the hour pillar empty instead of inventing one", async ({ page }) => {
  await page.goto("/ko/saju");
  await answerIntake(page, { hour: "unknown" });
  await page.getByRole("button", { name: "다음 챕터" }).click();
  await expect(page.getByText("시주는 비워두었습니다")).toBeVisible();
});

for (const entry of [
  { focus: "일 · 사업", question: "사업을 시작해도 될까요?", title: "사업을 시작하기 전, 먼저 확인해요", word: "고객" },
  { focus: "사람 · 연애", question: "이 사람과 계속 가도 될까요?", title: "마음보다, 반복되는 행동을 봐요", word: "약속" },
  { focus: "몸과 마음", question: "요즘 왜 이렇게 지칠까요?", title: "지친 이유부터 차근차근 살펴봐요", word: "의료진" },
]) {
  test(`free chapters start with the selected concern: ${entry.focus}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/ko/saju");
    await answerIntake(page, entry);
    const reading = page.getByTestId("free-concern-reading");
    await expect(reading).toBeVisible();
    await expect(reading.getByRole("heading")).toHaveText(entry.title);
    await expect(reading).toContainText(entry.question);
    await expect(reading).toContainText(entry.word);
    await expect(reading.locator("dt")).toHaveCount(3);
    await expect(reading.getByRole("heading")).toBeInViewport();
    for (const width of [360, 430]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    }
    if (entry.focus === "일 · 사업") {
      await page.addScriptTag({ content: axe.source });
      const issues = await page.evaluate(async () => {
        const result = await (window as unknown as { axe: typeof axe }).axe.run('[data-testid="free-concern-reading"]');
        return result.violations.filter(v => v.impact === "critical" || v.impact === "serious").map(v => v.id);
      });
      expect(issues).toEqual([]);
    }
    expect(page.url()).not.toContain(encodeURIComponent(entry.question));
    expect(await page.evaluate(() => Object.values(sessionStorage).join(" "))).not.toContain(entry.question);
    expect(errors).toEqual([]);
  });
}

test("English free business guidance answers the question before general chapters", async ({ page }) => {
  await page.goto("/en/saju");
  await page.getByRole("button", { name: /Next/ }).click();
  await page.getByRole("radio", { name: "Female", exact: true }).click();
  await page.getByRole("button", { name: /Next/ }).click();
  await page.locator("#saju-birthDate").fill("1994-11-04");
  await page.getByRole("button", { name: /Next/ }).click();
  await page.locator("#saju-birthHour").selectOption("unknown");
  await page.getByRole("button", { name: /Next/ }).click();
  await page.getByRole("radio", { name: "Work", exact: true }).click();
  await page.getByRole("button", { name: /Next/ }).click();
  await page.getByRole("button", { name: "Should I start a business?", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /See my free reading/ }).click();
  const reading = page.getByTestId("free-concern-reading");
  await expect(reading).toContainText("potential customer");
  await expect(reading.getByRole("heading")).toHaveText("Check the need before starting a business");
});

test("urgent safety concerns do not lead into symbolic chapters or a paid offer", async ({ page }) => {
  await page.goto("/ko/saju");
  await answerIntake(page, { focus: "일 · 사업", question: "사업을 시작해도 될까요?", typedQuestion: "사업이 힘들어서 죽고 싶어요" });
  await expect(page.getByTestId("free-concern-reading")).toHaveAttribute("role", "alert");
  await expect(page.locator('a[href="tel:109"]')).toBeVisible();
  await expect(page.locator('a[href="tel:988"]')).toBeVisible();
  await expect(page.locator(".saju-story-rnav")).toHaveCount(0);
  await expect(page.locator("#saju-fee")).toHaveCount(0);
});

test("changing the category clears only a chosen example and preserves typed wording", async ({ page }) => {
  await page.goto("/ko/saju");
  await answerIntake(page, { focus: "일 · 사업", question: "사업을 시작해도 될까요?", submit: false });
  await page.getByRole("button", { name: "이전 단계" }).click();
  await page.getByRole("radio", { name: "사람 · 연애", exact: true }).click();
  await page.getByRole("button", { name: /다음/ }).click();
  await expect(page.locator("#saju-concern")).toHaveValue("");
  await page.locator("#saju-concern").fill("이 사람과 계속 가도 될까요?");
  await page.getByRole("button", { name: "이전 단계" }).click();
  await page.getByRole("radio", { name: "돈", exact: true }).click();
  await page.getByRole("button", { name: /다음/ }).click();
  await expect(page.locator("#saju-concern")).toHaveValue("이 사람과 계속 가도 될까요?");
});
