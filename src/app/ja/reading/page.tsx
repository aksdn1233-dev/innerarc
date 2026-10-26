import type { Metadata } from "next";
import { resolveProductPricing } from "@/core/product-prices";

export const dynamic = "force-dynamic";
import { JapaneseReadingIntake } from "@/components/japanese-reading-intake";

export const metadata: Metadata = { title: "リーディングを始める | 결", description: "生年月日から自分・関係・一年の流れを整理するパーソナルリーディング。" };

export default function JapaneseReadingPage() { return <JapaneseReadingIntake pricing={resolveProductPricing()} />; }
