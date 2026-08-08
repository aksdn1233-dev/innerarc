import { describe, expect, it } from "vitest";

import {
  labelAdviceItem,
  labelAdviceItems,
  labelFormattedAdviceBody,
} from "@/server/reports/advice-subject";

describe("report advice subject labels", () => {
  it("adds a specific Korean subject before standalone advice", () => {
    expect(labelAdviceItem("연락과 약속의 반복을 확인합니다.", "ko", "growth"))
      .toBe("연애·관계: 연락과 약속의 반복을 확인합니다.");
    expect(labelAdviceItem("현금 보존선을 정합니다.", "ko", "growth"))
      .toBe("금전: 현금 보존선을 정합니다.");
  });

  it("uses the selected domain when the sentence has no domain keyword", () => {
    expect(labelAdviceItem("오늘 확인 가능한 사실 하나를 기록하세요.", "ko", "love"))
      .toBe("연애·관계: 오늘 확인 가능한 사실 하나를 기록하세요.");
  });

  it("does not add a second label", () => {
    expect(labelAdviceItems(["관계: 이미 붙은 항목"], "ko", "love"))
      .toEqual(["관계: 이미 붙은 항목"]);
  });

  it("keeps numbering before the subject in situation sections", () => {
    expect(labelFormattedAdviceBody("1. 약속을 확인합니다.\n\n2. 위협이 있으면 중단합니다.", "ko", "love"))
      .toBe("1. 연애·관계: 약속을 확인합니다.\n\n2. 건강·안전: 위협이 있으면 중단합니다.");
  });
});
