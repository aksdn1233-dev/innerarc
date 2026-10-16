import Image from "next/image";
import type { OnboardingFocusId } from "@/core/onboarding";
import { getNumerologyGuide, type NumerologyGuideId } from "@/core/numerology-guides";
import type { Locale } from "@/i18n/config";
import "./harang-journey-preview.css";

type Props = {
  locale: Locale;
  selectedGuideId: NumerologyGuideId;
  onSelect: (guideId: NumerologyGuideId, focusId: OnboardingFocusId) => void;
  surface?: "numerology" | "saju";
};

export function NumerologyGuideRoster({ locale, selectedGuideId }: Props) {
  const guide = getNumerologyGuide(selectedGuideId);
  return <section className="harang-guide-solo" aria-labelledby="numerology-guide-title">
    <Image alt={guide.imageAlt[locale]} src={guide.image} width={384} height={384} sizes="100px" unoptimized />
    <div><p>{locale === "ko" ? "함께 살펴볼 안내자" : "Your guide"}</p><h2 id="numerology-guide-title">{guide.name[locale]}</h2><p>{locale === "ko" ? "궁금한 것부터 하나씩 물어보세요. 내 사주와 패턴을 계산 근거와 함께 풀어드려요." : "Start with your question. Harang explains your chart and patterns alongside their calculation."}</p></div>
  </section>;
}
