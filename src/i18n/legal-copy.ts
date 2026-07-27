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
  brandTagline: "프리미엄 타로·신점 리딩",
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
  status: "운영 전 안내 · 연락처·국외이전 세부사항 및 법률 검토 필요",
  title: "개인정보 처리 안내",
  intro: "InnerArc 운영자와 현재 기능, 계정·결제 처리 범위를 설명합니다. 개인정보 권리행사 연락처와 위탁·국외이전 세부사항은 실제 계약 확인 후 최종 갱신합니다.",
  lastUpdated: "2026-07-27",
  sections: [
    {
      title: "개인정보처리자",
      bullets: [
        "상호: 벨루프",
        "대표자: 박서준",
        "사업자등록번호: 482-12-03629",
        "사업장 소재지: 부산광역시 북구 (상세 공개 주소 확정 전)",
      ],
    },
    {
      title: "현재 처리하는 정보",
      bullets: [
        "게스트의 생년월일, 선택 입력 이름, 관심사와 고민은 현재 분석을 위해 브라우저 메모리에서 사용되며 사용자가 저장을 선택하지 않으면 새로고침 시 사라집니다.",
        "이메일 로그인을 선택하면 Supabase가 인증 이메일, 계정 식별자와 세션 정보를 처리합니다. 사용자가 명시적으로 동기화한 환경설정·타로 기록·Reality Check 기록만 계정에 저장됩니다.",
        "결제 시 주문번호, 상품코드, 결제금액, 통화, 결제수단, 결제상태와 이용권 만료일을 보관합니다. 결제 안내에 필요한 휴대폰 번호와 카드번호·계좌 비밀번호·휴대폰 인증정보는 InnerArc 서버에 저장하지 않고 결제대행사 페이앱이 처리합니다.",
      ],
    },
    {
      title: "처리 목적과 선택 동의",
      bullets: [
        "필수 정보는 로그인, 주문 확인, 결제 승인·취소·환불, 이용권 제공, 고객문의, 부정 이용 방지 및 법정 거래기록 보존을 위해 처리합니다.",
        "맞춤 리딩, 서비스 개선, 제품 분석, 마케팅, 장기 원문 보관은 서로 분리된 선택 항목입니다.",
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
        "인증·데이터 저장에는 Supabase, 결제 요청·승인·가상계좌 입금 통보에는 페이앱 운영사 (주)유디아이디와 구매자가 선택한 결제수단 사업자가 사용됩니다. 국외이전 여부, 이전 항목·시점·방법·보유기간과 거부 방법은 각 계약과 실제 데이터 흐름을 확인해 최종 방침에 공개합니다.",
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
        "개인정보 보호 담당 연락처, 최소 이용연령, 정확한 처리 항목·법적 근거·보유기간, 위탁사와 국외이전, 쿠키·분석 도구, 권리행사 절차 및 침해구제 안내의 최종 확인이 남아 있습니다.",
      ],
    },
  ],
};

const privacyEn: LegalPageCopy = {
  ...sharedEn,
  status: "Pre-operation notice · contact, transfer details, and legal review pending",
  title: "Privacy information",
  intro: "This notice identifies the InnerArc operator and describes current account and payment data flows. Contact, processor, and international-transfer details will be finalized against the operating contracts.",
  lastUpdated: "2026-07-27",
  sections: [
    {
      title: "Controller",
      bullets: [
        "Legal business name: 벨루프",
        "Representative: 박서준",
        "Business registration number: 482-12-03629",
        "Business location: Buk-gu, Busan, Republic of Korea (public service address pending)",
      ],
    },
    {
      title: "Information currently handled",
      bullets: [
        "A guest's birth date, optional name, interests, and concern are used in browser memory for the current analysis and disappear on refresh unless the person explicitly saves them.",
        "If email sign-in is selected, Supabase handles the authentication email, account identifier, and session. Only preferences, tarot records, and Reality Check records explicitly synchronized by the person are stored with the account.",
        "For payment, InnerArc retains the order ID, product code, amount, currency, method, status, and access expiry. PayApp handles the mobile number needed for payment instructions as well as card, bank, and mobile-authentication data; InnerArc does not store those values.",
      ],
    },
    {
      title: "Purposes and optional choices",
      bullets: [
        "Required data supports sign-in, order verification, approval, cancellation and refund, access delivery, support, abuse prevention, and legally required transaction records.",
        "Personalization, product analytics, marketing, and long-term raw-text retention remain separate optional choices.",
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
        "Supabase supports authentication and storage. PayApp operator UDID Co., Ltd. and the customer-selected payment-method operator process checkout, approval, and virtual-account deposit notifications. International-transfer details will be finalized against signed contracts and verified data flows.",
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
  status: "운영 전 이용조건 · 연락처와 통신판매 신고정보 최종 확인 필요",
  title: "InnerArc 이용조건",
  intro: "현재 제품 경계와 자동 갱신 없는 1회성 리딩 상품의 유료 결제·전달·환불 원칙을 설명합니다. 연락처와 통신판매 신고정보는 운영 개시 전에 최종 갱신합니다.",
  lastUpdated: "2026-07-27",
  sections: [
    {
      title: "판매자 정보",
      bullets: [
        "상호: 벨루프",
        "대표자: 박서준",
        "사업자등록번호: 482-12-03629",
        "사업장 소재지: 부산광역시 북구 (상세 공개 주소 확정 전)",
        "업태·종목: 도매 및 소매업 · 전자상거래 소매업",
      ],
    },
    {
      title: "서비스의 성격",
      paragraphs: [
        "InnerArc는 생년월일의 흐름과 타로 상징을 자기성찰 질문으로 제공합니다. 미래, 관계 성공, 성격의 본질, 질병, 법률 결과, 투자 수익을 보장하거나 과학적으로 예측하지 않습니다.",
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
      title: "리딩 상품과 결제",
      bullets: [
        "간단 타로 리딩은 19,000원, 타로·생년월일 종합 리딩은 39,000원, 프리미엄 맞춤 리포트는 79,000원입니다. 모두 자동 갱신 없는 1회성 상품이며 최종 결제금액과 제공 범위를 결제 직전에 다시 표시합니다.",
        "결제 승인 뒤 리포트를 즉시 열고 내려받을 수 있습니다. 로그인하면 마이페이지에도 저장되며, 비회원은 안전한 전용 주소와 내려받은 파일을 직접 보관해야 합니다.",
        "카카오페이·토스페이·카드·휴대폰·계좌이체·가상계좌는 페이앱 판매자 설정과 각 결제수단 심사가 완료된 범위에서만 노출됩니다.",
        "가상계좌 리포트는 페이앱의 서명값·주문번호·결제금액을 검증한 입금완료 통보를 받은 시점부터 제공됩니다.",
      ],
    },
    {
      title: "청약철회, 취소와 환불",
      paragraphs: [
        "구매자는 계약내용을 받은 날 또는 이용 가능일 중 늦은 날부터 7일 이내에 청약철회를 요청할 수 있습니다. 서비스가 표시·광고 또는 계약과 다르게 제공된 경우에는 공급일로부터 3개월 이내 또는 그 사실을 안 날부터 30일 이내의 법정 권리를 제한하지 않습니다. 중복결제, 결제 후 이용권 미반영, 사업자 귀책 장애는 확인 후 전액 환불합니다. 환불은 요청 확인 후 원 결제수단으로 처리합니다.",
      ],
    },
    {
      title: "출시를 막는 미확정 항목",
      paragraphs: [
        "대표 전화, 고객지원 이메일, 통신판매업 신고번호, 환불 접수 방법과 분쟁처리 연락처의 최종 입력이 남아 있습니다.",
      ],
    },
  ],
};

const termsEn: LegalPageCopy = {
  ...sharedEn,
  status: "Pre-release draft · seller details and refund policy pending",
  title: "InnerArc terms of use",
  intro: "This draft explains current product boundaries and the intended one-time readings. Paid checkout remains closed until seller identity, support, and the final refund policy are approved.",
  lastUpdated: "2026-07-27",
  sections: [
    {
      title: "Seller",
      bullets: [
        "Legal business name: 벨루프",
        "Representative: 박서준",
        "Business registration number: 482-12-03629",
        "Business location: Buk-gu, Busan, Republic of Korea (public service address pending)",
      ],
    },
    {
      title: "Nature of the service",
      paragraphs: [
        "InnerArc uses birth-date themes and tarot symbols as prompts for self-reflection. It does not guarantee or scientifically predict the future, relationship success, identity, illness, legal outcomes, or investment returns.",
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
      title: "Reading products and payment",
      bullets: [
        "The quick reading is KRW 19,000, the comprehensive reading is KRW 39,000, and the premium custom report is KRW 79,000. Each is a one-time, non-renewing purchase.",
        "Reports open and download after verified payment. Signed-in purchases are also saved in My Page; guest customers must retain the private access link and downloaded file.",
        "KakaoPay, Toss Pay, cards, mobile, bank transfer, and virtual accounts appear only when enabled for the PayApp merchant account and approved for the applicable method.",
        "Virtual-account reports open only after the deposit is verified through the payment-provider API.",
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
