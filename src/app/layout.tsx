import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InnerArc — Personal Pattern Intelligence",
  description:
    "A self-discovery platform that connects symbolic reflection with real-world outcomes.",
  manifest: "/manifest.webmanifest",
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
