import type { FitRating, ReflectionCategory, RealityCheckStatus } from "@/core/reality-check";
import type { Locale } from "./config";

export interface RealityCheckCopy {
  brandTagline: string;
  eyebrow: string;
  headline: string;
  intro: string;
  formTitle: string;
  handoffLoaded: string;
  handoffSource: string;
  handoffPrivacy: string;
  category: string;
  categories: Record<ReflectionCategory, string>;
  question: string;
  currentState: string;
  interpretation: string;
  choice: string;
  actionPlan: string;
  reviewDate: string;
  save: string;
  invalid: string;
  storageChoice: string;
  storageWarning: string;
  loadDevice: string;
  clearDevice: string;
  exportData: string;
  recordsTitle: string;
  empty: string;
  status: Record<RealityCheckStatus, string>;
  reviewAction: string;
  deleteAction: string;
  outcomeTitle: string;
  outcome: string;
  fitLabel: string;
  fit: Record<FitRating, string>;
  learning: string;
  saveReview: string;
  cancel: string;
  reportTitle: string;
  reportMonthLabel: string;
  reviewedCount: string;
  repeatedlyRelevant: string;
  uncertain: string;
  notRelevant: string;
  insufficient: string;
  legacyMonthNote: string;
  none: string;
  privacyNote: string;
  ruleVersion: string;
  nav: readonly [string, string, string, string, string];
}

const ko: RealityCheckCopy = {
  brandTagline: "현실 확인 루프",
  eyebrow: "해석 다음의 기록",
  headline: "선택을 저장하고,\n실제 결과로 다시 보기",
  intro: "숫자나 카드가 맞았는지를 증명하지 않습니다. 당시 해석이 내 현실에 얼마나 관련 있었는지 확인하고 다음 선택 기준을 다듬습니다.",
  formTitle: "새 현실 확인 만들기",
  handoffLoaded: "선택한 관계 환경을 일회성 초안으로 불러왔습니다.",
  handoffSource: "관계 환경 성찰에서 이어짐",
  handoffPrivacy: "생년월일과 이름은 전달되지 않았습니다. 내용을 수정하고 확인일을 선택한 뒤 저장해야 기록이 만들어집니다.",
  category: "영역",
  categories: { work: "일·사업", relationship: "관계", money: "돈", emotion: "감정", daily_choice: "오늘의 선택", growth: "성장", other: "기타" },
  question: "당시 질문",
  currentState: "당시 상태",
  interpretation: "받은 해석 또는 핵심 가설",
  choice: "내가 내린 선택",
  actionPlan: "작은 행동 계획",
  reviewDate: "결과 확인일",
  save: "현실 확인 저장",
  invalid: "필수 내용을 확인하고 결과 확인일을 오늘 이후의 실제 날짜로 입력해 주세요.",
  storageChoice: "이 기기에 기록을 보관합니다. (선택)",
  storageWarning: "공용 기기에서는 선택하지 마세요. 브라우저 저장은 암호화된 계정 보관함이 아닙니다.",
  loadDevice: "이 기기의 기록 불러오기",
  clearDevice: "기기 기록 모두 지우기",
  exportData: "JSON 내보내기",
  recordsTitle: "저장한 선택",
  empty: "아직 저장한 현실 확인이 없습니다.",
  status: { planned: "확인 예정", due: "결과 확인 가능", reviewed: "결과 회고 완료" },
  reviewAction: "결과 회고하기",
  deleteAction: "삭제",
  outcomeTitle: "실제 결과 기록",
  outcome: "무슨 일이 있었나요?",
  fitLabel: "개인 관련성",
  fit: { accurate: "정확함", mostly_relevant: "대체로 맞음", partly_relevant: "일부 맞음", hard_to_tell: "판단하기 어려움", not_relevant: "맞지 않음" },
  learning: "다음 선택에 반영할 점",
  saveReview: "결과 저장",
  cancel: "취소",
  reportTitle: "이번 달 패턴 요약",
  reportMonthLabel: "보고서 월",
  reviewedCount: "회고한 기록",
  repeatedlyRelevant: "반복적으로 관련 있었던 영역",
  uncertain: "더 관찰할 영역",
  notRelevant: "맞지 않았던 영역",
  insufficient: "아직 반복 패턴을 말하기에는 결과 기록이 적습니다.",
  legacyMonthNote: "현지 월이 없어 UTC 월을 사용한 이전 기록",
  none: "없음",
  privacyNote: "기본 상태에서는 현재 탭의 메모리에만 보관됩니다. 이 기기 저장은 직접 선택한 경우에만 사용합니다.",
  ruleVersion: "요약 규칙",
  nav: ["홈", "나", "관계", "질문", "성장"],
};

const en: RealityCheckCopy = {
  brandTagline: "Reality Check Loop",
  eyebrow: "What happens after an interpretation",
  headline: "Save the choice.\nReturn to the real outcome.",
  intro: "This does not prove whether numbers or cards were right. It checks how relevant an interpretation was to your lived experience and sharpens your next decision criteria.",
  formTitle: "Create a Reality Check",
  handoffLoaded: "Your selected relationship setting was loaded as a one-time draft.",
  handoffSource: "Continued from relationship-setting reflection",
  handoffPrivacy: "No birth date or name was transferred. Edit the fields and choose a review date; no record exists until you save.",
  category: "Area",
  categories: { work: "Work & business", relationship: "Relationships", money: "Money", emotion: "Emotion", daily_choice: "Today's choice", growth: "Growth", other: "Other" },
  question: "Your question at the time",
  currentState: "Your state at the time",
  interpretation: "Interpretation or core hypothesis",
  choice: "The choice you made",
  actionPlan: "Small action plan",
  reviewDate: "Outcome review date",
  save: "Save Reality Check",
  invalid: "Check the required details and choose a real review date on or after today.",
  storageChoice: "Keep these records on this device. (Optional)",
  storageWarning: "Do not use this on a shared device. Browser storage is not an encrypted account vault.",
  loadDevice: "Load records from this device",
  clearDevice: "Clear all device records",
  exportData: "Export JSON",
  recordsTitle: "Saved choices",
  empty: "No Reality Checks have been saved yet.",
  status: { planned: "Planned", due: "Ready to review", reviewed: "Outcome reviewed" },
  reviewAction: "Review outcome",
  deleteAction: "Delete",
  outcomeTitle: "Record the real outcome",
  outcome: "What happened?",
  fitLabel: "Personal relevance",
  fit: { accurate: "Accurate", mostly_relevant: "Mostly relevant", partly_relevant: "Partly relevant", hard_to_tell: "Hard to tell", not_relevant: "Not relevant" },
  learning: "What will you carry into the next choice?",
  saveReview: "Save outcome",
  cancel: "Cancel",
  reportTitle: "This month's pattern summary",
  reportMonthLabel: "Report month",
  reviewedCount: "Reviewed records",
  repeatedlyRelevant: "Repeatedly relevant areas",
  uncertain: "Areas to observe further",
  notRelevant: "Areas that did not fit",
  insufficient: "There are not enough reviewed outcomes to call anything a repeated pattern yet.",
  legacyMonthNote: "Older records grouped by their saved UTC month",
  none: "None",
  privacyNote: "By default, records stay only in this tab's memory. Device storage is used only when you explicitly choose it.",
  ruleVersion: "Summary rule",
  nav: ["Home", "Me", "Relations", "Questions", "Growth"],
};

export const realityCheckCopy: Record<Locale, RealityCheckCopy> = { ko, en };
