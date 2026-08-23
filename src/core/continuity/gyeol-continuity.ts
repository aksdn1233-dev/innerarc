export type GyeolContinuityAction = Readonly<{
  kind: "paid_report" | "reality_check" | "tarot_history" | "daily_flow" | "first_reflection";
  title: string;
  description: string;
  href: string;
}>;

export type GyeolContinuityInput = Readonly<{
  locale: "ko" | "en";
  paidReportCount: number;
  latestPaidReportHref?: string;
  realityCheckCount: number;
  tarotReadingCount: number;
  dailyFlowEnabled: boolean;
}>;

/**
 * Builds product-native continuation choices from records the user already owns.
 * It never infers a changed destiny, scores a private question, or creates a
 * marketing-message reason when there is no saved value to continue.
 */
export function buildGyeolContinuity(input: GyeolContinuityInput): GyeolContinuityAction[] {
  const ko = input.locale === "ko";
  const actions: GyeolContinuityAction[] = [];

  if (input.paidReportCount > 0 && input.latestPaidReportHref) {
    actions.push({
      kind: "paid_report",
      title: ko ? "내 리포트 다시 읽기" : "Return to my report",
      description: ko
        ? `구매한 리포트 ${input.paidReportCount}개 중 가장 최근 이야기를 이어서 볼 수 있어요.`
        : `Continue with the most recent of your ${input.paidReportCount} purchased reports.`,
      href: input.latestPaidReportHref,
    });
  }
  if (input.realityCheckCount > 0) {
    actions.push({
      kind: "reality_check",
      title: ko ? "현실 점검 이어가기" : "Continue a Reality Check",
      description: ko
        ? `저장한 현실 점검 ${input.realityCheckCount}개를 돌아보고 실제 결과를 다음 성찰에 연결해요.`
        : `Review ${input.realityCheckCount} saved Reality Checks and carry real outcomes into the next reflection.`,
      href: `/${input.locale}/reality-check`,
    });
  }
  if (input.tarotReadingCount > 0) {
    actions.push({
      kind: "tarot_history",
      title: ko ? "지난 질문 다시 보기" : "Revisit a saved question",
      description: ko
        ? `기기에 저장한 타로 리딩 ${input.tarotReadingCount}개를 불러와 같은 질문을 다시 살펴볼 수 있어요.`
        : `Load ${input.tarotReadingCount} readings saved on this device and revisit a prior question.`,
      href: `/${input.locale}/question`,
    });
  }
  if (input.dailyFlowEnabled) {
    actions.push({
      kind: "daily_flow",
      title: ko ? "오늘의 흐름 확인하기" : "Open today's Daily Flow",
      description: ko
        ? "기기에 직접 켜 둔 오늘의 흐름을 확인해요. 날짜가 같으면 계산 결과도 바뀌지 않아요."
        : "Open the Daily Flow enabled on this device. Its deterministic result stays stable for the same date.",
      href: `/${input.locale}/daily-fortune`,
    });
  }

  if (actions.length === 0) {
    actions.push({
      kind: "first_reflection",
      title: ko ? "첫 이야기를 남겨보기" : "Begin a first reflection",
      description: ko
        ? "아직 이어갈 기록이 없어요. 질문 하나를 성찰하고 원할 때만 이 기기에 저장할 수 있어요."
        : "There is no saved thread yet. Reflect on one question and save it on this device only if you choose.",
      href: `/${input.locale}/question`,
    });
  }

  return actions.slice(0, 3);
}
