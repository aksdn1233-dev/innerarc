"use client";

import { ShareCardPanel } from "@/components/share-card-panel";
import type { Locale } from "@/i18n/config";
import { buildRomanticPatternShare } from "@/core/share";
import type { RelationshipInsight } from "@/core/relationship";

type Props = {
  locale: Locale;
  insight: RelationshipInsight;
};

export function RelationshipSharePanel({ locale, insight }: Props) {
  return (
    <ShareCardPanel payload={buildRomanticPatternShare({ locale, insight })} />
  );
}
