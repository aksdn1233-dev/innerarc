import type { Metadata } from "next";
import { Gowun_Batang, Gowun_Dodum } from "next/font/google";
import {
  socialImageAlt,
  socialImageContentType,
  socialImagePath,
  socialImageSize,
} from "@/app/social-image";
import { resolvePublicAppUrl } from "@/core/site-url";
import "./globals.css";

const bodyFont = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const displayFont = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const openGraphImage = {
  url: socialImagePath,
  alt: socialImageAlt,
  type: socialImageContentType,
  ...socialImageSize,
};

export const metadata: Metadata = {
  metadataBase: resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL),
  title: "결 GYEOL — 프리미엄 타로·신점 상담",
  description:
    "생년월일과 현재의 고민을 바탕으로 연애·관계·진로·재물의 흐름과 조심할 점을 쉽게 정리해 드립니다.",
  applicationName: "결 GYEOL",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "결 GYEOL",
    title: "결 GYEOL — 프리미엄 타로·신점 상담",
    description:
      "연애·관계·진로·재물의 흐름과 지금 필요한 조언을 쉽게 확인하세요.",
    locale: "en_US",
    alternateLocale: ["ko_KR"],
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "결 GYEOL — 프리미엄 타로·신점 상담",
    description:
      "연애·관계·진로·재물의 흐름과 지금 필요한 조언을 쉽게 확인하세요.",
    images: [openGraphImage],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <a className="skip-link" href="#main-content">
          본문으로 건너뛰기 / Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
