import type { ChangedAction, ReviewType } from "@/core/reviews";
import type { Locale } from "@/i18n/config";

/**
 * Every label a reviewer or a visitor reads. The type labels are the sensitive ones:
 * they are what a stranger uses to decide how much the review is worth, so each says
 * exactly what was verified and nothing more.
 */
export const reviewTypeLabels: Record<Locale, Record<ReviewType, string>> = {
  ko: {
    verified_purchaser: "결제 확인된 구매자",
    beta_participant: "출시 전 테스트 참여자",
    free_reading: "무료 리딩 참여자",
  },
  en: {
    verified_purchaser: "Verified purchaser",
    beta_participant: "Pre-launch tester",
    free_reading: "Free reading participant",
  },
};

export const changedActionLabels: Record<Locale, Record<ChangedAction, string>> = {
  ko: {
    changed: "계획했던 행동을 바꿨어요",
    considering: "바꿀지 고민하게 됐어요",
    unchanged: "그대로 진행했어요",
    too_early: "아직 판단하기 이릅니다",
  },
  en: {
    changed: "I changed a planned action",
    considering: "It made me reconsider one",
    unchanged: "I kept my plan as it was",
    too_early: "Too early to say",
  },
};

/**
 * Preset anonymous names. A reviewer can also type their own short nickname; the empty
 * value is the "show nothing at all" choice and renders as the anonymous fallback.
 */
export type AnonymousNamePreset = Readonly<{ label: string; value: string }>;

export const anonymousNamePresets: Record<Locale, readonly AnonymousNamePreset[]> = {
  ko: [
    { label: "익명", value: "익명" },
    { label: "표시하지 않음", value: "" },
    { label: "리딩 이용자", value: "리딩 이용자" },
    { label: "조용한 독자", value: "조용한 독자" },
  ],
  en: [
    { label: "Anonymous", value: "Anonymous" },
    { label: "Show nothing", value: "" },
    { label: "A reader", value: "A reader" },
    { label: "Quiet reader", value: "Quiet reader" },
  ],
};

/** What a blank display name renders as on a public surface. */
export const anonymousFallbackName: Record<Locale, string> = {
  ko: "익명",
  en: "Anonymous",
};

export const reviewCopy = {
  ko: {
    eyebrow: "리딩 후기",
    title: "이번 리딩, 실제로 도움이 됐나요?",
    intro:
      "네 가지 질문에 답해 주시면 다음 리포트를 고치는 데 그대로 씁니다. 공개 여부는 따로 선택하며, 답변만 남기고 공개하지 않아도 됩니다.",
    open: "후기 남기기",
    close: "접기",
    wanted: "1. 무엇을 알고 싶어서 리딩을 보셨나요?",
    wantedHelp: "결정을 앞두고 있었는지, 반복되는 상황이 있었는지 편하게 적어주세요.",
    useful: "2. 가장 도움이 되었거나 구체적이라고 느낀 부분은 무엇인가요?",
    usefulHelp: "어떤 문장이나 항목이 그랬는지 적어주시면 가장 도움이 됩니다.",
    hard: "3. 이해하기 어려웠던 부분이 있나요? (선택)",
    hardHelp: "표현이 모호했거나 근거가 부족해 보인 곳을 알려주세요.",
    changed: "4. 리딩을 보고 계획했던 행동이 달라졌나요?",
    consentTitle: "공개 후기로 사용해도 될까요? (선택)",
    consentLabel: "홈페이지에 공개하는 것에 동의합니다.",
    consentHelp:
      "동의하지 않아도 후기는 그대로 접수됩니다. 동의하신 경우에도 운영자 확인 후에만 공개되며, 언제든 공개를 철회할 수 있습니다.",
    displayName: "공개될 때 표시할 이름",
    displayNameHelp: "16자 이내. 비워두면 ‘익명’으로 표시됩니다. 연락처나 숫자 나열은 저장되지 않습니다.",
    displayNamePreset: "자주 쓰는 표시",
    hideContext: "어떤 상품을 봤는지와 1번 답변은 공개하지 않기",
    hideContextHelp: "선택하시면 공개 화면에는 2·3·4번 답변만 표시됩니다.",
    privacyNote:
      "생년월일, 입력하신 고민 내용, 결제 정보, 리포트 본문은 후기에 포함되지 않으며 공개 화면에도 나타나지 않습니다.",
    submit: "후기 보내기",
    sending: "보내는 중…",
    doneTitle: "후기가 접수되었습니다.",
    donePublic: "공개 동의를 남기셨습니다. 운영자 확인 후 공개되며, 아래에서 언제든 철회할 수 있습니다.",
    donePrivate: "공개하지 않는 후기로 접수되었습니다. 운영자만 확인합니다.",
    alreadyTitle: "이미 후기를 남기셨습니다.",
    statusPending: "운영자 확인 대기 중",
    statusApproved: "공개 중",
    statusRejected: "공개하지 않음",
    statusWithdrawn: "공개 철회됨",
    withdraw: "공개 철회하기",
    restore: "다시 공개 요청하기",
    withdrawn: "공개가 철회되었습니다.",
    restored: "공개 요청이 접수되었습니다. 운영자 확인 후 다시 표시됩니다.",
    failed: "후기를 보내지 못했습니다. 잠시 후 다시 시도해 주세요.",
    invalid: "1번과 2번 답변을 5자 이상 적어주세요.",
    nameInvalid: "표시 이름에는 연락처나 숫자 나열을 넣을 수 없습니다.",
    unavailable: "지금은 후기를 받을 수 없습니다. 잠시 후 다시 시도해 주세요.",
  },
  en: {
    eyebrow: "Reading feedback",
    title: "Did this reading actually help?",
    intro:
      "Four questions. The answers go straight into fixing the next report. Publishing is a separate choice — you can answer without making anything public.",
    open: "Leave feedback",
    close: "Close",
    wanted: "1. What did you want to understand?",
    wantedHelp: "A decision you were facing, or a situation that kept repeating.",
    useful: "2. What felt most useful or most specific?",
    usefulHelp: "Naming the sentence or section that did it helps the most.",
    hard: "3. Was anything hard to understand? (Optional)",
    hardHelp: "Wording that stayed vague, or a claim that looked unsupported.",
    changed: "4. Did the reading change an action you had planned?",
    consentTitle: "May we publish this as a review? (Optional)",
    consentLabel: "I agree to this being shown publicly on the site.",
    consentHelp:
      "Your feedback is recorded either way. Even with consent, nothing appears until an operator reviews it, and you can withdraw consent at any time.",
    displayName: "Name to show if published",
    displayNameHelp: "Up to 16 characters. Left blank it shows as “Anonymous”. Contact details and digit strings are not stored.",
    displayNamePreset: "Common choices",
    hideContext: "Do not show which product I bought or my answer to question 1",
    hideContextHelp: "With this on, only answers 2, 3, and 4 appear publicly.",
    privacyNote:
      "Your birth date, the concern you typed, payment details, and the report itself are not part of a review and never appear publicly.",
    submit: "Send feedback",
    sending: "Sending…",
    doneTitle: "Your feedback was received.",
    donePublic: "You consented to publication. It appears only after an operator approves it, and you can withdraw below at any time.",
    donePrivate: "Recorded as private feedback. Only the operator sees it.",
    alreadyTitle: "You have already left feedback.",
    statusPending: "Waiting for operator review",
    statusApproved: "Published",
    statusRejected: "Not published",
    statusWithdrawn: "Consent withdrawn",
    withdraw: "Withdraw public consent",
    restore: "Request publication again",
    withdrawn: "Public consent has been withdrawn.",
    restored: "Publication requested. It reappears only after an operator approves it.",
    failed: "The feedback could not be sent. Please try again shortly.",
    invalid: "Please answer questions 1 and 2 with at least a few words.",
    nameInvalid: "The display name cannot contain contact details or digit strings.",
    unavailable: "Feedback cannot be received right now. Please try again shortly.",
  },
} as const;

export type ReviewCopy = (typeof reviewCopy)[Locale];
