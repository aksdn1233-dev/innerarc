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
  nav: readonly [string, string, string, string, string];
}>;

const ko: ShopCopy = {
  brandTagline: "나·관계·올해의 흐름 리딩",
  eyebrow: "상점 미리보기",
  headline: "상징보다 안전과 쓸모를\n먼저 확인하는 큐레이션",
  intro: "결과에 맞춘 액세서리 카테고리를 준비하고 있습니다. 아직 상품을 판매하거나 결제를 받지 않습니다.",
  status: "차후 오픈 예정",
  categoriesTitle: "준비 중인 카테고리",
  categoryIntro: "개별 상품이 아니라 형태·재료·사용 맥락을 검토하는 카테고리 구조입니다.",
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
  nav: ["홈", "나", "관계", "질문", "성장"],
};

const en: ShopCopy = {
  brandTagline: "Personal pattern intelligence",
  eyebrow: "Shop preview",
  headline: "Curation that checks safety\nand usefulness before symbolism",
  intro: "We are preparing accessory categories connected to reflection results. No products are sold and no payments are accepted yet.",
  status: "Opening later",
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
  nav: ["Home", "Me", "Relations", "Questions", "Growth"],
};

export const shopCopy: Record<Locale, ShopCopy> = { ko, en };
