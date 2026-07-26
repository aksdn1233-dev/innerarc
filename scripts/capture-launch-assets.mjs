import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.CAPTURE_BASE_URL ?? "http://127.0.0.1:3000";
const outputDirectory = resolve("artifacts/store-assets");
const packageManifest = JSON.parse(readFileSync(resolve("package.json"), "utf8"));
mkdirSync(outputDirectory, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 414, height: 896 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  locale: "ko-KR",
  colorScheme: "light",
  reducedMotion: "reduce",
});

const assets = [];

async function alignToTop(locator, offset = 24) {
  await locator.waitFor();
  await locator.evaluate((element, topOffset) => {
    window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - topOffset, behavior: "instant" });
  }, offset);
}

async function capture(name, route, prepare) {
  const page = await context.newPage();
  const unexpectedOrigins = new Set();
  page.on("request", (request) => {
    const origin = new URL(request.url()).origin;
    if (origin !== new URL(baseURL).origin) unexpectedOrigins.add(origin);
  });
  await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle" });
  if (prepare) await prepare(page);
  if (unexpectedOrigins.size) {
    throw new Error(`${name} requested unexpected origins: ${[...unexpectedOrigins].join(", ")}`);
  }
  const file = `${name}.png`;
  const screenshot = await page.screenshot({ path: resolve(outputDirectory, file), fullPage: false });
  const pixelSize = {
    width: screenshot.readUInt32BE(16),
    height: screenshot.readUInt32BE(20),
  };
  if (pixelSize.width !== 1242 || pixelSize.height !== 2688) {
    throw new Error(`${name} has unexpected PNG dimensions: ${pixelSize.width}x${pixelSize.height}`);
  }
  const dimensions = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
  assets.push({ file, route, scenario: name, cssViewport: dimensions, pixelSize });
  await page.close();
}

function syntheticOutcomePayload(locale) {
  const base = {
    question: locale === "ko" ? "관계에서 무엇을 확인할까?" : "What should I verify in this relationship?",
    currentState: locale === "ko" ? "속도를 조절하고 싶다." : "I want to choose the right pace.",
    interpretation: locale === "ko" ? "반복 행동을 확인한다." : "Observe repeated behavior.",
    choice: locale === "ko" ? "한 번 더 대화한다." : "Have one more conversation.",
    actionPlan: locale === "ko" ? "기대와 경계를 묻는다." : "Ask about expectations and boundaries.",
    reviewDate: "2026-07-23",
    createdAt: "2026-07-22T00:00:00.000Z",
    ruleVersion: "reality-check-1.0.0",
  };
  return {
    version: 1,
    records: [
      {
        ...base,
        id: "synthetic-relationship-1",
        clientRequestId: "create:synthetic-relationship-1",
        category: "relationship",
        updatedAt: "2026-07-24T10:00:00.000Z",
        review: {
          clientRequestId: "review:synthetic-relationship-1",
          outcome: locale === "ko" ? "대화 후 속도가 분명해졌다." : "The pace became clearer after the conversation.",
          fit: "accurate",
          learning: locale === "ko" ? "관계 초기에 속도를 먼저 묻기." : "Ask about pace earlier.",
          reviewedAt: "2026-07-24T10:00:00.000Z",
        },
      },
      {
        ...base,
        id: "synthetic-relationship-2",
        clientRequestId: "create:synthetic-relationship-2",
        category: "relationship",
        updatedAt: "2026-07-25T10:00:00.000Z",
        review: {
          clientRequestId: "review:synthetic-relationship-2",
          outcome: locale === "ko" ? "말과 후속 행동이 일치했다." : "Words and follow-through were consistent.",
          fit: "mostly_relevant",
          learning: locale === "ko" ? "말과 반복 행동을 함께 비교하기." : "Compare words with follow-through.",
          reviewedAt: "2026-07-25T10:00:00.000Z",
        },
      },
    ],
  };
}

async function prepareOutcomeContext(page, locale) {
  await page.evaluate((payload) => {
    localStorage.setItem("innerarc:reality-check:v1", JSON.stringify(payload));
  }, syntheticOutcomePayload(locale));
  await page.locator("#relationship-birth-date").fill("1994-11-04");
  await page.locator("form button[type='submit']").click();
  await page.getByRole("button", {
    name: locale === "ko" ? "저장한 관계 결과 불러오기" : "Use saved relationship outcomes",
  }).click();
  await alignToTop(page.locator("#relationship-outcome-context"));
}

async function prepareOnboardingContext(page) {
  await page.locator("#birthDate").fill("1994-11-04");
  await page.locator("input[name='interest'][value='relationships']").check({ force: true });
  await page.locator("input[name='depth'][value='deep']").check({ force: true });
  await page.locator("input[name='privacyRequired']").check({ force: true });
  await page.locator("form button[type='submit']").click();
  await page.locator(".onboarding-context-card").waitFor();
  await alignToTop(page.locator(".onboarding-context-card"));
}

await capture("ko-01-home", "/ko");
await capture("ko-09-onboarding-context", "/ko", async (page) => {
  await prepareOnboardingContext(page);
});
await capture("ko-02-relationship", "/ko/relationship", async (page) => {
  await page.locator("#relationship-birth-date").fill("1994-11-04");
  await page.locator("#relationship-name").fill("Minji Kim");
  await page.locator("form button[type='submit']").click();
  await page.locator("#relationship-result").waitFor();
  await alignToTop(page.locator("#meeting-contexts"));
});
await capture("ko-08-outcome-context", "/ko/relationship", async (page) => {
  await prepareOutcomeContext(page, "ko");
});
await capture("ko-03-manual-tarot", "/ko/question", async (page) => {
  await page.locator("#tarot-question").fill("새 역할을 선택하기 전에 무엇을 확인해야 할까?");
  await page.getByText("실제 카드 직접 입력", { exact: true }).click();
  await page.getByText("1장 · 초점", { exact: true }).click();
  await page.locator("#question-form button[type='submit']").click();
  await page.locator("#tarot-result").waitFor();
  await page.getByText("추첨 감사 정보", { exact: true }).click();
  await alignToTop(page.locator("#tarot-result details"));
});
await capture("ko-04-reality-check", "/ko/reality-check", async (page) => {
  await page.locator("#reality-question").fill("결정 전에 무엇을 더 확인할까?");
  await page.locator("#reality-state").fill("기대와 조급함이 함께 있다.");
  await page.locator("#reality-interpretation").fill("말보다 반복되는 행동을 확인한다.");
  await page.locator("#reality-choice").fill("한 번 더 대화한 뒤 결정한다.");
  await page.locator("#reality-action").fill("기대와 경계를 구체적으로 묻는다.");
  const minimumDate = await page.locator("#reality-review-date").getAttribute("min");
  await page.locator("#reality-review-date").fill(minimumDate);
  await page.locator("form button[type='submit']").click();
  await page.locator(".reality-record").waitFor();
  await page.locator(".reality-record footer button").first().click();
  await page.locator("#review-panel").waitFor();
  await alignToTop(page.locator("#reality-records"));
});
await capture("ko-05-privacy", "/ko/me", async (page) => {
  await page.locator(".me-preferences").scrollIntoViewIfNeeded();
});
await capture("ko-06-lifestyle", "/ko", async (page) => {
  await page.locator("#birthDate").fill("1994-11-04");
  await page.getByText("개인정보 처리 안내를 확인했습니다.", { exact: false }).click();
  await page.getByRole("button", { name: "내 핵심 패턴 보기" }).click();
  await page.getByText("나에게 맞을 수 있는 스타일과 사운드", { exact: true }).click();
  await alignToTop(page.locator(".lifestyle-group").first());
});
await capture("ko-07-shop-preview", "/ko/shop", async (page) => {
  await alignToTop(page.locator(".shop-categories"));
});
await capture("en-01-home", "/en");
await capture("en-06-onboarding-context", "/en", async (page) => {
  await prepareOnboardingContext(page);
});
await capture("en-02-relationship", "/en/relationship", async (page) => {
  await page.locator("#relationship-birth-date").fill("1994-11-04");
  await page.locator("#relationship-name").fill("Minji Kim");
  await page.locator("form button[type='submit']").click();
  await page.locator("#relationship-result").waitFor();
  await alignToTop(page.locator("#meeting-contexts"));
});
await capture("en-05-outcome-context", "/en/relationship", async (page) => {
  await prepareOutcomeContext(page, "en");
});
await capture("en-03-lifestyle", "/en", async (page) => {
  await page.locator("#birthDate").fill("1994-11-04");
  await page.getByText("I have read the privacy notice.", { exact: false }).click();
  await page.getByRole("button", { name: "Show my core pattern" }).click();
  await page.getByText("Style and sound directions that may fit", { exact: true }).click();
  await alignToTop(page.locator(".lifestyle-group").first());
});
await capture("en-04-shop-preview", "/en/shop", async (page) => {
  await alignToTop(page.locator(".shop-categories"));
});

await browser.close();

writeFileSync(resolve(outputDirectory, "manifest.json"), `${JSON.stringify({
  product: "InnerArc",
  appVersion: packageManifest.version,
  generatedAt: new Date().toISOString(),
  baseURL,
  sensitiveDataPolicy: "Synthetic inputs only; no complete birth date or name may be visible in the captured viewport.",
  assets,
}, null, 2)}\n`, "utf8");

process.stdout.write(`Captured ${assets.length} launch assets at ${outputDirectory}\n`);
