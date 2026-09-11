import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JapaneseReportSample } from "@/components/japanese-report-sample";
import { isSampleReportKind } from "@/server/reports/sample-report";

export const metadata: Metadata = {
  title: "結果レポート例 | 태령당",
  description: "実際の計算規則で作った日本語の結果レポート例です。",
  robots: { index: false, follow: false },
};

export default async function JapaneseSamplePage({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!isSampleReportKind(kind)) notFound();
  return <JapaneseReportSample kind={kind} />;
}
