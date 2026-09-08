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
        <span className={styles.badge}>{ko ? "3D 공간운" : "3D SPACE"}</span>
        <h1>{ko ? <><span>내 방을 찍고,</span><span>더 편한 배치를</span><span>찾아보세요.</span></> : <><span>Photograph your room.</span><span>Find a layout</span><span>that works better.</span></>}</h1>
        <p>{ko ? "사진 2~6장과 북쪽 방향, 벽 한 곳의 길이만 준비하면 돼요." : "All you need is 2–6 photos, north, and the length of one wall."}</p>
        <div className={styles.heroActions}><Link className={`${styles.linkButton} ${styles.primary}`} href={`/${locale}/space/workspace`} prefetch={false}>{ko ? "내 방 분석하기" : "Analyze my room"}</Link><a href="#space-demo">{ko ? "3D 예시 먼저 보기" : "Try the 3D example"}</a></div>
        <ul className={styles.proofStrip}><li>{ko ? "사진 찍기" : "Take photos"}</li><li>{ko ? "방향 확인" : "Check north"}</li><li>{ko ? "배치 비교" : "Compare layouts"}</li></ul>
        {!enabled && <p className={styles.hint}>{ko ? "사진 분석은 준비 중이에요. 아래 3D 예시는 지금 바로 써볼 수 있어요." : "Photo analysis is coming soon. You can use the 3D example now."}</p>}
      </div>
      <figure className={styles.heroVisual}>
        <Image src="/images/space/space-intelligence-hero.png" alt={ko ? "태령당 예시 거실의 실제 3D 렌더 화면" : "Actual 3D render of a sample living room in Taeryeongdang"} width={1354} height={1082} priority sizes="(max-width: 900px) 100vw, 55vw" />
        <figcaption>{ko ? "현재 배치와 추천 배치를 같은 화면에서 비교해요." : "Compare the current and suggested layouts in the same view."}</figcaption>
      </figure>
    </section>
    <section className={styles.story}>
      <div className={styles.storyLead}><span className={styles.badge}>{ko ? "이용 방법" : "HOW IT WORKS"}</span><h2>{ko ? "세 단계면 충분해요." : "Three simple steps."}</h2><p>{ko ? "복잡한 설정은 나중에 확인해도 돼요." : "You can review the details later."}</p></div>
      <div className={styles.storySteps}>
        <article><b>1</b><h3>{ko ? "방을 찍어요" : "Take room photos"}</h3><p>{ko ? "방 전체가 보이게 반대쪽에서도 찍어주세요." : "Include the whole room from opposite sides."}</p></article>
        <article><b>2</b><h3>{ko ? "북쪽을 알려주세요" : "Show north"}</h3><p>{ko ? "휴대폰 나침반으로 방향을 확인해요." : "Check the direction with your phone compass."}</p></article>
        <article><b>3</b><h3>{ko ? "배치를 비교해요" : "Compare layouts"}</h3><p>{ko ? "지금 모습과 추천 배치를 3D로 바꿔가며 봐요." : "Switch between the current and suggested 3D layouts."}</p></article>
      </div>
    </section>
    <section className={styles.demoIntro} id="space-demo"><span className={styles.badge}>{ko ? "3D 예시" : "3D EXAMPLE"}</span><h2>{ko ? "먼저 직접 움직여보세요." : "Try it now."}</h2><p>{ko ? "방을 돌려 보고 가구를 선택한 뒤, 추천 배치를 비교해보세요." : "Orbit the room, choose furniture, then compare the suggested layout."}</p></section>
    <SpaceWorkbench locale={locale} demo />
  </main>;
}
