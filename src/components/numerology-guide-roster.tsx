import type { OnboardingFocusId } from "@/core/onboarding";
import type { CSSProperties } from "react";
import Image from "next/image";
import {
  NUMEROLOGY_GUIDES,
  type NumerologyGuide,
  type NumerologyGuideId,
} from "@/core/numerology-guides";
import type { Locale } from "@/i18n/config";

type Props = {
  locale: Locale;
  selectedGuideId: NumerologyGuideId;
  onSelect: (guideId: NumerologyGuideId, focusId: OnboardingFocusId) => void;
  surface?: "numerology" | "saju";
};

function GuideCard({
  guide,
  locale,
  selected,
  onSelect,
}: {
  guide: NumerologyGuide;
  locale: Locale;
  selected: boolean;
  onSelect: Props["onSelect"];
}) {
  const ko = locale === "ko";
  return (
    <article
      className={`numerology-guide-card${selected ? " is-selected" : ""}`}
      style={{ "--guide-color": guide.theme.color } as CSSProperties}
    >
      <div className="numerology-guide-image-frame">
        <Image
          alt={guide.imageAlt[locale]}
          className="numerology-guide-image"
          decoding="async"
          height="384"
          priority={guide.id === "taeryeong"}
          sizes="(max-width: 560px) calc(100vw - 24px), (max-width: 840px) 50vw, 384px"
          src={guide.image}
          width="384"
        />
      </div>
      <div className="numerology-guide-copy">
        <p className="numerology-guide-theme">{guide.theme.label[locale]}</p>
        <h3>{guide.name[locale]}</h3>
        <small>{guide.romanizedName}</small>
        <p className="numerology-guide-role">{guide.role[locale]}</p>
        <ul aria-label={ko ? `${guide.name.ko} 전문 영역` : `${guide.name.en} specialties`}>
          {guide.specialties[locale].map((specialty) => <li key={specialty}>{specialty}</li>)}
        </ul>
        <button
          aria-pressed={selected}
          className="numerology-guide-select"
          onClick={() => onSelect(guide.id, guide.primaryFocus)}
          type="button"
        >
          {selected
            ? (ko ? "선택됨" : "Selected")
            : (ko ? "이 해석자 선택" : "Choose this guide")}
        </button>
      </div>
    </article>
  );
}

export function NumerologyGuideRoster({ locale, selectedGuideId, onSelect, surface = "numerology" }: Props) {
  const ko = locale === "ko";
  const isSaju = surface === "saju";
  return (
    <section className="numerology-guide-section" aria-labelledby="numerology-guide-title">
      <header className="numerology-guide-heading">
        <p className="eyebrow">
          {isSaju
            ? (ko ? "태령당 사주 서비스 해석자" : "태령당 Saju service guides")
            : (ko ? "태령당 생년월일 패턴 해석자" : "태령당 numerology guides")}
        </p>
        <h2 id="numerology-guide-title">{ko ? "지금 필요한 관점의 해석자를 고르세요" : "Choose the perspective you need now"}</h2>
        <p>
          {isSaju
            ? (ko
                ? "사주 서비스에서 먼저 필요한 해석 관점을 고르세요. 해석자 선택은 원국 계산값을 바꾸지 않습니다."
                : "Choose the perspective you need before entering a Saju service. Your guide never changes the calculated chart facts.")
            : (ko
                ? "해석자는 결과를 바라보는 관점을 정합니다. 숫자 계산식과 결과값은 누구를 선택해도 바뀌지 않습니다."
                : "Your guide sets the reflection lens. The deterministic formula and calculated values never change with this choice.")}
        </p>
      </header>
      <div className="numerology-guide-grid">
        {NUMEROLOGY_GUIDES.map((guide) => (
          <GuideCard
            guide={guide}
            key={guide.id}
            locale={locale}
            onSelect={onSelect}
            selected={selectedGuideId === guide.id}
          />
        ))}
      </div>
    </section>
  );
}
