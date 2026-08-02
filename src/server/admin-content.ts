import { z } from "zod";

const localizedContent = z.object({
  heroKicker: z.string().trim().min(1).max(80),
  heroTitle: z.string().trim().min(1).max(80),
  heroBody: z.string().trim().min(1).max(240),
  primaryCta: z.string().trim().min(1).max(40),
}).strict();

export const AdminPageContentSchema = z.object({
  ko: localizedContent,
  en: localizedContent,
}).strict();

export type AdminPageContent = z.infer<typeof AdminPageContentSchema>;

export const DEFAULT_ADMIN_PAGE_CONTENT: AdminPageContent = {
  ko: {
    heroKicker: "사주명리와는 다른, 현실 선택 중심의 리딩",
    heroTitle: "왜 나는 같은 선택을 반복할까요?",
    heroBody: "타고난 성향과 반복되는 관계·일·돈의 패턴을 살펴보고, 올해 어떤 선택에 힘을 주어야 할지 정리해드립니다.",
    primaryCta: "내 패턴 확인하기",
  },
  en: {
    heroKicker: "A different kind of reading, centered on real-life choices",
    heroTitle: "Why do I keep making the same choices?",
    heroBody: "Explore your natural tendencies and recurring patterns in relationships, work, and money—then clarify where to place your energy this year.",
    primaryCta: "See my patterns",
  },
};

/** Invalid or old database values can never take the public home page down. */
export function resolveAdminPageContent(value: unknown): AdminPageContent {
  const parsed = AdminPageContentSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_ADMIN_PAGE_CONTENT;
}
