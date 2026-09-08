import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { spaceAIConfig, spaceEnabled } from "@/server/space/config";
import { SpaceWorkbench } from "@/components/space/workbench";
import styles from "@/components/space/space.module.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "3D 공간운 · Workspace", robots: { index: false, follow: false, noarchive: true } };
export default async function WorkspacePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const auth = await requireSupabaseUser(), ko = locale === "ko";
  return <main className={styles.surface} id="main-content">
    <nav className={styles.nav} aria-label={ko ? "공간운 메뉴" : "Space navigation"}><Link href={`/${locale}/space`}>{ko ? "3D 공간운" : "3D Space"}</Link><Link href={`/${locale}/me`}>{ko ? "내 계정" : "My account"}</Link></nav>
    <h1>{ko ? "내 방 작업실" : "My room workspace"}</h1>
    {!auth.user ? <section className={styles.panel}><h2>{ko ? "내 방을 안전하게 보관하려면 로그인해 주세요" : "Sign in to keep your room private"}</h2><p>{ko ? "방 사진과 분석은 로그인한 본인만 볼 수 있습니다." : "Your room photos and analysis are available only to your account."}</p><Link href={`/${locale}/me`}>{ko ? "내 계정에서 로그인" : "Sign in through My account"}</Link></section>
      : <SpaceWorkbench locale={locale} enabled={spaceEnabled()} aiReady={Boolean(spaceAIConfig())} />}
  </main>;
}
