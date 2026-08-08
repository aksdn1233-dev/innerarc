import { describe, expect, it } from "vitest";
import {
  hashCustomerPhone,
  issueOrderPass,
  normalizePhone,
  readOrderPass,
  tierForProduct,
} from "@/server/order-pass";

const ENV = { SUPABASE_SERVICE_ROLE_KEY: "sb_secret_test_key_for_signing_0001" };
const OTHER_ENV = { SUPABASE_SERVICE_ROLE_KEY: "sb_secret_a_different_key_000002" };
const ORDER = "ia0123456789abcdef";
const NOW = new Date("2026-07-28T00:00:00.000Z");

describe("order pass", () => {
  it("round-trips the order and its tier", () => {
    const pass = issueOrderPass({ orderId: ORDER, tier: "pro", now: NOW }, ENV);
    expect(pass).not.toBeNull();
    expect(readOrderPass(pass as string, NOW, ENV)).toMatchObject({
      orderId: ORDER,
      tier: "pro",
    });
  });

  it("rejects a pass whose tier was edited", () => {
    // The whole point of the gate: a plus buyer must not be able to claim pro.
    const pass = issueOrderPass({ orderId: ORDER, tier: "plus", now: NOW }, ENV) as string;
    const forged = pass.replace(".plus.", ".pro.");

    expect(readOrderPass(forged, NOW, ENV)).toBeNull();
  });

  it("rejects an expired pass and one signed with another key", () => {
    const pass = issueOrderPass({ orderId: ORDER, tier: "pro", now: NOW }, ENV) as string;
    const muchLater = new Date(NOW.getTime() + 400 * 24 * 60 * 60 * 1_000);

    expect(readOrderPass(pass, muchLater, ENV)).toBeNull();
    expect(readOrderPass(pass, NOW, OTHER_ENV)).toBeNull();
  });

  it("rejects malformed values without throwing", () => {
    for (const value of ["", "a.b.c", "a.b.c.d.e", `${ORDER}.gold.999.sig`]) {
      expect(readOrderPass(value, NOW, ENV)).toBeNull();
    }
    expect(readOrderPass(undefined, NOW, ENV)).toBeNull();
  });

  it("issues nothing when no server secret is configured", () => {
    expect(issueOrderPass({ orderId: ORDER, tier: "pro", now: NOW }, {})).toBeNull();
    expect(hashCustomerPhone("010-1234-5678", {})).toBeNull();
  });

  it("maps each product to the tier the database grants", () => {
    expect(tierForProduct("plus_30d")).toBe("plus");
    expect(tierForProduct("pro_30d")).toBe("pro");
    expect(tierForProduct("premium_pdf")).toBe("pro");
    expect(tierForProduct("something_else")).toBeNull();
  });
});

describe("return ticket", () => {
  it("round-trips the order it was issued for", async () => {
    const { issueOrderTicket, readOrderTicket } = await import("@/server/order-pass");
    const ticket = issueOrderTicket(ORDER, NOW, ENV) as string;

    expect(readOrderTicket(ticket, NOW, ENV)).toBe(ORDER);
  });

  it("cannot be pointed at a different order", async () => {
    const { issueOrderTicket, readOrderTicket } = await import("@/server/order-pass");
    const ticket = issueOrderTicket(ORDER, NOW, ENV) as string;
    const forged = ticket.replace(ORDER, "ia9999999999999999");

    expect(readOrderTicket(forged, NOW, ENV)).toBeNull();
  });

  it("expires and does not verify under another key", async () => {
    const { issueOrderTicket, readOrderTicket } = await import("@/server/order-pass");
    const ticket = issueOrderTicket(ORDER, NOW, ENV) as string;
    const afterExpiry = new Date(NOW.getTime() + 8 * 24 * 60 * 60 * 1_000);

    expect(readOrderTicket(ticket, afterExpiry, ENV)).toBeNull();
    expect(readOrderTicket(ticket, NOW, OTHER_ENV)).toBeNull();
  });

  it("rejects malformed values without throwing", async () => {
    const { readOrderTicket } = await import("@/server/order-pass");
    for (const value of ["", "a.b", "a.b.c.d", `${ORDER}.notanumber.sig`]) {
      expect(readOrderTicket(value, NOW, ENV)).toBeNull();
    }
    expect(readOrderTicket(undefined, NOW, ENV)).toBeNull();
  });

  it("is a different signature from an order pass for the same order", async () => {
    // Separate purposes must not be interchangeable: a ticket is not an entitlement.
    const { issueOrderTicket, readOrderPass } = await import("@/server/order-pass");
    const ticket = issueOrderTicket(ORDER, NOW, ENV) as string;
    expect(readOrderPass(ticket, NOW, ENV)).toBeNull();
  });
});

describe("phone lookup hash", () => {
  it("matches the same number written in different formats", () => {
    expect(normalizePhone("010-1234-5678")).toBe("01012345678");
    expect(hashCustomerPhone("010-1234-5678", ENV))
      .toBe(hashCustomerPhone("01012345678", ENV));
    expect(hashCustomerPhone("010 1234 5678", ENV))
      .toBe(hashCustomerPhone("01012345678", ENV));
  });

  it("separates different numbers and is peppered against a table leak", () => {
    expect(hashCustomerPhone("01012345678", ENV))
      .not.toBe(hashCustomerPhone("01012345679", ENV));
    // A bare hash of an 11-digit number is trivially reversible, so the digest must
    // depend on a server secret rather than the number alone.
    expect(hashCustomerPhone("01012345678", ENV))
      .not.toBe(hashCustomerPhone("01012345678", OTHER_ENV));
  });

  it("refuses values that are not a phone number", () => {
    for (const value of ["", "123", "abcdefghijk", "0101234567890000"]) {
      expect(hashCustomerPhone(value, ENV)).toBeNull();
    }
  });
});
