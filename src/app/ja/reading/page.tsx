import type { Metadata } from "next";
import { JapaneseReadingIntake } from "@/components/japanese-reading-intake";

export const metadata: Metadata = { title: "リーディングを始める | 結 GYEOL", description: "生年月日から自分・関係・一年の流れを整理するパーソナルリーディング。" };

export default function JapaneseReadingPage() { return <JapaneseReadingIntake />; }
