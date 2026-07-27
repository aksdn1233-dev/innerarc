import type { Metadata } from "next";
import { Gowun_Batang, Gowun_Dodum } from "next/font/google";
import { socialImageAlt, socialImageContentType, socialImageSize } from "@/app/social-image";
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
  url: "/opengraph-image",
  alt: socialImageAlt,
  type: socialImageContentType,
  ...socialImageSize,
};

export const metadata: Metadata = {
  metadataBase: resolvePublicAppUrl(process.env.NEXT_PUBLIC_APP_URL),
  title: "InnerArc — Personal Pattern Intelligence",
  description:
    "A self-discovery platform that connects symbolic reflection with real-world outcomes.",
  applicationName: "InnerArc",
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "InnerArc",
    title: "InnerArc — Personal Pattern Intelligence",
    description:
      "A self-discovery platform that connects symbolic reflection with real-world outcomes.",
    locale: "en_US",
    alternateLocale: ["ko_KR"],
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "InnerArc — Personal Pattern Intelligence",
    description:
      "A self-discovery platform that connects symbolic reflection with real-world outcomes.",
    images: [{ ...openGraphImage, url: "/twitter-image" }],
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
