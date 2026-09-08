import type { Recommendation, Scene } from "./schema";

export const SPACE_GUIDE_NARRATION_VERSION = "space-guide-template-1.1.0" as const;

export type SpaceGuideNarration = Readonly<{
  objectId: string | null;
  caption: string;
  detail: string;
  templateId: string;
}>;

export function buildSpaceGuideNarration(
  recommendation: Recommendation,
  scene: Scene,
  objectName: string,
  locale: "ko" | "en",
): SpaceGuideNarration {
  const object = recommendation.action.objectId
    ? scene.objects.find((item) => item.id === recommendation.action.objectId)
    : undefined;
  const ko = locale === "ko";
  const action = recommendation.action.type;
  const location = object
    ? (ko ? `${objectName}, 방 왼쪽에서 ${object.x.toFixed(1)}미터, 위쪽에서 ${object.z.toFixed(1)}미터 지점` : `${objectName}, ${object.x.toFixed(1)} metres from the left and ${object.z.toFixed(1)} metres from the top`)
    : (ko ? "방 전체" : "the whole room");
  const verb = action === "move" ? (ko ? "옮겨 볼 위치를 표시했어요" : "I marked a position to compare")
    : action === "rotate" ? (ko ? "돌려 볼 방향을 표시했어요" : "I marked a rotation to compare")
    : (ko ? "현장에서 확인할 지점을 표시했어요" : "I marked what to check in the real room");
  return {
    objectId: object?.id ?? null,
    caption: ko ? `${object ? objectName : "방 전체"} 배치를 함께 볼게요. ${verb}.` : `Let's look at ${object ? objectName : "the room"}. ${verb}.`,
    detail: `${location}. ${recommendation.rationale}`,
    templateId: `${SPACE_GUIDE_NARRATION_VERSION}:${recommendation.ruleId}:${action}`,
  };
}
