import type { Metadata } from "next";
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
    <span className={styles.badge}>{ko ? "방을 살펴보고, 배치를 비교해요" : "Explore your room. Compare layouts."}</span><h1>{ko ? "3D 공간운" : "3D Space"}</h1>
    <p>{ko ? "문과 가구의 위치를 확인하고, 내 생활에 맞는 배치를 직접 비교하세요. 아래 예시 방으로 먼저 조작해 볼 수 있습니다." : "Check doors and furniture, then compare arrangements for your daily life. Try the example room below."}</p>
    <p><Link className={styles.linkButton} href={`/${locale}/space/workspace`} prefetch={false}>{ko ? "로그인하고 내 방 만들기" : "Sign in & create my room"}</Link></p>
    {!enabled && <p className={styles.hint}>{ko ? "내 방 저장·사진 분석은 출시 준비 중입니다. 예시 방은 지금 사용할 수 있습니다." : "Saved rooms and photo analysis are preparing for release. The example room is available now."}</p>}
    <SpaceWorkbench locale={locale} demo />
  </main>;
}
