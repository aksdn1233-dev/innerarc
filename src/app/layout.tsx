import type { Metadata } from "next";
import { Noto_Sans_KR, Song_Myung } from "next/font/google";
import {
  socialImageAlt,
  socialImageContentType,
  socialImagePath,
  socialImageSize,
} from "@/app/social-image";
import { BRAND_SEARCH_ALIASES } from "@/core/brand-links";
import { brandNameKo } from "@/core/brand";
import { resolvePublicAppUrl } from "@/core/site-url";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  display: "swap",
  fallback: ["Pretendard Local", "Apple SD Gothic Neo", "sans-serif"],
  preload: false,
  variable: "--font-noto-sans-kr",
  weight: "variable",
});

const songMyung = Song_Myung({
  adjustFontFallback: false,
  display: "swap",
  fallback: ["Noto Serif KR", "AppleMyungjo", "serif"],
  variable: "--font-song-myung",
  weight: "400",
});

const openGraphImage = {
  url: socialImagePath,
  alt: socialImageAlt,
  type: socialImageContentType,
  ...socialImageSize,
};

// Public ownership proof issued for mygyeol.kr by Naver Search Advisor.
const naverSiteVerification =
  process.env.NAVER_SITE_VERIFICATION ?? "7e543b74b6a17ebc6418e21aaf86beffd07b9614";

export const metadata: Metadata = {
  metadataBase: resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL),
  title: `${brandNameKo} | 연애·돈·일·공부, 반복되는 흐름 찾기`,
  description:
    "연애·돈·일·공부에서 왜 늘 같은 자리에서 막히는지 생년월일만으로 찾아드립니다. "
    + "계산 근거를 전부 공개하고, 회원가입 없이 무료로 먼저 보실 수 있습니다.",
  applicationName: brandNameKo,
  keywords: [
    ...BRAND_SEARCH_ALIASES,
    "사주",
    "무료 사주",
    "운세",
    "오늘의 운세",
    "운명수",
    "생년월일 패턴",
    "궁합",
    "관계 리딩",
    "나의 성향",
    "나의 결",
    "나의 특징",
    "나의 장점",
    "타고난 성향",
    "타고난 기세",
    "Saju",
    "Numerology",
  ],
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    other: { "naver-site-verification": naverSiteVerification },
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: brandNameKo,
    title: `${brandNameKo} | 연애·돈·일·공부, 반복되는 흐름 찾기`,
    description:
      "왜 늘 같은 자리에서 막히는지 생년월일만으로 찾고, 계산 근거까지 전부 열어 보여드립니다.",
    locale: "en_US",
    alternateLocale: ["ko_KR"],
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brandNameKo} | 연애·돈·일·공부, 반복되는 흐름 찾기`,
    description:
      "왜 늘 같은 자리에서 막히는지 생년월일만으로 찾고, 계산 근거까지 전부 열어 보여드립니다.",
    images: [openGraphImage],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${notoSansKr.variable} ${songMyung.variable}`}>
        <a className="skip-link" href="#main-content">
          본문으로 건너뛰기 / Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
