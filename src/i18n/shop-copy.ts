import type { Locale } from "./config";

export type ShopCopy = Readonly<{
  brandTagline: string;
  eyebrow: string;
  headline: string;
  intro: string;
  status: string;
  categoriesTitle: string;
  categoryIntro: string;
  unavailable: string;
  launchGateTitle: string;
  launchGates: readonly string[];
  ethicsTitle: string;
  ethics: string;
  backToResult: string;
  sajuTitle: string;
  sajuIntro: string;
  numerologyTitle: string;
  numerologyIntro: string;
  formLabel: string;
  paletteLabel: string;
  materialLabel: string;
  useLabel: string;
  deliveryTitle: string;
  deliveryBody: string;
  deliveryBoundary: string;
  pendingPurchase: string;
  nav: readonly [string, string, string, string, string];
}>;

const ko: ShopCopy = {
  brandTagline: "나·관계·올해의 흐름 리딩",
  eyebrow: "결 악세서리 상점",
  headline: "사주와 수비학의 상징을\n일상에서 쓰는 형태로",
  intro: "사주 오행과 수비학 계산 결과에 맞춘 악세서리 방향을 먼저 살펴보세요. 실제 상품은 소재·가격·재고·사진 검토가 끝난 항목부터 순차적으로 결제할 수 있게 엽니다.",
  status: "상점 준비 중 · 결제는 상품 확정 후 오픈",
  categoriesTitle: "세 가지 사용 방식",
  categoryIntro: "추천은 구매 압박이 아니라 착용감과 쓰임을 먼저 확인하는 선택 가이드입니다.",
  unavailable: "현재 구매 불가",
  launchGateTitle: "열기 전에 반드시 확인할 것",
  launchGates: [
    "공급자 신원·원산지·재료·알레르기·치수·관리 정보",
    "실제 재고·배송·세금·반품·환불·고객지원",
    "접근 가능한 이미지·설명과 지역별 소비자 보호 검토",
    "추천 순서와 광고·협찬·마진의 명확한 분리",
  ],
  ethicsTitle: "상점 원칙",
  ethics: "어떤 물건도 행운·보호·치유·연애·재정 효과를 약속하지 않습니다. 구매 여부는 해석 결과나 안전 도움에 영향을 주지 않습니다.",
  backToResult: "내 결과에서 방향 보기",
  sajuTitle: "사주 오행별 추천 방향",
  sajuIntro: "원국에서 참고할 오행을 확인한 뒤 같은 글자의 방향을 보세요. 오행이 부족하다는 이유만으로 물건이 필요하다는 뜻은 아닙니다.",
  numerologyTitle: "수비학 계산값별 추천 방향",
  numerologyIntro: "라이프 패스·태도 수·개인 연도의 세 계산값을 착용·휴대·공간 포인트로 나눕니다.",
  formLabel: "형태",
  paletteLabel: "색 방향",
  materialLabel: "소재 방향",
  useLabel: "사용 확인",
  deliveryTitle: "결제 상품은 주문 제작 후 30일 이내 발송 예정",
  deliveryBody: "결제가 확인되면 선택한 디자인과 주문 정보를 기준으로 제작을 시작하고, 진행 상태는 악세서리 주문 내역으로 별도 관리합니다.",
  deliveryBoundary: "‘기운을 담는다’는 표현은 사주·수비학 상징을 디자인에 반영한다는 제작 콘셉트입니다. 행운·보호·치유·성과 같은 효능을 보장하지 않습니다.",
  pendingPurchase: "상품 정보 확정 후 결제 가능",
  nav: ["홈", "나", "관계", "질문", "성장"],
};

const en: ShopCopy = {
  brandTagline: "Personal pattern intelligence",
  eyebrow: "GYEOL accessory shop",
  headline: "Turn Saju and numerology symbols\ninto useful everyday forms",
  intro: "Explore accessory directions tied to Saju phases and numerology facts. Checkout opens only for items whose material, price, inventory, and imagery have been approved.",
  status: "Shop in preparation · checkout opens after product approval",
  categoriesTitle: "Categories in preparation",
  categoryIntro: "This is a category architecture for reviewing form, material, and use—not a product catalog.",
  unavailable: "Purchasing unavailable",
  launchGateTitle: "Required before opening",
  launchGates: [
    "Supplier identity, provenance, materials, allergy, dimensions, and care information",
    "Real inventory, shipping, tax, return, refund, and customer-support operations",
    "Accessible media and descriptions plus regional consumer-protection review",
    "A clear separation between recommendation order and ads, sponsorship, or margin",
  ],
  ethicsTitle: "Shop principle",
  ethics: "No object promises luck, protection, healing, romantic, or financial effects. Purchasing never changes your result or access to safety help.",
  backToResult: "See directions in my result",
  sajuTitle: "Directions by Saju phase",
  sajuIntro: "Find the phase referenced in your chart. A low phase count never means that you need to buy an object.",
  numerologyTitle: "Directions by numerology fact",
  numerologyIntro: "Life Path, Attitude, and Personal Year become wearable, carry, and space directions.",
  formLabel: "Form",
  paletteLabel: "Palette",
  materialLabel: "Material direction",
  useLabel: "Reality check",
  deliveryTitle: "Paid items are made to order and scheduled to ship within 30 days",
  deliveryBody: "Production begins after payment confirmation. Design choice and order progress are tracked separately as accessory orders.",
  deliveryBoundary: "‘Holding energy’ means reflecting symbolic Saju or numerology motifs in the design. It does not guarantee luck, protection, healing, or performance.",
  pendingPurchase: "Checkout opens after product approval",
  nav: ["Home", "Me", "Relations", "Questions", "Growth"],
};

export const shopCopy: Record<Locale, ShopCopy> = { ko, en };
