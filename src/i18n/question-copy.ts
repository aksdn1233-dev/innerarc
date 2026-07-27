import type { Locale } from "./config";

export type QuestionCopy = {
  eyebrow: string;
  headline: string;
  intro: string;
  roomLabel: string;
  roomPrompt: string;
  questionLabel: string;
  questionPlaceholder: string;
  categoryLabel: string;
  categories: Readonly<Record<string, string>>;
  modeLabel: string;
  randomMode: string;
  manualMode: string;
  manualIntro: string;
  selectCard: string;
  manualError: string;
  spreadLabel: string;
  oneCard: string;
  threeCards: string;
  reversals: string;
  draw: string;
  symbolicContinue: string;
  safetyTitle: string;
  urgentTitle: string;
  realityFirst: string;
  urgentGuidance: string;
  resultTitle: string;
  resultIntro: string;
  upright: string;
  reversed: string;
  realityChecks: string;
  realityItems: readonly [string, string, string];
  combination: string;
  audit: string;
  auditHelp: string;
  source: string;
  engineSource: string;
  manualSource: string;
  saveReading: string;
  savedReading: string;
  historyTitle: string;
  noHistory: string;
  storageChoice: string;
  storageWarning: string;
  loadHistory: string;
  clearHistory: string;
  exportHistory: string;
  openReading: string;
  deleteReading: string;
  newQuestion: string;
  disclaimer: string;
  nav: readonly [string, string, string, string, string];
};

const ko: QuestionCopy = {
  roomLabel: "카드를 펼치는 자리",
  roomPrompt: "질문을 잠시 내려놓고, 카드가 보여주는 관점을 천천히 살펴보세요.",
  resultIntro: "미래의 정답이 아니라, 지금 놓치기 쉬운 관점을 펼쳐봅니다.",
  auditHelp: "카드가 임의로 바뀌지 않았는지 확인할 수 있는 기술 기록입니다.",
  eyebrow: "질문형 타로",
  headline: "정답보다,\n확인할 질문을 찾는 시간",
  intro: "카드는 무작위로 뽑히며 AI가 원하는 카드를 고르지 않습니다. 상징을 현실의 조건과 나란히 놓고 살펴보세요.",
  questionLabel: "지금 살펴보고 싶은 질문",
  questionPlaceholder: "예: 새 역할을 선택하기 전에 무엇을 확인해야 할까?",
  categoryLabel: "질문 영역",
  categories: {
    work: "일·사업",
    love: "연애",
    money: "돈",
    relationship: "관계",
    emotion: "감정",
    daily_choice: "오늘의 선택",
    free: "자유 질문",
  },
  modeLabel: "카드 가져오기",
  randomMode: "앱에서 무작위 추첨",
  manualMode: "실제 카드 직접 입력",
  manualIntro: "직접 뽑은 카드와 방향을 그대로 입력합니다. 앱이 카드를 바꾸거나 시드를 만든 것처럼 표시하지 않습니다.",
  selectCard: "카드 선택",
  manualError: "스프레드 수에 맞춰 서로 다른 실제 카드를 선택해 주세요.",
  spreadLabel: "카드 수",
  oneCard: "1장 · 초점",
  threeCards: "3장 · 맥락과 다음 단계",
  reversals: "역방향 포함",
  draw: "카드 펼치기",
  symbolicContinue: "현실 안내를 확인했고, 상징적 성찰로 계속",
  safetyTitle: "먼저 현실 정보를 확인하세요",
  urgentTitle: "지금은 카드보다 안전이 우선입니다",
  realityFirst: "이 질문은 의료·법률·재정의 중요한 판단과 관련될 수 있습니다. 자격 있는 전문가와 실제 문서·수치·위험 조건을 먼저 확인하세요. 카드는 감정과 질문을 정리하는 범위에서만 사용할 수 있습니다.",
  urgentGuidance: "즉각적인 자해나 폭력 위험이 있다면 혼자 있지 말고 지역 응급기관 또는 위기지원 기관에 지금 연락하고, 믿을 수 있는 사람에게 현재 상황을 알려주세요. 이 흐름에서는 카드를 뽑지 않습니다.",
  resultTitle: "이번 성찰의 카드",
  upright: "정방향",
  reversed: "역방향",
  realityChecks: "현실 확인사항",
  realityItems: [
    "이 선택을 지지하거나 반박하는 실제 사실은 무엇인가?",
    "되돌릴 수 있는 가장 작은 다음 행동은 무엇인가?",
    "결과를 언제, 어떤 기준으로 다시 확인할 것인가?",
  ],
  combination: "카드 조합에서 보이는 구조",
  audit: "추첨 감사 정보",
  source: "출처",
  engineSource: "감사 가능한 앱 추첨",
  manualSource: "사용자 직접 입력",
  saveReading: "이 리딩 저장",
  savedReading: "저장됨",
  historyTitle: "저장한 리딩",
  noHistory: "아직 저장한 리딩이 없습니다.",
  storageChoice: "이 기기에 리딩 기록을 보관합니다. (선택)",
  storageWarning: "질문은 민감할 수 있습니다. 공용 기기에서는 사용하지 마세요.",
  loadHistory: "기기 기록 불러오기",
  clearHistory: "리딩 기록 모두 지우기",
  exportHistory: "JSON 내보내기",
  openReading: "다시 보기",
  deleteReading: "삭제",
  newQuestion: "새 질문 보기",
  disclaimer: "카드는 미래를 확정하거나 결정을 대신하지 않습니다. 해석의 개인 관련성은 실제 경험과 결과로 확인하세요.",
  nav: ["홈", "나", "관계", "질문", "성장"],
};

const en: QuestionCopy = {
  eyebrow: "Question tarot",
  headline: "Look for what to verify,\nnot a fixed answer",
  intro: "Cards are randomly drawn; AI does not choose a convenient card. Place the symbolism beside real-world conditions.",
  roomLabel: "A place to lay out the cards",
  roomPrompt: "Set the question down for a moment. Notice what each card brings into view.",
  questionLabel: "What would you like to examine?",
  questionPlaceholder: "e.g. What should I verify before choosing a new role?",
  categoryLabel: "Question area",
  categories: {
    work: "Work & business",
    love: "Love",
    money: "Money",
    relationship: "Relationships",
    emotion: "Emotions",
    daily_choice: "Today's choice",
    free: "Open question",
  },
  modeLabel: "Card source",
  randomMode: "Auditable app draw",
  manualMode: "Enter physical cards",
  manualIntro: "Enter the cards and orientations you drew yourself. The app never replaces them or pretends it generated a seed.",
  selectCard: "Choose card",
  manualError: "Choose a different physical card for every position in the spread.",
  spreadLabel: "Number of cards",
  oneCard: "1 card · focus",
  threeCards: "3 cards · context and next step",
  reversals: "Include reversals",
  draw: "Draw cards",
  symbolicContinue: "I checked the real-world guidance; continue symbolically",
  safetyTitle: "Check real-world information first",
  urgentTitle: "Safety comes before cards right now",
  realityFirst: "This may involve an important medical, legal, or financial decision. Check qualified advice, documents, numbers, and risk conditions first. Cards can only help organize feelings and questions.",
  urgentGuidance: "If there is an immediate risk of self-harm or violence, do not stay alone: contact local emergency or crisis support now and tell someone you trust what is happening. This flow will not draw cards.",
  resultTitle: "Cards for this reflection",
  resultIntro: "Not a fixed future, but angles you may be overlooking now.",
  upright: "Upright",
  reversed: "Reversed",
  realityChecks: "Reality checks",
  realityItems: [
    "What real evidence supports or challenges this choice?",
    "What is the smallest reversible next action?",
    "When and by what criterion will you review the outcome?",
  ],
  combination: "Structure visible across the cards",
  audit: "Draw audit",
  auditHelp: "A technical record that lets you verify the cards were not silently changed.",
  source: "Source",
  engineSource: "Auditable app draw",
  manualSource: "Entered by user",
  saveReading: "Save this reading",
  savedReading: "Saved",
  historyTitle: "Saved readings",
  noHistory: "No readings have been saved yet.",
  storageChoice: "Keep reading history on this device. (Optional)",
  storageWarning: "Questions may be sensitive. Do not use this option on a shared device.",
  loadHistory: "Load device history",
  clearHistory: "Clear all reading history",
  exportHistory: "Export JSON",
  openReading: "Open",
  deleteReading: "Delete",
  newQuestion: "Ask a new question",
  disclaimer: "Cards do not fix the future or make decisions for you. Check personal relevance against lived experience and outcomes.",
  nav: ["Home", "Me", "Relations", "Questions", "Growth"],
};

export const questionCopy: Record<Locale, QuestionCopy> = { ko, en };
