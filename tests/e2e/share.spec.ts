import { expect, test, type Download, type Page } from "@playwright/test";
import { E2E_ORIGIN } from "./test-origin";

async function openCoreShare(page: Page, locale: "ko" | "en" = "en") {
  await page.goto(`/${locale}/profile`);
  await page.locator("#birthDate").fill("1994-11-04");
  const privacyConsent = page.locator('input[name="privacyRequired"]');
  await expect(privacyConsent).toBeVisible();
  await privacyConsent.evaluate((element: HTMLInputElement) => element.click());
  await expect(privacyConsent).toBeChecked();
  await page.getByRole("button", {
    name: locale === "ko" ? "내 핵심 패턴 보기" : "Show my core pattern",
  }).click();
  await expect(page.locator(".number-tile").first()).toContainText("11");
  const sharePanel = page.locator(".share-panel");
  await sharePanel.locator("summary").evaluate((summary: HTMLElement) => summary.click());
  await expect(sharePanel).toHaveAttribute("open", "");
}

async function downloadBytes(download: Download): Promise<Buffer> {
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

test("local PNG and SVG downloads are portable and side-effect free", async ({ page }) => {
  const unexpectedRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== E2E_ORIGIN) unexpectedRequests.push(url.href);
  });
  await openCoreShare(page);
  const storageBefore = await page.evaluate(() => [localStorage.length, sessionStorage.length]);

  const pngPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PNG" }).click();
  const pngDownload = await pngPromise;
  expect(pngDownload.suggestedFilename()).toBe("taeryeongdang-core_profile.png");
  const png = await downloadBytes(pngDownload);
  expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(png.readUInt32BE(16)).toBe(1080);
  expect(png.readUInt32BE(20)).toBe(1350);
  await expect(page.getByRole("status")).toHaveText("The PNG was downloaded.");

  const svgPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download SVG" }).click();
  const svgDownload = await svgPromise;
  expect(svgDownload.suggestedFilename()).toBe("taeryeongdang-core_profile.svg");
  expect((await downloadBytes(svgDownload)).toString("utf8")).toContain(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"',
  );
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual(storageBefore);
  expect(unexpectedRequests).toEqual([]);
});

test("native sharing receives one generic PNG and duplicate clicks are locked", async ({ page }) => {
  test.slow();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: (data: ShareData) => data.files?.length === 1 && data.files[0].type === "image/png",
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        const target = window as typeof window & {
          __innerArcShare?: {
            calls: number;
            keys: string[];
            title?: string;
            name: string;
            type: string;
            size: number;
            signature: number[];
          };
        };
        const file = data.files![0];
        const signature = Array.from(new Uint8Array(await file.arrayBuffer()).slice(0, 8));
        const priorCalls = target.__innerArcShare?.calls ?? 0;
        await new Promise((resolve) => setTimeout(resolve, 100));
        target.__innerArcShare = {
          calls: priorCalls + 1,
          keys: Object.keys(data).sort(),
          title: data.title,
          name: file.name,
          type: file.type,
          size: file.size,
          signature,
        };
      },
    });
  });
  await openCoreShare(page);

  const shareButton = page.getByRole("button", { name: "Share image" });
  await shareButton.evaluate((button: HTMLButtonElement) => {
    button.click();
    button.click();
  });
  await expect(page.getByRole("status")).toHaveText(
    "The image was handed to your selected share surface.",
  );
  const envelope = await page.evaluate(() => (
    window as typeof window & { __innerArcShare?: Record<string, unknown> }
  ).__innerArcShare);
  expect(envelope).toMatchObject({
    calls: 1,
    keys: ["files", "title"],
    title: "태령당",
    name: "taeryeongdang-core_profile.png",
    type: "image/png",
    signature: [137, 80, 78, 71, 13, 10, 26, 10],
  });
  expect(envelope?.size).toEqual(expect.any(Number));
  expect(envelope).not.toHaveProperty("text");
  expect(envelope).not.toHaveProperty("url");
});

test("unsupported sharing downloads once while cancellation downloads nothing", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "canShare", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
  });
  await openCoreShare(page);
  let downloadCount = 0;
  page.on("download", () => {
    downloadCount += 1;
  });

  const fallbackDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Share image" }).click();
  expect((await fallbackDownload).suggestedFilename()).toBe("taeryeongdang-core_profile.png");
  await expect(page.getByRole("status")).toHaveText(
    "File sharing is unavailable on this device, so the PNG was downloaded.",
  );
  expect(downloadCount).toBe(1);

  await page.evaluate(() => {
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: () => {
        throw new DOMException("capability failure", "NotAllowedError");
      },
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async () => undefined,
    });
  });
  const capabilityFailureDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Share image" }).click();
  expect((await capabilityFailureDownload).suggestedFilename()).toBe("taeryeongdang-core_profile.png");
  await expect(page.getByRole("status")).toHaveText(
    "File sharing is unavailable on this device, so the PNG was downloaded.",
  );
  expect(downloadCount).toBe(2);

  await page.evaluate(() => {
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: () => true,
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async () => {
        throw new DOMException("cancelled", "AbortError");
      },
    });
  });
  await page.getByRole("button", { name: "Share image" }).click();
  await expect(page.getByRole("status")).toHaveText("Sharing was cancelled.");
  await page.waitForTimeout(100);
  expect(downloadCount).toBe(2);
});

test("Korean share controls disclose the external app boundary", async ({ page }) => {
  await openCoreShare(page, "ko");
  await expect(page.getByRole("button", { name: "이미지 공유" })).toBeVisible();
  await expect(page.getByRole("button", { name: "PNG 다운로드" })).toBeVisible();
  await expect(page.getByRole("button", { name: "SVG 다운로드" })).toBeVisible();
  await expect(page.locator(".share-external-note")).toContainText(
    "선택한 앱에는 해당 앱의 개인정보 처리방침이 적용됩니다.",
  );
});
