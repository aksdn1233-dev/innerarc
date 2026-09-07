import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SpaceWorkbench } from "@/components/space/workbench";
import { spaceEnabled } from "@/server/space/config";
import styles from "@/components/space/space.module.css";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "ko" ? "3D 공간운 | 태령당" : "3D Space | 태령당", description: locale === "ko" ? "방 구조를 확인하고 가구 배치를 3D로 비교하세요. 전통 풍수와 생활 분석을 구분해 살펴봅니다." : "Check your room and compare furniture layouts in 3D, separating traditional interpretation from practical observations.", alternates: { canonical: `/${locale}/space`, languages: { ko: "/ko/space", en: "/en/space" } } };
}
export default async function SpacePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const ko = locale === "ko", enabled = spaceEnabled();
  return <main id="main-content" className={styles.surface}>
    <nav className={styles.nav} aria-label={ko ? "공간운 메뉴" : "Space navigation"}><Link href={`/${locale}`}>태령당</Link><Link href={`/${locale}/space/workspace`} prefetch={false}>{ko ? "내 방 작업실" : "My room workspace"}</Link></nav>
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <span className={styles.badge}>{ko ? "태령당 공간 인텔리전스" : "TAERYEONGDANG SPACE INTELLIGENCE"}</span>
        <h1>{ko ? <><span>내 방을,</span><span>움직여</span><span>보기 전에.</span></> : <><span>See the room</span><span>before you</span><span>move it.</span></>}</h1>
        <p>{ko ? "서로 다른 방향의 사진을 교차 확인해 3D 초안을 만들고, 생활 동선과 전통 풍수 해석을 나누어 보여줍니다. 추천 배치는 같은 시점에서 바로 비교할 수 있습니다." : "Cross-check photos from different angles to build a 3D draft. Practical circulation and traditional feng shui interpretation stay clearly separated, with before-and-after layouts in the same view."}</p>
        <div className={styles.heroActions}><Link className={`${styles.linkButton} ${styles.primary}`} href={`/${locale}/space/workspace`} prefetch={false}>{ko ? "내 방 분석 시작" : "Start my room"}</Link><a href="#space-demo">{ko ? "예시 방 먼저 보기" : "Try the example"}</a></div>
        <ul className={styles.proofStrip}><li>{ko ? "실제 WebGL 3D" : "Actual WebGL 3D"}</li><li>{ko ? "사진 품질 자동 점검" : "Photo quality checks"}</li><li>{ko ? "규칙 기반 충돌 검사" : "Rule-based collision checks"}</li><li>{ko ? "비공개 원본" : "Private originals"}</li></ul>
        {!enabled && <p className={styles.hint}>{ko ? "내 방 저장·사진 분석은 출시 준비 중입니다. 예시 방은 지금 사용할 수 있습니다." : "Saved rooms and photo analysis are preparing for release. The example room is available now."}</p>}
      </div>
      <figure className={styles.heroVisual}>
        <Image src="/images/space/space-intelligence-hero.png" alt={ko ? "태령당 예시 거실의 실제 3D 렌더 화면" : "Actual 3D render of a sample living room in Taeryeongdang"} width={1354} height={1082} priority sizes="(max-width: 900px) 100vw, 55vw" />
        <figcaption>{ko ? "실제 제품 화면 · 확대 이미지가 아니라 브라우저에서 다시 그리는 3D 장면" : "Actual product view · a browser-rendered 3D scene, not a scaled-up image"}</figcaption>
      </figure>
    </section>
    <section className={styles.story}>
      <div className={styles.storyLead}><span className={styles.badge}>01 · {ko ? "공간 읽기" : "READ THE SPACE"}</span><h2>{ko ? "한 장의 그럴듯함보다, 서로 맞는 여러 장." : "Several agreeing views beat one convincing image."}</h2><p>{ko ? "사진이 흐리거나 너무 어둡고, 같은 장면이 반복되거나 방 경계가 가려지면 초안 생성을 멈추고 다시 찍을 곳을 알려줍니다." : "If photos are blurred, too dark, duplicated, or hide room boundaries, reconstruction stops and explains what to recapture."}</p></div>
      <div className={styles.storySteps}>
        <article><h3>{ko ? "밝은 전체 장면" : "A bright overview"}</h3><p>{ko ? "문·창·바닥과 벽이 만나는 선을 한 화면에 담습니다. 픽셀 해상도와 노출·대비·흔들림 가능성을 먼저 확인합니다." : "Include doors, windows, and wall-floor boundaries. Pixel resolution, exposure, contrast, and likely blur are checked first."}</p></article>
        <article><h3>{ko ? "반대쪽 교차 장면" : "An opposite cross-view"}</h3><p>{ko ? "첫 사진에 가려진 가구 뒤와 출입구를 반대쪽에서 찍습니다. 두 장 이상이 같은 공간 구조를 지지해야 다음 단계로 갑니다." : "Capture occluded furniture and openings from the opposite side. At least two distinct views must support the same geometry."}</p></article>
        <article><h3>{ko ? "한쪽 벽 실측" : "One measured wall"}</h3><p>{ko ? "사진만으로 절대 길이를 확정하지 않습니다. 사용자가 재어 준 벽 하나로 비율을 보정하고, 확인 전에는 결과를 초안으로 표시합니다." : "Photos do not prove absolute dimensions. One user-measured wall calibrates proportions, and the result remains a draft until confirmed."}</p></article>
      </div>
    </section>
    <section className={styles.story}>
      <div className={styles.storyLead}><span className={styles.badge}>02 · {ko ? "비교와 기록" : "COMPARE & RECORD"}</span><h2>{ko ? "문제에서 변경까지, 같은 화면에서." : "From issue to change in one view."}</h2><p>{ko ? "좌표·회전·충돌은 검증된 규칙이 검사합니다. 자동 설명이 가구를 임의로 움직이지 않습니다." : "Verified rules check coordinates, rotation, and collisions. Generated explanations never move furniture directly."}</p></div>
      <div className={styles.storySteps}>
        <article><h3>{ko ? "현재 배치" : "Current layout"}</h3><p>{ko ? "확인한 문·창·침대·책상·소파와 동선을 실제 렌더 픽셀로 표시합니다." : "Verified doors, windows, furniture, and circulation appear at the reported render resolution."}</p></article>
        <article><h3>{ko ? "추천 배치" : "Suggested layout"}</h3><p>{ko ? "전통 풍수 해석, 생활 공간 분석, 개인 패턴 추천을 분리해 최대 다섯 가지로 설명합니다." : "Up to five suggestions separate traditional interpretation, practical space analysis, and personal pattern context."}</p></article>
        <article><h3>{ko ? "Reality Check" : "Reality Check"}</h3><p>{ko ? "적용한 변경을 저장하고 나중에 실제 생활에서 어땠는지 기록할 수 있는 구조를 준비했습니다." : "Applied changes can be saved for later real-life reflection."}</p></article>
      </div>
    </section>
    <section className={styles.demoIntro} id="space-demo"><span className={styles.badge}>{ko ? "직접 조작하는 제품 데모" : "INTERACTIVE PRODUCT DEMO"}</span><h2>{ko ? "지금 방을 돌려 보고, 배치를 바꿔 보세요." : "Orbit the room and compare a new layout."}</h2><p>{ko ? "화질 메뉴를 바꾸면 오른쪽 아래에 실제 렌더 픽셀과 화면 배율이 표시됩니다." : "Change the quality tier to see the actual render pixels and scale in the lower-right corner."}</p></section>
    <SpaceWorkbench locale={locale} demo />
  </main>;
}
