import type { Metadata } from "next";
import {
  socialImageAlt,
  socialImageContentType,
  socialImagePath,
  socialImageSize,
} from "@/app/social-image";
import { resolvePublicAppUrl } from "@/core/site-url";
import "./globals.css";

const openGraphImage = {
  url: socialImagePath,
  alt: socialImageAlt,
  type: socialImageContentType,
  ...socialImageSize,
};

export const metadata: Metadata = {
  metadataBase: resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL),
  title: "결 GYEOL — 나의 성향부터 올해의 흐름까지",
  description:
    "타고난 나의 성향부터 학업·직업·연애, 가까운 사람과의 관계, 올해의 흐름까지 한 번에 알기 쉽게 정리해드립니다.",
  applicationName: "결 GYEOL",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "결 GYEOL",
    title: "결 GYEOL — 나의 성향부터 올해의 흐름까지",
    description:
      "나의 성향과 학업·직업·연애, 가까운 사람과의 관계, 올해의 흐름을 알기 쉽게 확인하세요.",
    locale: "en_US",
    alternateLocale: ["ko_KR"],
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "결 GYEOL — 나의 성향부터 올해의 흐름까지",
    description:
      "나의 성향과 학업·직업·연애, 가까운 사람과의 관계, 올해의 흐름을 알기 쉽게 확인하세요.",
    images: [openGraphImage],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          본문으로 건너뛰기 / Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
