import type { Locale } from "./config";

export interface MeCopy {
  brandTagline: string;
  eyebrow: string;
  title: string;
  intro: string;
  guestTitle: string;
  guestBody: string;
  providerNote: string;
  preferencesTitle: string;
  preferencesBody: string;
  language: string;
  timeZone: string;
  timeZoneHelp: string;
  privacyRequired: string;
  aiPersonalization: string;
  modelTraining: string;
  productAnalytics: string;
  marketing: string;
  rawJournalRetention: string;
  consentNote: string;
  save: string;
  saved: string;
  privacyError: string;
  timeZoneError: string;
  deviceTitle: string;
  deviceBody: string;
  inspect: string;
  preferencesCount: string;
  tarotCount: string;
  realityCount: string;
  exportAll: string;
  deleteAll: string;
  deleteConfirm: string;
  deleted: string;
  exportNote: string;
  nav: readonly string[];
}

const ko: MeCopy = {
  brandTagline: "개인 패턴 인텔리전스",
  eyebrow: "나 · 개인정보 관리",
  title: "내 설정과 기록을 내가 통제합니다",
  intro: "현재는 게스트 모드입니다. 이 브라우저에 명시적으로 저장한 설정·타로 기록·Reality Check만 여기서 확인하고 내보내거나 삭제할 수 있습니다.",
  guestTitle: "게스트 모드",
  guestBody: "현재 로그인된 계정이 없습니다. 기본 분석 입력은 저장되지 않으며, 기기 저장을 직접 켠 기록만 남습니다.",
  providerNote: "Supabase 이메일 로그인이 구성되어 있습니다. 로그인 후 명시적으로 동기화한 기록만 소유자 전용 서버 저장소로 전송됩니다.",
  preferencesTitle: "언어·시간대·선택 동의",
  preferencesBody: "선택 동의는 각각 독립적입니다. 저장 버튼을 누를 때만 이 기기에 기록되며, 외부 AI·분석·마케팅 서비스가 비활성인 현재는 외부 전송이 발생하지 않습니다.",
  language: "언어",
  timeZone: "IANA 시간대",
  timeZoneHelp: "예: Asia/Seoul, America/New_York, Europe/London",
  privacyRequired: "개인정보 처리 안내를 확인했습니다. (필수)",
  aiPersonalization: "내 기록을 다음 AI 해석의 개인 관련성 향상에 사용 (선택)",
  modelTraining: "내 데이터를 모델 학습에 사용 (선택, 기본 꺼짐)",
  productAnalytics: "개인정보를 제외한 제품 사용 분석 (선택)",
  marketing: "마케팅 메시지 수신 (선택)",
  rawJournalRetention: "저널 원문 장기 보관 (선택, 기본 꺼짐)",
  consentNote: "모델 학습과 마케팅은 AI 개인화에 포함되지 않으며 별도 동의입니다. 언제든 모두 끄고 다시 저장하거나 기기 데이터를 삭제할 수 있습니다.",
  save: "이 기기에 설정 저장",
  saved: "설정이 이 기기에 저장됐습니다.",
  privacyError: "필수 개인정보 안내를 먼저 확인해 주세요.",
  timeZoneError: "유효한 IANA 시간대를 입력해 주세요.",
  deviceTitle: "이 기기의 데이터 권리",
  deviceBody: "내보내기는 현재 브라우저의 검증된 로컬 기록만 JSON으로 만듭니다. 삭제는 이 기기의 InnerArc 설정과 저장 기록을 즉시 제거하며 복구할 수 없습니다.",
  inspect: "저장 데이터 확인",
  preferencesCount: "설정",
  tarotCount: "타로 기록",
  realityCount: "Reality Check",
  exportAll: "전체 JSON 내보내기",
  deleteAll: "이 기기 데이터 모두 삭제",
  deleteConfirm: "이 브라우저에 저장된 InnerArc 설정과 기록을 모두 삭제할까요? 이 작업은 복구할 수 없습니다.",
  deleted: "이 기기의 InnerArc 저장 데이터를 삭제했습니다.",
  exportNote: "내보낸 파일에는 질문·결과처럼 민감한 내용이 포함될 수 있습니다. 안전한 위치에 보관하세요.",
  nav: ["홈", "나", "관계", "질문", "성장"],
};

const en: MeCopy = {
  brandTagline: "Personal pattern intelligence",
  eyebrow: "Me · Privacy controls",
  title: "You control your settings and records",
  intro: "You are currently in guest mode. This page can inspect, export, or delete only the preferences, tarot history, and Reality Checks you explicitly saved in this browser.",
  guestTitle: "Guest mode",
  guestBody: "No account is currently signed in. Core analysis inputs are not stored; only records for which you explicitly enabled device storage remain.",
  providerNote: "Supabase email sign-in is configured. After sign-in, only records you explicitly synchronize are sent to owner-scoped server storage.",
  preferencesTitle: "Language, time zone, and optional consent",
  preferencesBody: "Every optional consent is independent. Choices are written only when you press save. With external AI, analytics, and marketing providers disabled, nothing here is transmitted externally.",
  language: "Language",
  timeZone: "IANA time zone",
  timeZoneHelp: "Examples: Asia/Seoul, America/New_York, Europe/London",
  privacyRequired: "I have read the privacy notice. (Required)",
  aiPersonalization: "Use my records to improve personal relevance in later AI interpretations (Optional)",
  modelTraining: "Use my data for model training (Optional, off by default)",
  productAnalytics: "Privacy-minimized product analytics (Optional)",
  marketing: "Receive marketing messages (Optional)",
  rawJournalRetention: "Retain raw journal text long-term (Optional, off by default)",
  consentNote: "Model training and marketing are not included in AI personalization and require separate choices. You can switch everything off and save again, or delete all device data at any time.",
  save: "Save settings on this device",
  saved: "Settings were saved on this device.",
  privacyError: "Please acknowledge the required privacy notice first.",
  timeZoneError: "Enter a valid IANA time zone.",
  deviceTitle: "Your data rights on this device",
  deviceBody: "Export creates JSON from validated local records in this browser. Delete immediately removes this device's InnerArc settings and saved records and cannot be undone.",
  inspect: "Inspect saved data",
  preferencesCount: "Preferences",
  tarotCount: "Tarot readings",
  realityCount: "Reality Checks",
  exportAll: "Export all JSON",
  deleteAll: "Delete all device data",
  deleteConfirm: "Delete every InnerArc preference and record saved in this browser? This cannot be undone.",
  deleted: "InnerArc data saved in this browser was deleted.",
  exportNote: "The exported file may contain sensitive questions and outcomes. Store it somewhere safe.",
  nav: ["Home", "Me", "Relationships", "Questions", "Growth"],
};

export const meCopy: Record<Locale, MeCopy> = { ko, en };
