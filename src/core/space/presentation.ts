import type { Action, Scene } from "./schema";
export function movementSummary(scene: Scene, action: Action, locale: "ko" | "en") {
  const object = scene.objects.find(o => o.id === action.objectId); if (!object) return "";
  const ko = locale === "ko";
  if (action.type === "rotate") return `${ko ? "회전" : "Rotate"} ${(action.rotation! - object.rotation + 360) % 360}°`;
  if (action.type !== "move" || action.x === null || action.z === null) return "";
  const dx = action.x - object.x, dz = action.z - object.z, distance = Math.hypot(dx, dz);
  const directions = [dx < -.01 ? ko ? "왼쪽" : "left" : dx > .01 ? ko ? "오른쪽" : "right" : "", dz < -.01 ? ko ? "위쪽" : "up" : dz > .01 ? ko ? "아래쪽" : "down" : ""].filter(Boolean).join(ko ? "·" : "/");
  return `${distance.toFixed(2)}m · ${ko ? "도면" : "plan"} ${directions}`;
}
