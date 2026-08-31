import Link from "next/link";
import type { Locale } from "@/i18n/config";

export function ContentProtectionNotice({ locale }: { locale: Locale }) {
  return (
    <footer className="content-protection-notice">
      <p>
        {locale === "ko"
          ? "본 서비스의 콘텐츠·데이터·분석 결과·디자인·구조 및 시스템의 무단 수집·복제·재배포와 AI 학습·데이터셋 활용을 금지합니다. 침해 예방·조사와 증거보존을 위한 기술적 보호조치를 적용·운영할 수 있으며, 확인된 위반에는 이용 제한과 가능한 법적 조치를 진행할 수 있습니다."
          : "Unauthorized collection, copying, redistribution, AI training, dataset use, or systematic extraction of this service’s content, data, analysis, design, structure, and systems is prohibited. Technical safeguards may be applied for prevention, investigation, and evidence preservation, and confirmed violations may result in access restrictions and available legal action."}
      </p>
      <nav aria-label={locale === "ko" ? "법률 안내" : "Legal information"}>
        <Link href={`/${locale}/terms`}>{locale === "ko" ? "이용조건" : "Terms"}</Link>
        <Link href={`/${locale}/privacy`}>{locale === "ko" ? "개인정보" : "Privacy"}</Link>
      </nav>
    </footer>
  );
}
