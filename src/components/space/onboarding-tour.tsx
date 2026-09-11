"use client";

import Image from "next/image";
import styles from "./space.module.css";

const DIRECTIONS = [
  { degrees: 0, ko: "위쪽", en: "Top", arrow: "↑" },
  { degrees: 90, ko: "오른쪽", en: "Right", arrow: "→" },
  { degrees: 180, ko: "아래쪽", en: "Bottom", arrow: "↓" },
  { degrees: 270, ko: "왼쪽", en: "Left", arrow: "←" },
] as const;

export function CardinalDirectionPicker({ locale, northDegrees, confirmed, onPick }: {
  locale: "ko" | "en";
  northDegrees: number;
  confirmed: boolean;
  onPick: (degrees: 0 | 90 | 180 | 270) => void;
}) {
  const ko = locale === "ko";
  return <div className={styles.directionPicker} role="group" aria-label={ko ? "방에서 북쪽이 있는 방향" : "Where north is in the room"}>
    {DIRECTIONS.map(direction => <button
      aria-pressed={confirmed && northDegrees === direction.degrees}
      key={direction.degrees}
      onClick={() => onPick(direction.degrees)}
      type="button"
    ><b aria-hidden="true">{direction.arrow}</b><span>{ko ? direction.ko : direction.en}</span></button>)}
  </div>;
}

export function SpaceOnboardingTour({ locale, step, northDegrees, northConfirmed, onStep, onPickNorth, onClose, onStart }: {
  locale: "ko" | "en";
  step: number;
  northDegrees: number;
  northConfirmed: boolean;
  onStep: (step: number) => void;
  onPickNorth: (degrees: 0 | 90 | 180 | 270) => void;
  onClose: () => void;
  onStart: () => void;
}) {
  const ko = locale === "ko";
  const items = [
    {
      image: "/images/space/previews/bedroom-before-v1.png",
      eyebrow: ko ? "1 · 사진 찍기" : "1 · Take photos",
      title: ko ? "방 전체를 두 방향에서 찍어요." : "Photograph the whole room from two sides.",
      body: ko ? "문·창·바닥과 가구가 한 화면에 보이게 찍고, 반대쪽에서도 한 장 더 찍으세요." : "Keep doors, windows, floor edges and furniture visible, then take one more photo from the opposite side.",
    },
    {
      image: "/images/space/previews/bedroom-before-v1.png",
      eyebrow: ko ? "2 · 방향 고르기" : "2 · Choose direction",
      title: ko ? "북쪽이 있는 쪽만 누르면 돼요." : "Just tap the side where north is.",
      body: ko ? "휴대폰 나침반을 켜고 방에서 북쪽이 있는 쪽을 고르세요. 숫자 각도는 입력하지 않습니다." : "Open your phone compass and choose the side of the room where north is. No angle entry is needed.",
    },
    {
      image: "/images/space/space-intelligence-hero.png",
      eyebrow: ko ? "3 · 빠진 물건 확인" : "3 · Check missing objects",
      title: ko ? "중요한 물건을 3D에서 확인해요." : "Check important room details in 3D.",
      body: ko ? "거울·액자·커튼·어항·주방 설비와 전자기기가 빠졌다면 목록에서 바로 추가할 수 있어요." : "Add mirrors, art, curtains, aquariums, kitchen fixtures or electronics when the draft misses them.",
    },
    {
      image: "/images/space/previews/bedroom-after-v1.png",
      eyebrow: ko ? "4 · 결과 비교" : "4 · Compare results",
      title: ko ? "현재 배치와 추천 배치를 번갈아 봐요." : "Switch between current and suggested layouts.",
      body: ko ? "한 번에 하나만 바꿔 보고, 실제로 편해졌는지는 나중에 기록하세요." : "Try one change at a time and record later whether it felt more comfortable in daily life.",
    },
  ] as const;
  const item = items[step];
  return <div className={styles.tourBackdrop} role="presentation">
    <section aria-describedby="space-tour-body" aria-labelledby="space-tour-title" aria-modal="true" className={styles.tourDialog} role="dialog">
      <header className={styles.tourHeader}>
        <div><small>{ko ? "풍수학 처음 사용 안내" : "Feng Shui guided start"}</small><strong>{step + 1} / {items.length}</strong></div>
        <button autoFocus aria-label={ko ? "사용 안내 닫기" : "Close guided start"} className={styles.tourClose} onClick={onClose} type="button">×</button>
      </header>
      <div className={styles.tourProgress} aria-label={ko ? "사용 안내 단계 바로가기" : "Guided start steps"} role="navigation">
        {items.map((_, index) => <button aria-label={`${index + 1}${ko ? "단계" : ""}`} data-active={index === step} key={index} onClick={() => onStep(index)} type="button"><span /></button>)}
        <span className={styles.tourProgressValue} aria-label={ko ? "사용 안내 진행 단계" : "Guided start progress"} role="progressbar" aria-valuemin={1} aria-valuemax={items.length} aria-valuenow={step + 1} />
      </div>
      <div className={styles.tourContent}>
        <figure className={styles.tourVisual}>
          <Image alt="" fill priority={step === 0} sizes="(max-width: 640px) 92vw, 520px" src={item.image} />
          {step === 0 && <div className={styles.photoArrows} aria-hidden="true"><span>①</span><i>→</i><span>②</span></div>}
          {step === 1 && <div className={styles.tourCompass} aria-hidden="true"><b>북 N</b><span>서 W</span><span>동 E</span><em>남 S</em></div>}
        </figure>
        <div className={styles.tourCopy}>
          <small>{item.eyebrow}</small>
          <h2 id="space-tour-title">{item.title}</h2>
          <p id="space-tour-body">{item.body}</p>
          {step === 1 && <><strong className={styles.pickerQuestion}>{ko ? "북쪽은 화면에서 어느 쪽인가요?" : "Which side of the screen is north?"}</strong><CardinalDirectionPicker locale={locale} northDegrees={northDegrees} confirmed={northConfirmed} onPick={onPickNorth} /></>}
          {step === 2 && <ul className={styles.electronicList}>{(ko ? ["거울·액자", "커튼·시계", "식물·조명", "어항", "화구·싱크대", "전자기기"] : ["Mirror · art", "Curtain · clock", "Plant · lighting", "Aquarium", "Stove · sink", "Electronics"]).map(name => <li key={name}>✓ {name}</li>)}</ul>}
        </div>
      </div>
      <footer className={styles.tourActions}>
        <button disabled={step === 0} onClick={() => onStep(step - 1)} type="button">{ko ? "이전" : "Back"}</button>
        {step < items.length - 1
          ? <button className={styles.primary} disabled={step === 1 && !northConfirmed} onClick={() => onStep(step + 1)} type="button">{step === 1 && !northConfirmed ? (ko ? "방향을 골라주세요" : "Choose a direction") : (ko ? "다음 →" : "Next →")}</button>
          : <button className={styles.primary} onClick={onStart} type="button">{ko ? "내 방으로 시작하기 →" : "Start with my room →"}</button>}
      </footer>
    </section>
  </div>;
}
