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
  status: "출시 전 초안 · 사업자 정보 확정 및 법률 검토 필요",
  title: "개인정보 처리 안내",
  intro: "현재 기능과 예정된 결제 처리 범위를 설명하는 출시 전 초안입니다. 운영자 상호·대표자·개인정보 보호 연락처·위탁 및 국외이전 세부사항을 확정하기 전에는 실제 유료 서비스를 열지 않습니다.",
  lastUpdated: "2026-07-27",
  sections: [
    {
      title: "현재 처리하는 정보",
      bullets: [
        "게스트의 생년월일, 선택 입력 이름, 관심사와 고민은 현재 분석을 위해 브라우저 메모리에서 사용되며 사용자가 저장을 선택하지 않으면 새로고침 시 사라집니다.",
        "이메일 로그인을 선택하면 Supabase가 인증 이메일, 계정 식별자와 세션 정보를 처리합니다. 사용자가 명시적으로 동기화한 환경설정·타로 기록·Reality Check 기록만 계정에 저장됩니다.",
        "결제가 개통되면 주문번호, 상품코드, 결제금액, 통화, 결제수단, 결제상태와 이용권 만료일을 보관합니다. 카드번호·계좌 비밀번호·휴대폰 인증정보는 InnerArc 서버에 저장하지 않고 결제대행사가 처리합니다.",
      ],
    },
    {
      title: "처리 목적과 선택 동의",
      bullets: [
        "필수 정보는 로그인, 주문 확인, 결제 승인·취소·환불, 이용권 제공, 고객문의, 부정 이용 방지 및 법정 거래기록 보존을 위해 처리합니다.",
        "AI 개인화, 모델 학습, 제품 분석, 마케팅, 장기 원문 보관은 서로 분리된 선택 항목입니다.",
        "선택 동의를 거부해도 규칙 기반 기본 결과는 이용할 수 있습니다.",
      ],
    },
    {
      title: "보유, 파기, 내보내기와 삭제",
      bullets: [
        "브라우저 저장 기록과 계정 서버 기록은 서로 별개이며 내 페이지에서 각각 내보내거나 삭제할 수 있습니다.",
        "결제·계약·공급 및 소비자 분쟁 처리 기록은 전자상거래 관계 법령에 따른 기간 동안 별도 보관한 뒤 파기해야 합니다. 정확한 항목별 보존기간은 운영자와 법률 검토 후 최종 방침에 명시합니다.",
        "계정 삭제 시 서비스 기록은 삭제하되 법률상 보존 의무가 있는 최소 거래기록과 권리행사 처리기록은 목적별로 분리 보관할 수 있습니다.",
      ],
    },
    {
      title: "처리위탁과 국외이전 예정",
      paragraphs: [
        "인증·데이터 저장에는 Supabase, 결제에는 토스페이먼츠 및 선택한 결제수단 사업자가 사용될 예정입니다. 사업자명, 이전 국가, 이전 항목·시점·방법·보유기간과 거부 방법을 계약서와 실제 데이터 흐름으로 확인한 뒤 최종 방침에 공개합니다.",
      ],
    },
    {
      title: "정보주체의 권리와 안전조치",
      bullets: [
        "이용자는 자신의 정보 열람, 정정, 삭제, 처리정지 및 동의 철회를 요청할 수 있습니다. 최종 고객지원·개인정보 보호 연락처는 사업자 정보 확정 후 게시합니다.",
        "계정별 접근통제, 서버 전용 결제키, 최소권한 데이터베이스, 전송구간 암호화, 결제 웹훅 재조회 검증과 로그 마스킹을 적용합니다.",
        "타인의 정보를 입력할 때에는 적법한 권한과 동의를 확인해야 하며 공유 결과에는 상대방의 생년월일과 이름을 포함하지 않습니다.",
      ],
    },
    {
      title: "출시를 막는 미확정 항목",
      paragraphs: [
        "개인정보처리자 상호·주소·대표자, 보호책임자 또는 담당부서 연락처, 최소 이용연령, 정확한 처리 항목·법적 근거·보유기간, 위탁사와 국외이전, 쿠키·분석 도구, 권리행사 절차 및 침해구제 안내가 아직 확정되지 않았습니다. 이 항목이 채워지고 검토되기 전에는 결제를 활성화하지 않습니다.",
      ],
    },
  ],
};

const privacyEn: LegalPageCopy = {
  ...sharedEn,
  status: "Pre-release draft · operator details and legal review pending",
  title: "Privacy information",
  intro: "This pre-release draft describes current functionality and the intended payment data flow. Paid service will remain closed until the operator, privacy contact, processors, and international-transfer details are finalized.",
  lastUpdated: "2026-07-27",
  sections: [
    {
      title: "Information currently handled",
      bullets: [
        "A guest's birth date, optional name, interests, and concern are used in browser memory for the current analysis and disappear on refresh unless the person explicitly saves them.",
        "If email sign-in is selected, Supabase handles the authentication email, account identifier, and session. Only preferences, tarot records, and Reality Check records explicitly synchronized by the person are stored with the account.",
        "When payments open, InnerArc will retain the order ID, product code, amount, currency, method, status, and access expiry. Card numbers, bank passwords, and mobile authentication details will be handled by the payment provider rather than stored on InnerArc servers.",
      ],
    },
    {
      title: "Purposes and optional choices",
      bullets: [
        "Required data supports sign-in, order verification, approval, cancellation and refund, access delivery, support, abuse prevention, and legally required transaction records.",
        "AI personalization, model training, product analytics, marketing, and long-term raw-text retention remain separate optional choices.",
        "Declining an optional choice does not block the rule-based core result.",
      ],
    },
    {
      title: "Retention, deletion, and export",
      bullets: [
        "Browser records and account records are separate and can be exported or deleted separately from the Me page.",
        "Payment, contract, supply, and dispute records must be isolated and retained for the applicable statutory periods before deletion. The final notice will state exact periods after legal review.",
        "Account deletion removes service records, while minimal transaction and rights-request records may remain separately where law requires retention.",
      ],
    },
    {
      title: "Processors and intended international transfers",
      paragraphs: [
        "Supabase is intended for authentication and storage; Toss Payments and the chosen payment-method operator are intended for payment. The final notice will identify the entities, countries, fields, timing, method, retention, and refusal consequences based on signed contracts and verified data flows.",
      ],
    },
    {
      title: "Individual rights and safeguards",
      bullets: [
        "Individuals may request access, correction, deletion, restriction, and consent withdrawal. Final support and privacy contact details will be published after operator details are approved.",
        "Controls include account-scoped access, server-only payment keys, least-privilege database access, encrypted transport, provider re-query for webhook verification, and log redaction.",
        "Before entering another person's information, confirm lawful authority and consent. Shared outputs exclude the other person's name and birth date.",
      ],
    },
    {
      title: "Fields blocking launch",
      paragraphs: [
        "Controller name, address, representative, privacy contact, minimum age, exact fields, legal bases, retention, processors, international transfers, analytics and cookies, rights procedures, and complaint routes remain unresolved. Payments stay disabled until these fields are completed and reviewed.",
      ],
    },
  ],
};

const termsKo: LegalPageCopy = {
  ...sharedKo,
  status: "출시 전 초안 · 판매자 정보와 환불정책 확정 필요",
  title: "InnerArc 이용조건",
  intro: "이 문서는 현재 제품 경계와 예정된 30일 이용권의 원칙을 설명하는 초안입니다. 판매자 신원, 가격, 고객지원과 최종 환불정책이 확정되기 전에는 유료 결제를 받지 않습니다.",
  lastUpdated: "2026-07-27",
  sections: [
    {
      title: "서비스의 성격",
      paragraphs: [
        "InnerArc는 수비학과 타로 상징을 자기성찰 질문으로 제공합니다. 미래, 관계 성공, 성격의 본질, 질병, 법률 결과, 투자 수익을 보장하거나 과학적으로 예측하지 않습니다.",
      ],
    },
    {
      title: "전문 판단과 안전 우선",
      paragraphs: [
        "의료·정신건강·법률·투자·범죄·폭력·자해 문제를 카드나 숫자로 결정하지 마세요. 즉각적인 위험에서는 현지 긴급·위기 지원과 신뢰할 수 있는 사람에게 먼저 연락해야 합니다.",
      ],
    },
    {
      title: "계정과 이용자 책임",
      bullets: [
        "정확한 정보를 입력하고 계정과 기기를 보호해야 합니다.",
        "타인의 정보를 허락 없이 공개·보관·괴롭힘·평가 목적으로 사용하면 안 됩니다.",
        "불법행위, 안전장치 우회, 서비스 방해, 대량 자동화 오용은 금지됩니다.",
      ],
    },
    {
      title: "30일 이용권과 결제",
      bullets: [
        "Plus와 Pro는 자동 갱신 없는 1회성 30일 이용권으로 설계되어 있습니다. 최종 가격과 제공 기능은 결제 직전 화면에 표시합니다.",
        "카카오페이·토스페이·가상계좌·휴대폰 결제는 토스페이먼츠 가맹점 계약과 각 결제수단 심사가 완료된 범위에서만 노출됩니다.",
        "가상계좌 이용권은 실제 입금이 결제대행사 조회로 확인된 시점부터 반영됩니다.",
      ],
    },
    {
      title: "청약철회, 취소와 환불",
      paragraphs: [
        "관계 법령상 청약철회가 가능한 기간과 예외, 디지털콘텐츠 사용 개시 전 동의 절차, 부분 사용 시 환불 산정, 오결제·중복결제·장애 시 처리 기준을 결제 전에 명확히 표시합니다. 표시·광고 또는 계약과 다르게 제공된 경우의 법정 권리는 제한하지 않습니다. 최종 환불 기준이 승인되기 전에는 결제를 열지 않습니다.",
      ],
    },
    {
      title: "출시를 막는 미확정 항목",
      paragraphs: [
        "상호·대표자·주소·사업자등록번호·통신판매업 신고번호·연락처, 상품별 가격·세금·제공시점, 고객지원, 환불 요청 방법, 분쟁처리, 준거법, 지식재산권과 책임 제한 문구가 아직 확정되지 않았습니다.",
      ],
    },
  ],
};

const termsEn: LegalPageCopy = {
  ...sharedEn,
  status: "Pre-release draft · seller details and refund policy pending",
  title: "InnerArc terms of use",
  intro: "This draft explains current product boundaries and the intended 30-day passes. No paid checkout will open until seller identity, prices, support, and the final refund policy are approved.",
  lastUpdated: "2026-07-27",
  sections: [
    {
      title: "Nature of the service",
      paragraphs: [
        "InnerArc uses numerology and tarot symbols as prompts for self-reflection. It does not guarantee or scientifically predict the future, relationship success, identity, illness, legal outcomes, or investment returns.",
      ],
    },
    {
      title: "Qualified judgment and safety come first",
      paragraphs: [
        "Do not decide medical, mental-health, legal, investment, crime, violence, or self-harm matters from cards or numbers. In immediate danger, contact local emergency or crisis support and a trusted person first.",
      ],
    },
    {
      title: "Accounts and user responsibilities",
      bullets: [
        "Provide accurate inputs and protect your account and device.",
        "Do not disclose, retain, harass, or evaluate another person using their information without permission.",
        "Illegal conduct, safety bypass, disruption, and abusive automation are prohibited.",
      ],
    },
    {
      title: "30-day access and payment",
      bullets: [
        "Plus and Pro are designed as one-time, non-renewing 30-day passes. Final prices and included features will be displayed immediately before payment.",
        "KakaoPay, Toss Pay, virtual-account, and mobile-phone methods appear only after the applicable Toss Payments merchant and method reviews.",
        "Virtual-account access begins only after the deposit is verified through the payment-provider API.",
      ],
    },
    {
      title: "Withdrawal, cancellation, and refunds",
      paragraphs: [
        "Before payment, InnerArc will clearly state statutory withdrawal periods and exceptions, any consent required before digital-content use begins, partial-use calculations, and handling for duplicate charges or outages. Statutory remedies for content supplied differently from its description or contract are not restricted. Checkout remains closed until the final refund rules are approved.",
      ],
    },
    {
      title: "Fields blocking launch",
      paragraphs: [
        "Seller name, representative, address, business and mail-order registration numbers, contact details, item prices, taxes, supply time, support, refund request path, dispute handling, governing law, intellectual-property license, and liability terms remain unresolved.",
      ],
    },
  ],
};

export const privacyCopy: Record<Locale, LegalPageCopy> = { ko: privacyKo, en: privacyEn };
export const termsCopy: Record<Locale, LegalPageCopy> = { ko: termsKo, en: termsEn };
