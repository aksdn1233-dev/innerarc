import type { Locale } from "@/i18n/config";
import type { NumerologyProfile } from "@/core/numerology";

export type PaidContentPreview = Readonly<{
  visible: string;
  fullBody: string;
  unlockedSectionTitle: string;
  lockedTopics: readonly string[];
}>;

export function createPaidContentPreview(profile: NumerologyProfile, locale: Locale): PaidContentPreview {
  const lifePath = profile.lifePath.value;
  const birthday = profile.birthday.value;
  const attitude = profile.attitude.value;
  const ko = locale === "ko";
  const visible = ko
    ? `생명수 ${lifePath}의 중심 방향은 첫인상 수 ${attitude}에서 보이는 관계 시작 방식과 항상 같지 않습니다. 생일수 ${birthday}의 실제 선택 속도 때문에, 사람 자체보다 어떤 상황에서 만났는지가 관계의 지속성에 더 크게 작용합니다.`
    : `Life Path ${lifePath} does not always enter relationships in the same way as Attitude ${attitude}. Birthday ${birthday} changes the pace of real decisions, so the setting of a meeting can matter more than first impressions.`;
  const continuation = ko
    ? ` 특히 역할과 기대가 처음부터 고정된 자리보다 서로의 기준을 작은 행동으로 확인할 수 있는 환경에서 장점이 드러납니다. 반대로 호감의 강도만으로 속도를 올리면 ${lifePath}의 중심 욕구와 ${attitude}의 외부 반응이 엇갈려 피로가 쌓일 수 있습니다. 첫 세 번의 만남에서는 연락 빈도보다 약속 변경, 거절 존중, 비용과 시간의 배분을 관찰하는 편이 더 정확합니다.`
    : ` Strengths are clearer where expectations can be tested through small actions rather than fixed immediately. If intensity sets the pace, the needs of ${lifePath} and the outward response of ${attitude} can diverge. In the first three meetings, observe changed plans, respect for refusal, and the sharing of time and cost.`;
  return {
    visible,
    fullBody: visible + continuation,
    unlockedSectionTitle: ko ? "관계가 시작되는 실제 조건" : "How meaningful relationships begin",
    lockedTopics: ko
      ? ["잘 맞는 만남 환경 3가지", "상대방에게 필요한 행동 특징", "반복해서 피해야 할 관계 유형"]
      : ["Three fitting meeting environments", "Behaviors to seek in a partner", "Relationship patterns to avoid"],
  };
}
