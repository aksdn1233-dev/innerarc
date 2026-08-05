import { expect, test } from "@playwright/test";
import { E2E_ORIGIN } from "./test-origin";

function localMonthOffset(offset: number): string {
  const date = new Date();
  date.setDate(15);
  date.setMonth(date.getMonth() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

test("Korean guest reaches a deterministic first result", async ({ page }) => {
  await page.goto("/ko");
  // The opening screen shows the character and two actions and nothing else, so the
  // heading is present for the page outline and for a screen reader but not displayed.
  await expect(page.getByRole("heading", {
    level: 1,
    name: "왜 나는 같은 선택을 반복할까요?",
  })).toBeAttached();
  await expect(page.getByRole("link", { name: "내 패턴 확인하기" })).toBeVisible();
  await expect(page.getByRole("link", { name: "먼저 무료로 확인" })).toBeVisible();
  await expect(page.locator(".report-preview")).toContainText(
    "실제 후기가 아닌 리포트 구성 예시입니다.",
  );
  await expect(page.locator(".preview-reading")).toHaveCount(3);
  await expect(page.locator(".question-bubble")).toHaveCount(0);
  await expect(page.locator(".reading-method-points span")).toHaveCount(3);
  await expect(page.getByRole("button", { name: /상세 리딩 받기/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /심층 리딩 받기/ })).toBeVisible();
  await expect(page.locator(".payment-reassurance")).toContainText("1회 결제 · 자동 결제 없음 · 비회원 열람 가능");

  await page.goto("/ko/profile");
  await expect(page).toHaveURL(`${E2E_ORIGIN}/ko/profile`);
  await expect(page.getByRole("heading", { name: "내 흐름 확인하기" })).toBeAttached();
  await page.locator("#birthDate").fill("1994-11-04");
  await page.locator("#name").fill("Minji Kim");
  await page.getByText("개인정보 처리 안내를 확인했습니다.").click();
  await page.getByRole("button", { name: "내 핵심 패턴 보기" }).click();
  // The reading is calculated in the browser behind dynamic imports, so on a cold CI
  // runner it can arrive later than the default expect window — this failed three times
  // in a row there and passed on a re-run with nothing changed. Waiting for the region the
  // app focuses on submit gates the assertions below on the result existing, rather than
  // on how fast the runner happened to be. A flaky check here blocks the deploy.
  await page.waitForSelector("#result", { timeout: 30_000 });
  await expect(page.getByText("대표 아키타입 · 정의")).toBeVisible();
  await expect(page.locator(".number-tile").first()).toContainText("11");
  await page.getByText("계산 근거 보기").click();
  await expect(page.getByText("1 + 9 + 9 + 4 + 1 + 1 + 0 + 4 = 29 → 11")).toBeVisible();
});

test("mobile home has no overflow and the sticky payment bar yields to the form", async ({ page }) => {
  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/ko");
    await expect(page.getByRole("heading", { level: 1, name: "왜 나는 같은 선택을 반복할까요?" })).toBeAttached();
    await expect(page.getByRole("link", { name: "내 패턴 확인하기" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);

    // The opening screen carries the same action at thumb height, so the sticky bar stays
    // out of the way there instead of covering it, and appears once the hero is passed.
    await expect(page.locator(".mobile-purchase-bar")).toHaveCount(0);
    await page.locator("#products").scrollIntoViewIfNeeded();
    await expect(page.locator(".mobile-purchase-bar")).toBeVisible();

    await page.locator("#onboarding").scrollIntoViewIfNeeded();
    await expect(page.locator(".mobile-purchase-bar")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  }
});

test("English page keeps the same calculated core meaning", async ({ page }) => {
  await page.goto("/en");
  // Same as the Korean opening screen: the heading is in the document, not on it.
  await expect(page.getByRole("heading", { level: 1, name: "Why do I keep making the same choices?" })).toBeAttached();
  await expect(page.getByRole("link", { name: "See my patterns" })).toBeVisible();
  await page.goto("/en/profile");
  await expect(page).toHaveURL(`${E2E_ORIGIN}/en/profile`);
  await page.locator("#birthDate").fill("1994-11-04");
  await page.getByText("I have read the privacy notice.").click();
  await page.getByRole("button", { name: "Show my core pattern" }).click();
  await expect(page.getByText("Core archetype · Justice")).toBeVisible();
  await expect(page.locator(".number-tile").first()).toContainText("11");
  await page.getByText("Open the eight-domain deep profile").click();
  await expect(page.locator(".domain-card")).toHaveCount(8);
  await expect(page.locator(".career-grid article")).toHaveCount(3);
  await expect(page.locator(".deep-profile")).not.toContainText("%");
  await page.getByText("Privacy-safe share card", { exact: true }).click();
  await expect(page.locator(".share-card-preview")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download SVG" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("innerarc-core_profile.svg");
});

test("onboarding focus, concern, depth, and AI consent create a local context layer", async ({ page }) => {
  const privateConcern = "PRIVATE-QUESTION-ONLY-IN-PAGE-MEMORY";
  const externalRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== E2E_ORIGIN) externalRequests.push(url.href);
  });

  await page.goto("/en/profile");
  await page.locator("#birthDate").fill("1994-11-04");
  await page.locator("#name").fill("Minji Kim");
  await page.getByText("Relationships", { exact: true }).click();
  await page.locator("#concern").fill(privateConcern);
  await page.getByText("Deep", { exact: true }).click();
  await page.getByText("I have read the privacy notice.").click();
  await page.getByText("I agree to use this input for personalization.", { exact: false }).click();
  await page.getByRole("button", { name: "Show my core pattern" }).click();

  const context = page.locator(".onboarding-context-card");
  await expect(context).toBeVisible();
  await expect(context).toContainText("Your selected focus · Relationships");
  await expect(context).toContainText(privateConcern);
  await expect(context).toContainText("No provider request was made");
  await expect(page.locator(".deep-profile")).toHaveAttribute("open", "");
  await expect(context.getByRole("link")).toHaveAttribute("href", "/en/relationship");
  expect(page.url()).not.toContain(privateConcern);
  expect(externalRequests).toEqual([]);

  const browserStorage = await page.evaluate(() => {
    const values: string[] = [];
    for (const store of [localStorage, sessionStorage]) {
      for (let index = 0; index < store.length; index += 1) {
        const key = store.key(index);
        if (key) values.push(`${key}:${store.getItem(key)}`);
      }
    }
    return values.join("\n");
  });
  expect(browserStorage).not.toContain(privateConcern);

  await page.getByText("Privacy-safe share card", { exact: true }).click();
  await expect(page.locator(".share-card-preview")).toBeVisible();
  await expect(page.locator(".share-card-preview")).not.toContainText(privateConcern);
});

test("result offers claim-free accessory and music directions with a closed shop", async ({ page }) => {
  await page.goto("/en/profile");
  await page.locator("#birthDate").fill("1994-11-04");
  await page.getByText("I have read the privacy notice.").click();
  await page.getByRole("button", { name: "Show my core pattern" }).click();
  await page.getByText("Style and sound directions that may fit").click();

  await expect(page.locator(".accessory-card")).toHaveCount(3);
  await expect(page.locator(".music-card")).toHaveCount(3);
  await expect(page.locator(".lifestyle-profile")).toContainText("Accessories do not provide luck");
  await expect(page.locator(".lifestyle-profile")).toContainText("Music directions are not treatment");

  const shopLink = page.getByRole("link", { name: "Preview shop categories" });
  await expect(shopLink).toHaveAttribute("href", "/en/shop");
  await Promise.all([
    page.waitForURL("**/en/shop"),
    shopLink.click(),
  ]);
  await expect(page.getByRole("status")).toHaveText("Opening later");
  await expect(page.locator(".shop-category-grid article")).toHaveCount(3);
  await expect(page.getByText("Purchasing unavailable")).toHaveCount(3);
  await expect(page.locator("main")).not.toContainText(/add to cart|checkout|\$\d|₩\d/i);
  expect(page.url()).toBe(`${E2E_ORIGIN}/en/shop`);
});

test("invalid dates cannot be submitted through the engine flow", async ({ page }) => {
  await page.goto("/en/profile");
  await page.locator("#birthDate").evaluate((element: HTMLInputElement) => {
    element.value = "2023-02-29";
  });
  await page.getByText("I have read the privacy notice.").click();
  await page.getByRole("button", { name: "Show my core pattern" }).click();
  await expect(page.locator(".form-actions .error")).toContainText("real date");
});

test("question tarot draws three auditable cards for an ordinary question", async ({ page }) => {
  await page.goto("/en/question");
  await page.locator("#tarot-question").fill("What should I verify before choosing a new role?");
  await page.getByRole("button", { name: "Draw cards" }).click();
  await expect(page.locator(".tarot-card")).toHaveCount(3);
  await page.getByText("Draw audit").click();
  await expect(page.getByText("mulberry32-fisher-yates-1.0.0")).toBeVisible();
});

test("physical tarot cards remain manual and saved history is session-only by default", async ({ page }) => {
  await page.goto("/en/question");
  await page.locator("#tarot-question").fill("What pattern should I reflect on today?");
  await page.getByText("Enter physical cards", { exact: true }).click();
  await page.locator("#manual-orientation-1").selectOption("reversed");
  await page.getByRole("button", { name: "Draw cards" }).click();
  await expect(page.locator(".tarot-card")).toHaveCount(3);
  await page.getByText("Draw audit").click();
  await expect(page.getByText("Entered by user")).toBeVisible();
  await page.getByRole("button", { name: "Save this reading" }).click();
  await expect(page.locator(".history-list article")).toHaveCount(1);
  expect(await page.evaluate(() => localStorage.getItem("innerarc:tarot-history:v1"))).toBeNull();
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.locator(".history-list article")).toHaveCount(0);
});

test("high-risk self-harm language does not draw cards", async ({ page }) => {
  await page.goto("/en/question");
  await page.locator("#tarot-question").fill("I want to kill myself. What do the cards say?");
  await page.locator("#question-form button[type='submit']").click();
  const safetyPanel = page.locator("#tarot-safety");
  await expect(safetyPanel).toBeVisible();
  await expect(safetyPanel).toBeFocused();
  const safetySnapshot = await safetyPanel.evaluate((element) => ({
    text: element.textContent ?? "",
    hrefs: Array.from(element.querySelectorAll("a")).map((anchor) => anchor.getAttribute("href")),
    tarotCardCount: element.ownerDocument.querySelectorAll(".tarot-card").length,
  }));
  expect(safetySnapshot.text).toContain("Safety comes before cards right now");
  expect(safetySnapshot.text).toContain("We do not infer your country from language.");
  expect(safetySnapshot.hrefs).toEqual(expect.arrayContaining(["tel:109", "tel:988"]));
  expect(safetySnapshot.hrefs.filter((href) => href?.startsWith("https://"))).toHaveLength(2);
  expect(safetySnapshot.tarotCardCount).toBe(0);
});

test("romantic insight shows meeting contexts without probability claims", async ({ page }) => {
  await page.goto("/en/relationship");
  await page.locator("#relationship-birth-date").fill("1994-11-04");
  await page.locator("#relationship-name").fill("Minji Kim");
  await page.getByRole("button", { name: "Show my romantic pattern" }).click();
  await expect(page.locator(".meeting-card")).toHaveCount(3);
  await expect(page.getByText("Future spouse portrait — reflection hypothesis")).toBeVisible();
  await expect(page.locator("#relationship-result")).not.toContainText("%");
  await expect(page.locator("#relationship-result")).not.toContainText("probability");
  await page.getByText("Privacy-safe share card", { exact: true }).click();
  await expect(page.locator(".share-card-preview")).toBeVisible();
  await expect(page.locator(".share-card-preview")).not.toContainText("Minji");
  await expect(page.locator(".share-card-preview")).not.toContainText("1994-11-04");
});

test("a selected relationship setting becomes an editable one-time Reality Check draft", async ({ page }) => {
  const handoffKey = "innerarc:reality-check-handoff:v1";
  await page.goto("/en/relationship");
  await page.locator("#relationship-birth-date").fill("1994-11-04");
  await page.locator("#relationship-name").fill("Minji Kim");
  await page.getByRole("button", { name: "Show my romantic pattern" }).click();

  expect(await page.evaluate((key) => sessionStorage.getItem(key), handoffKey)).toBeNull();
  const selectedTitle = await page.locator(".meeting-card h3").first().innerText();
  await page.locator(".context-handoff").first().click();

  await expect(page).toHaveURL(`${E2E_ORIGIN}/en/reality-check`);
  await expect(page.getByText(
    "Your selected relationship setting was loaded as a one-time draft.",
  )).toBeVisible();
  await expect(page.locator("#reality-category")).toHaveValue("relationship");
  await expect(page.locator(".reality-record")).toHaveCount(0);
  await expect(page.locator("#reality-interpretation")).toHaveValue(new RegExp(selectedTitle));
  await expect.poll(
    () => page.evaluate((key) => sessionStorage.getItem(key), handoffKey),
  ).toBeNull();

  const prefilledText = await page.locator(
    "#reality-question, #reality-state, #reality-interpretation, #reality-choice, #reality-action",
  ).evaluateAll((elements) => elements.map((element) => (element as HTMLTextAreaElement).value).join(" "));
  expect(prefilledText).not.toContain("1994-11-04");
  expect(prefilledText).not.toContain("Minji Kim");
  expect(prefilledText).not.toContain("Life Path");

  await page.locator("#reality-action").fill(
    "I will try one recurring activity and review the actual interaction.",
  );
  const minimumDate = await page.locator("#reality-review-date").getAttribute("min");
  await page.locator("#reality-review-date").fill(minimumDate!);
  await page.getByRole("button", { name: "Save Reality Check" }).click();
  await expect(page.locator(".reality-record")).toHaveCount(1);
  await expect(page.locator(".reality-record")).toContainText(
    "I will try one recurring activity and review the actual interaction.",
  );
});

test("relationship handoff stays put when session storage is unavailable", async ({ page }) => {
  const handoffKey = "innerarc:reality-check-handoff:v1";
  await page.addInitScript((key) => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem(storageKey: string, value: string) {
      if (this === sessionStorage && storageKey === key) {
        throw new DOMException("Session storage is unavailable", "QuotaExceededError");
      }
      return originalSetItem.call(this, storageKey, value);
    };
  }, handoffKey);

  await page.goto("/en/relationship");
  await page.locator("#relationship-birth-date").fill("1994-11-04");
  await page.getByRole("button", { name: "Show my romantic pattern" }).click();
  await page.locator(".context-handoff").first().click();

  await expect(page).toHaveURL(`${E2E_ORIGIN}/en/relationship`);
  await expect(page.locator(".meeting-contexts .error")).toContainText(
    "could not be created safely",
  );
  expect(await page.evaluate((key) => sessionStorage.getItem(key), handoffKey)).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("innerarc:reality-check:v1"))).toBeNull();
});

test("romantic insight reads saved outcome reviews only after explicit use", async ({ page }) => {
  const baseRecord = {
    question: "What should I verify?",
    currentState: "I want more clarity.",
    interpretation: "Observe repeated behavior.",
    choice: "Wait for another conversation.",
    actionPlan: "Ask about expectations.",
    reviewDate: "2026-07-23",
    createdAt: "2026-07-22T00:00:00.000Z",
    ruleVersion: "reality-check-1.0.0",
  };
  const payload = {
    version: 1,
    records: [
      {
        ...baseRecord,
        id: "stored-relationship-1",
        clientRequestId: "create:stored-relationship-1",
        category: "relationship",
        updatedAt: "2026-07-24T10:00:00.000Z",
        review: {
          clientRequestId: "review:stored-relationship-1",
          outcome: "Pace became clearer.",
          fit: "accurate",
          learning: "Ask about pace earlier.",
          reviewedAt: "2026-07-24T10:00:00.000Z",
        },
      },
      {
        ...baseRecord,
        id: "stored-relationship-2",
        clientRequestId: "create:stored-relationship-2",
        category: "relationship",
        updatedAt: "2026-07-25T10:00:00.000Z",
        review: {
          clientRequestId: "review:stored-relationship-2",
          outcome: "Follow-through matched the conversation.",
          fit: "mostly_relevant",
          learning: "Compare words with follow-through.",
          reviewedAt: "2026-07-25T10:00:00.000Z",
        },
      },
      {
        ...baseRecord,
        id: "stored-work-1",
        clientRequestId: "create:stored-work-1",
        category: "work",
        updatedAt: "2026-07-26T10:00:00.000Z",
        review: {
          clientRequestId: "review:stored-work-1",
          outcome: "The work interpretation did not fit.",
          fit: "not_relevant",
          learning: "This work note must stay out of relationship context.",
          reviewedAt: "2026-07-26T10:00:00.000Z",
        },
      },
    ],
  };
  await page.addInitScript(({ storageKey, storedPayload }) => {
    const trackedWindow = window as typeof window & { realityCheckReads: number };
    trackedWindow.realityCheckReads = 0;
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function getItem(key: string) {
      if (key === storageKey) trackedWindow.realityCheckReads += 1;
      return originalGetItem.call(this, key);
    };
    localStorage.setItem(storageKey, JSON.stringify(storedPayload));
  }, { storageKey: "innerarc:reality-check:v1", storedPayload: payload });

  await page.goto("/en/relationship");
  await page.locator("#relationship-birth-date").fill("1994-11-04");
  await page.getByRole("button", { name: "Show my romantic pattern" }).click();
  await expect(page.locator(".meeting-card h3")).toHaveCount(3);
  const contextsBefore = await page.locator(".meeting-card h3").allTextContents();
  await expect(page.locator("#relationship-outcome-context")).toHaveCount(0);
  expect(await page.evaluate(() =>
    (window as typeof window & { realityCheckReads: number }).realityCheckReads,
  )).toBe(0);

  await page.getByRole("button", { name: "Use saved relationship outcomes" }).click();
  await expect(page.locator("#relationship-outcome-context")).toBeFocused();
  await expect(page.getByText("Repeatedly relevant", { exact: true })).toBeVisible();
  await expect(page.locator(".outcome-counts")).toContainText("2");
  await expect(page.locator(".outcome-learnings")).toContainText("Ask about pace earlier.");
  await expect(page.locator("#relationship-outcome-context")).not.toContainText("work note");
  expect(await page.locator(".meeting-card h3").allTextContents()).toEqual(contextsBefore);
  const layout = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    scrollX: window.scrollX,
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth + 1);
  expect(layout.scrollX).toBe(0);
  expect(await page.evaluate(() =>
    (window as typeof window & { realityCheckReads: number }).realityCheckReads,
  )).toBe(1);
});

test("two-person compatibility shows operating conditions without fate scoring", async ({ page }) => {
  await page.goto("/en/compatibility");
  await page.locator("#compatibility-birth-a").fill("1994-11-04");
  await page.locator("#compatibility-name-a").fill("Minji Kim");
  await page.locator("#compatibility-birth-b").fill("1988-03-17");
  await page.locator("#compatibility-name-b").fill("Alex Lee");
  await page.locator("#compatibility-type").selectOption("cofounder");
  await page.getByText("I will use the other person's birth date privately").click();
  await page.getByRole("button", { name: "Compare relationship patterns" }).click();
  await expect(page.locator(".compatibility-card")).toHaveCount(8);
  await expect(page.getByText("Money & responsibility", { exact: true })).toBeVisible();
  await expect(page.getByText("Decision authority", { exact: true })).toBeVisible();
  await expect(page.locator("#compatibility-result")).not.toContainText("%");
  await expect(page.locator("#compatibility-result")).not.toContainText("destined");
  await page.getByText("Privacy-safe share card", { exact: true }).click();
  await expect(page.locator(".share-card-preview")).not.toContainText("Minji");
  await expect(page.locator(".share-card-preview")).not.toContainText("Alex");
  await expect(page.locator(".share-card-preview")).not.toContainText("1994-11-04");
  await expect(page.locator(".share-card-preview")).not.toContainText("1988-03-17");
});

test("celebrity comparison uses sourced birth-date structures without identity percentages", async ({ page }) => {
  await page.goto("/en/celebrity");
  await page.locator("#celebrity-birth-date").fill("1994-11-04");
  await page.getByRole("button", { name: "Compare public structures" }).click();
  await expect(page.locator(".celebrity-card")).toHaveCount(5);
  await expect(page.getByText("Similarity based on the numerology structure of public birth dates")).toBeVisible();
  await expect(page.locator(".celebrity-card a").first()).toHaveAttribute("href", /^https:\/\//);
  await expect(page.locator("#celebrity-result")).not.toContainText("%");
  await page.locator("#celebrity-field").selectOption("sports");
  await page.getByRole("button", { name: "Compare public structures" }).click();
  await expect(page.locator(".celebrity-card")).toHaveCount(2);
});

test("Reality Check preserves a choice and reviews personal relevance without default persistence", async ({ page }) => {
  await page.goto("/en/reality-check");
  await page.locator("#reality-question").fill("What should I verify before committing?");
  await page.locator("#reality-state").fill("I feel excited and rushed.");
  await page.locator("#reality-interpretation").fill("Check consistent behavior before deciding.");
  await page.locator("#reality-choice").fill("Wait for one more conversation.");
  await page.locator("#reality-action").fill("Ask about expectations and boundaries.");
  await expect(page.locator("#reality-review-date")).toHaveAttribute("min", /^\d{4}-\d{2}-\d{2}$/);
  const minimumDate = await page.locator("#reality-review-date").getAttribute("min");
  await page.locator("#reality-review-date").fill(minimumDate!);
  await page.getByRole("button", { name: "Save Reality Check" }).click();

  await expect(page.locator(".reality-record")).toHaveCount(1);
  expect(await page.evaluate(() => localStorage.getItem("innerarc:reality-check:v1"))).toBeNull();

  await page.getByRole("button", { name: "Review outcome" }).click();
  await page.locator("#reality-outcome").fill("The conversation clarified a mismatch in timing.");
  await page.getByText("Mostly relevant", { exact: true }).click();
  await page.locator("#reality-learning").fill("Ask about timing earlier next time.");
  await page.getByRole("button", { name: "Save outcome" }).click();

  await expect(page.locator(".reality-record")).toContainText("Outcome reviewed");
  await expect(page.locator(".pattern-report")).toContainText("1");
  await expect(page.locator(".pattern-report")).toContainText("not enough reviewed outcomes");
  await expect(page.locator("main")).not.toContainText("prediction accuracy");

  await page.locator(".storage-card input[type='checkbox']").check({ force: true });
  const persistedReview = await page.evaluate(() => {
    const payload = JSON.parse(localStorage.getItem("innerarc:reality-check:v1")!);
    return {
      reviewedMonth: payload.records[0].review.reviewedMonth,
      localMonth: [
        new Date().getFullYear(),
        String(new Date().getMonth() + 1).padStart(2, "0"),
      ].join("-"),
    };
  });
  expect(persistedReview.reviewedMonth).toBe(persistedReview.localMonth);
});

test("Reality Check revisits recorded local months without writing navigation state", async ({ page }) => {
  const previousMonth = localMonthOffset(-1);
  const legacyMonth = localMonthOffset(-2);
  const record = (
    id: string,
    month: string,
    category: "work" | "relationship",
    includeLocalMonth: boolean,
  ) => ({
    id,
    clientRequestId: `create:${id}-request`,
    category,
    question: `Question for ${id}`,
    currentState: "A bounded test state.",
    interpretation: "A symbolic hypothesis to verify.",
    choice: "Observe before concluding.",
    actionPlan: "Record one observable result.",
    reviewDate: `${month}-02`,
    createdAt: `${month}-01T10:00:00.000Z`,
    updatedAt: `${month}-15T10:00:00.000Z`,
    ruleVersion: "reality-check-1.0.0",
    review: {
      clientRequestId: `review:${id}-request`,
      outcome: `Outcome for ${id}`,
      fit: category === "work" ? "mostly_relevant" : "not_relevant",
      learning: `Learning for ${id}`,
      reviewedAt: `${month}-15T10:00:00.000Z`,
      ...(includeLocalMonth ? { reviewedMonth: month } : {}),
    },
  });
  const payload = {
    version: 1,
    records: [
      record("prior-local", previousMonth, "work", true),
      record("legacy-utc", legacyMonth, "relationship", false),
    ],
  };
  await page.addInitScript((storedPayload) => {
    localStorage.setItem("innerarc:reality-check:v1", JSON.stringify(storedPayload));
  }, payload);

  await page.goto("/en/reality-check");
  await page.getByRole("button", { name: "Load records from this device" }).click();
  const options = await page.locator("#report-month option").evaluateAll((items) =>
    items.map((item) => (item as HTMLOptionElement).value));
  expect(options).toEqual([...options].sort((left, right) => right.localeCompare(left)));
  expect(options).toEqual(expect.arrayContaining([previousMonth, legacyMonth]));

  const before = await page.evaluate(() => localStorage.getItem("innerarc:reality-check:v1"));
  await page.locator("#report-month").selectOption(previousMonth);
  await expect(page.locator(".pattern-report")).toContainText(previousMonth);
  await expect(page.locator(".pattern-report")).toContainText("Work & business");
  await expect(page.locator(".pattern-report")).not.toContainText("Older records grouped");

  await page.locator("#report-month").selectOption(legacyMonth);
  await expect(page.locator(".pattern-report")).toContainText(legacyMonth);
  await expect(page.locator(".pattern-report")).toContainText(
    "Older records grouped by their saved UTC month: 1",
  );
  const after = await page.evaluate(() => localStorage.getItem("innerarc:reality-check:v1"));
  expect(after).toBe(before);
  await expect(page).toHaveURL(/\/en\/reality-check$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("guest privacy center saves explicitly, exports, and deletes all device data", async ({ page }) => {
  await page.goto("/en/me");
  expect(await page.evaluate(() => localStorage.getItem("innerarc:privacy-preferences:v1"))).toBeNull();

  await page.locator("#me-time-zone").fill("America/New_York");
  await expect(page.locator("#me-time-zone")).toHaveValue("America/New_York");
  await page.getByText("I have read the privacy notice.", { exact: false }).click();
  await page.getByText("Privacy-minimized product analytics", { exact: false }).click();
  await expect(page.locator("#me-time-zone")).toHaveValue("America/New_York");
  await page.getByRole("button", { name: "Save settings on this device" }).click();
  await expect(page.getByRole("status")).toContainText("saved on this device");

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("innerarc:privacy-preferences:v1")!));
  expect(stored).toMatchObject({
    locale: "en",
    timeZone: "America/New_York",
    consents: { productAnalytics: true, modelTraining: false, marketing: false },
  });
  expect(JSON.stringify(stored)).not.toContain("birthDate");
  expect(JSON.stringify(stored)).not.toContain("name");

  await page.getByRole("button", { name: "Inspect saved data" }).click();
  await expect(page.locator(".count-grid")).toContainText("Preferences");
  await expect(page.locator(".count-grid strong").first()).toHaveText("1");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export all JSON" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^innerarc-device-data-\d{4}-\d{2}-\d{2}\.json$/);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete all device data" }).click();
  await expect(page.getByRole("status")).toContainText("was deleted");
  expect(await page.evaluate(() => ({
    preferences: localStorage.getItem("innerarc:privacy-preferences:v1"),
    tarot: localStorage.getItem("innerarc:tarot-history:v1"),
    reality: localStorage.getItem("innerarc:reality-check:v1"),
  }))).toEqual({ preferences: null, tarot: null, reality: null });
});

test("privacy, terms, and support publish contacts while disclosing unresolved launch fields", async ({ page }) => {
  await page.goto("/en/profile");
  await expect(page.getByRole("link", { name: "Read the privacy information" })).toHaveAttribute("href", "/en/privacy");
  await page.getByRole("link", { name: "Read the privacy information" }).click();
  await expect(page.getByText("Pre-operation notice · transfer details and legal review pending")).toBeVisible();
  await expect(page.getByText("Supabase handles the authentication email", { exact: false })).toBeVisible();
  await expect(page.getByText("For payment, InnerArc retains the order ID", { exact: false })).toBeVisible();
  await expect(page.getByText("Support and privacy email: qkrehgus5886@naver.com")).toBeVisible();
  await page.getByRole("link", { name: "Terms of use" }).click();
  await expect(page.getByText("Pre-release terms · mail-order registration details pending")).toBeVisible();
  await expect(page.getByText("Current products are the Detailed reading and Premium in-depth reading", { exact: false })).toBeVisible();
  await expect(page.getByText("The former Core reading is temporarily unavailable.", { exact: false })).toBeVisible();
  await expect(page.getByText("within seven days after the email is received", { exact: false })).toBeVisible();
  await page.goto("/en/support");
  await expect(page.getByRole("link", { name: "010-8706-1938" })).toHaveAttribute("href", "tel:01087061938");
  await expect(page.getByRole("link", { name: "qkrehgus5886@naver.com" })).toHaveAttribute(
    "href",
    "mailto:qkrehgus5886@naver.com",
  );
  await page.goto("/en/plans");
  await expect(page.getByText("Payments remain closed until merchant review", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pay now" }).first()).toBeDisabled();
});
