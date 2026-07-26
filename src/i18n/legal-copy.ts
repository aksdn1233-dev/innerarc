import type { Locale } from "./config";

export type LegalSection = Readonly<{
  title: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
}>;

export type LegalPageCopy = Readonly<{
  brandTagline: string;
  status: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: readonly LegalSection[];
  home: string;
  privacy: string;
  terms: string;
}>;

const sharedKo = {
  brandTagline: "개인 패턴 인텔리전스",
  home: "홈으로",
  privacy: "개인정보 처리 안내",
  terms: "이용조건",
};

const sharedEn = {
  brandTagline: "Personal pattern intelligence",
  home: "Back home",
  privacy: "Privacy information",
  terms: "Terms of use",
};

const privacyKo: LegalPageCopy = {
  ...sharedKo,
  status: "출시 전 안내 · 법률 검토 미완료",
  title: "개인정보 처리 안내",
  intro: "이 문서는 현재 InnerArc 로컬 미리보기에서 어떤 정보가 언제 저장되는지 설명합니다. 공개 서비스용 최종 개인정보처리방침이 아니며, 사업자·연락처·관할지역·외부 처리업체가 확정되기 전에는 실제 배포할 수 없습니다.",
  lastUpdated: "2026-07-23",
  sections: [
    {
      title: "현재 로컬 미리보기",
      bullets: [
        "생년월일, 선택 입력 이름, 관심사와 고민은 기본 분석 중 브라우저 메모리에서만 사용되며 새로고침하면 사라집니다.",
        "타로 기록, Reality Check, 언어·시간대·선택 동의는 사용자가 기기 저장을 직접 선택했을 때만 이 브라우저에 저장됩니다.",
        "이메일 계정, 서버 데이터베이스, 외부 AI, 분석, 마케팅, 결제 서비스는 현재 연결되어 있지 않습니다.",
      ],
    },
    {
      title: "사용 목적과 선택 동의",
      paragraphs: ["수비학 계산, 카드 기록, 자기성찰, 결과 회고, 설정 복원을 위해 필요한 범위만 처리합니다."],
      bullets: [
        "AI 개인화, 모델 학습, 제품 분석, 마케팅, 저널 원문 장기보관은 서로 독립된 선택입니다.",
        "선택 동의를 거부해도 결정론적 계산과 기본 결과를 이용할 수 있습니다.",
        "외부 서비스가 비활성인 현재는 선택 동의를 켜도 외부 전송이 발생하지 않습니다.",
      ],
    },
    {
      title: "보관·내보내기·삭제",
      bullets: [
        "게스트 저장은 이 브라우저 기기에만 남으며 공용 기기에서는 사용하지 않는 것이 안전합니다.",
        "나 탭에서 검증된 로컬 기록을 JSON으로 내보내고 InnerArc 로컬 키를 한 번에 삭제할 수 있습니다.",
        "기기 삭제는 복구할 수 없으며, 브라우저 자체 데이터 삭제도 같은 기록을 제거할 수 있습니다.",
      ],
    },
    {
      title: "타인의 정보",
      paragraphs: ["궁합을 위해 타인의 생년월일이나 이름을 입력할 때에는 사적 비교에 사용할 권한과 동의가 있는지 확인해야 합니다. 기본 게스트 비교는 저장하거나 공개하지 않으며, 공유 카드에는 타인의 이름과 생년월일을 포함하지 않습니다."],
    },
    {
      title: "AI·안전·상징 체계",
      paragraphs: ["수비학과 타로는 과학적 예측이나 진단이 아닌 자기성찰용 상징 체계입니다. 고위험 질문은 카드 답변보다 현실 정보와 전문 지원을 우선합니다. 언어로 국가를 추정하지 않으며 지역별 위기 연락처는 해당 지역에 있을 때만 사용해야 합니다."],
    },
    {
      title: "출시 전 미확정 사항",
      paragraphs: ["법적 사업자와 개인정보 연락처, 제공 국가, 최소 연령, 법적 근거, 보관기간, 국외 이전, 외부 처리업체, 민원·권리행사 절차는 아직 승인되지 않았습니다. 이 항목들이 법률 검토와 함께 확정되기 전에는 공개 출시하지 않습니다."],
    },
  ],
};

const privacyEn: LegalPageCopy = {
  ...sharedEn,
  status: "Pre-release information · legal review pending",
  title: "Privacy information",
  intro: "This page explains when the current local InnerArc preview handles or stores information. It is not the final public-service privacy notice. Production cannot launch until the controller, contact, jurisdictions, and processors are approved.",
  lastUpdated: "2026-07-23",
  sections: [
    {
      title: "Current local preview",
      bullets: [
        "Birth date, optional name, interests, and concern are used in browser memory for the current analysis and disappear on refresh.",
        "Tarot history, Reality Checks, language/time-zone preferences, and optional consents enter this browser's storage only after an explicit device-storage action.",
        "No email account, server database, external AI, analytics, marketing, or payment service is currently connected.",
      ],
    },
    {
      title: "Purpose and optional choices",
      paragraphs: ["The preview handles only what is needed for deterministic calculation, card records, reflection, outcome review, and preference restoration."],
      bullets: [
        "AI personalization, model training, product analytics, marketing, and long-term raw-journal retention are independent choices.",
        "Declining optional choices does not block deterministic calculation or the basic result.",
        "With external services disabled, enabling a choice does not currently transmit data outside this browser.",
      ],
    },
    {
      title: "Retention, export, and deletion",
      bullets: [
        "Guest storage remains on this browser device and should not be enabled on a shared device.",
        "The Me tab exports validated local records as JSON and removes every InnerArc local key in one action.",
        "Device deletion cannot be undone; clearing browser site data can also remove the records.",
      ],
    },
    {
      title: "Information about another person",
      paragraphs: ["Before entering another person's birth date or name for compatibility, confirm you may use it for a private comparison. The guest comparison is not saved or made public by default, and share cards exclude the other person's name and birth date."],
    },
    {
      title: "AI, safety, and symbolic systems",
      paragraphs: ["Numerology and tarot are reflection systems, not scientific prediction or diagnosis. High-risk questions prioritize real-world information and qualified support. Language is not used to infer location; a regional crisis contact applies only when the person is actually in that region."],
    },
    {
      title: "Unresolved pre-launch fields",
      paragraphs: ["Legal controller and privacy contact, offered jurisdictions, minimum age, lawful bases, retention periods, international transfers, processors, complaint routes, and rights-request operations are not yet approved. Public launch remains blocked until qualified review completes them."],
    },
  ],
};

const termsKo: LegalPageCopy = {
  ...sharedKo,
  status: "출시 전 이용조건 · 법률 검토 미완료",
  title: "InnerArc 이용조건",
  intro: "현재 버전은 로컬 제품 미리보기입니다. 아래 내용은 제품 경계와 안전한 사용 원칙을 설명하는 초안이며, 공개 서비스 계약이나 유료 구독 조건이 아닙니다.",
  lastUpdated: "2026-07-23",
  sections: [
    { title: "서비스 성격", paragraphs: ["InnerArc는 수비학·타로 상징과 사용자의 기록을 자기성찰에 활용합니다. 미래, 관계 성공, 성격 동일성, 질병, 법적 결과, 투자 성과를 보장하거나 과학적으로 예측하지 않습니다."] },
    { title: "전문 판단의 우선", paragraphs: ["의료·정신건강·법률·투자·범죄·폭력·자해 문제는 카드나 숫자로 결정하지 마세요. 즉각적인 위험에서는 현지 응급·위기지원과 신뢰할 수 있는 사람에게 먼저 연락해야 합니다."] },
    { title: "사용자의 책임", bullets: ["정확한 입력과 계정·기기 보안에 책임을 집니다.", "타인의 정보를 동의 없이 공개·저장·괴롭힘·평가에 사용하지 않습니다.", "불법 행위, 안전 우회, 프롬프트 인젝션, 서비스 방해, 자동 남용을 하지 않습니다."] },
    { title: "결정과 결과", paragraphs: ["최종 결정권과 현실 확인 책임은 사용자에게 있습니다. Reality Check 평가는 개인 관련성 기록이며 예측 정확도나 전문 검증을 의미하지 않습니다."] },
    { title: "계정·구독·환불", paragraphs: ["현재 미리보기에는 계정·결제·자동갱신이 없습니다. 판매자, 가격, 세금, 갱신, 취소, 환불, 지원 정책은 결제 제공자와 법률 검토 후 별도 승인되며 그 전에는 유료 결제를 받지 않습니다."] },
    { title: "출시 전 미확정 사항", paragraphs: ["법적 사업자, 적용법, 분쟁·민원 절차, 책임 제한, 지식재산 라이선스, 최소 연령과 연락처는 미확정입니다. 최종 이용약관 승인 전 공개 출시하지 않습니다."] },
  ],
};

const termsEn: LegalPageCopy = {
  ...sharedEn,
  status: "Pre-release terms · legal review pending",
  title: "InnerArc terms of use",
  intro: "This version is a local product preview. These draft boundaries explain safer use; they are not a public-service contract or paid-subscription terms.",
  lastUpdated: "2026-07-23",
  sections: [
    { title: "Nature of the service", paragraphs: ["InnerArc uses numerology and tarot symbols with user records for self-reflection. It does not guarantee or scientifically predict the future, relationship success, personality identity, illness, legal outcomes, or investment performance."] },
    { title: "Qualified judgment comes first", paragraphs: ["Do not decide medical, mental-health, legal, investment, crime, violence, or self-harm matters from cards or numbers. In immediate danger, contact local emergency or crisis support and a trusted person first."] },
    { title: "Your responsibilities", bullets: ["Provide accurate inputs and protect your account and device.", "Do not disclose, retain, harass, or evaluate another person with their information without permission.", "Do not use the service for illegal conduct, safety bypass, prompt injection, disruption, or automated abuse."] },
    { title: "Decisions and outcomes", paragraphs: ["You retain decision ownership and responsibility for real-world verification. Reality Check ratings record personal relevance; they are not prediction accuracy or professional validation."] },
    { title: "Accounts, subscriptions, and refunds", paragraphs: ["The current preview has no account, charge, or auto-renewal. Seller identity, prices, taxes, renewal, cancellation, refunds, and support policy require payment-provider and legal approval before any charge is accepted."] },
    { title: "Unresolved pre-launch fields", paragraphs: ["Legal entity, governing law, dispute and complaint route, liability language, intellectual-property license, minimum age, and contact information remain unresolved. Public launch is blocked until final terms are approved."] },
  ],
};

export const privacyCopy: Record<Locale, LegalPageCopy> = { ko: privacyKo, en: privacyEn };
export const termsCopy: Record<Locale, LegalPageCopy> = { ko: termsKo, en: termsEn };
