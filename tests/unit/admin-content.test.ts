import { describe, expect, it } from "vitest";
import {
  AdminPageContentSchema,
  DEFAULT_ADMIN_PAGE_CONTENT,
  resolveAdminPageContent,
} from "@/server/admin-content";

describe("administrator-editable page content", () => {
  it("accepts bounded Korean and English hero copy", () => {
    expect(AdminPageContentSchema.parse(DEFAULT_ADMIN_PAGE_CONTENT))
      .toEqual(DEFAULT_ADMIN_PAGE_CONTENT);
  });

  it("falls back atomically when stored content is partial or malformed", () => {
    expect(resolveAdminPageContent({ ko: { heroTitle: "partial" } }))
      .toEqual(DEFAULT_ADMIN_PAGE_CONTENT);
    expect(resolveAdminPageContent(null)).toEqual(DEFAULT_ADMIN_PAGE_CONTENT);
  });

  it("rejects empty and unexpectedly long public copy", () => {
    expect(() => AdminPageContentSchema.parse({
      ...DEFAULT_ADMIN_PAGE_CONTENT,
      ko: { ...DEFAULT_ADMIN_PAGE_CONTENT.ko, heroTitle: "" },
    })).toThrow();
    expect(() => AdminPageContentSchema.parse({
      ...DEFAULT_ADMIN_PAGE_CONTENT,
      en: { ...DEFAULT_ADMIN_PAGE_CONTENT.en, heroBody: "x".repeat(241) },
    })).toThrow();
  });
});
