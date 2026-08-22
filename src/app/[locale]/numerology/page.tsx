import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OnboardingExperience } from "@/components/onboarding-experience";
import { dictionaries } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return locale === "en"
    ? {
        title: "Numerology Life Path & Personal Numbers | GYEOL",
        description: "Calculate Life Path and other personal numbers with deterministic evidence for symbolic self-reflection, separately from Saju.",
        keywords: ["numerology", "Life Path number", "personal year", "numerology calculator"],
        alternates: { canonical: "/en/numerology", languages: { ko: "/ko/numerology", en: "/en/numerology" } },
      }
    : {
        title: "수비학 운명수·인생수 리딩 | 결 GYEOL",
        description: "생년월일로 인생수·태도수·개인연도를 계산 근거와 함께 확인하세요. 사주와 분리된 상징적 자기 성찰 수비학입니다.",
        keywords: ["수비학", "운명수", "인생수", "생년월일 수비학", "개인연도"],
        alternates: { canonical: "/ko/numerology", languages: { ko: "/ko/numerology", en: "/en/numerology" } },
      };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * The public, named entry for GYEOL numerology.
 *
 * `/profile` remains available for historical links and existing purchases. This route
 * gives the already-verified deterministic experience an explicit product home without
 * forking its calculator, interpretation rules, privacy behavior, or result UI.
 */
export default async function NumerologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <OnboardingExperience
      locale={locale}
      dictionary={dictionaries[locale]}
      routeName="numerology"
    />
  );
}
