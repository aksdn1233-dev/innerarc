import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

const payAppResponseSchema = z.object({
  state: z.enum(["0", "1"]),
  errorMessage: z.string().optional().default(""),
  mul_no: z.string().regex(/^\d{1,30}$/).optional(),
  payurl: z.string().url().optional(),
}).passthrough();

export const payAppFeedbackSchema = z.object({
  userid: z.string().min(1).max(100),
  linkkey: z.string().min(1).max(500),
  linkval: z.string().min(1).max(500),
  price: z.string().regex(/^\d{3,10}$/),
  pay_state: z.enum([
    "1",
    "4",
    "8",
    "9",
    "10",
    "16",
    "31",
    "32",
    "64",
    "70",
    "71",
  ]),
  pay_type: z.string().regex(/^\d{1,3}$/),
  var1: z.string().regex(/^[A-Za-z0-9_-]{6,64}$/),
  var2: z.string().max(100).optional().default(""),
  mul_no: z.string().regex(/^\d{1,30}$/),
  pay_date: z.string().max(40).optional().default(""),
  canceldate: z.string().max(40).optional().default(""),
  vbank: z.string().max(100).optional().default(""),
  vbankno: z.string().max(100).optional().default(""),
  depositor: z.string().max(100).optional().default(""),
}).passthrough();

export type PayAppFeedback = z.infer<typeof payAppFeedbackSchema>;

export class PayAppApiError extends Error {
  /**
   * PayApp's own rejection wording, when it sent one. A merchant-side cause — seller
   * review still pending, a callback address it will not accept — is only visible
   * here, so it is carried out of this boundary for the operator's console rather
   * than discarded. It is never shown to a buyer.
   */
  readonly providerMessage: string;

  constructor(
    readonly code: "REQUEST_FAILED" | "INVALID_RESPONSE",
    providerMessage = "",
  ) {
    super("PayApp payment request failed.");
    this.providerMessage = providerMessage.slice(0, 500);
  }
}

export async function requestPayAppPayment(input: {
  userId: string;
  orderId: string;
  productCode: string;
  orderName: string;
  amount: number;
  customerPhone: string;
  customerEmail?: string;
  openPayTypes: string;
  feedbackUrl: string;
  returnUrl: string;
}) {
  const form = new URLSearchParams({
    cmd: "payrequest",
    userid: input.userId,
    goodname: input.orderName,
    price: String(input.amount),
    recvphone: input.customerPhone,
    memo: `태령당 주문 ${input.orderId}`,
    reqaddr: "0",
    feedbackurl: input.feedbackUrl,
    var1: input.orderId,
    var2: input.productCode,
    smsuse: "n",
    returnurl: input.returnUrl,
    openpaytype: input.openPayTypes,
    checkretry: "y",
    skip_cstpage: "y",
  });
  if (input.customerEmail) form.set("recvemail", input.customerEmail);

  let response: Response;
  try {
    response = await fetch("https://api.payapp.kr/oapi/apiLoad.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: form.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new PayAppApiError("REQUEST_FAILED", "페이앱 서버에 연결하지 못했습니다.");
  }
  if (!response.ok) {
    throw new PayAppApiError("REQUEST_FAILED", `페이앱 응답 오류 (HTTP ${response.status})`);
  }

  const raw = await response.text();
  const fields = Object.fromEntries(new URLSearchParams(raw));
  const parsed = payAppResponseSchema.safeParse(fields);
  if (
    !parsed.success ||
    parsed.data.state !== "1" ||
    !parsed.data.mul_no ||
    !parsed.data.payurl
  ) {
    const reported = typeof fields.errorMessage === "string" ? fields.errorMessage : "";
    throw new PayAppApiError(
      "INVALID_RESPONSE",
      reported || "페이앱이 결제요청을 거부했습니다.",
    );
  }
  const payUrl = new URL(parsed.data.payurl);
  const isPayAppHost =
    payUrl.hostname === "payapp.kr" || payUrl.hostname.endsWith(".payapp.kr");
  const isDefaultPort =
    !payUrl.port ||
    (payUrl.protocol === "http:" && payUrl.port === "80") ||
    (payUrl.protocol === "https:" && payUrl.port === "443");
  if (!isPayAppHost || !isDefaultPort || payUrl.username || payUrl.password) {
    throw new PayAppApiError("INVALID_RESPONSE", "페이앱이 아닌 결제 주소가 반환되었습니다.");
  }
  // Some PayApp REST responses still use the legacy http scheme even though the
  // same hosted checkout is available over HTTPS. Upgrade only verified PayApp
  // hosts; never follow an insecure or off-domain provider redirect.
  if (payUrl.protocol === "http:") {
    payUrl.protocol = "https:";
    payUrl.port = "";
  }
  if (payUrl.protocol !== "https:") {
    throw new PayAppApiError("INVALID_RESPONSE", "페이앱 결제 주소가 HTTPS가 아닙니다.");
  }
  return {
    requestNumber: parsed.data.mul_no,
    payUrl: payUrl.toString(),
  } as const;
}

/**
 * Asks PayApp to cancel a completed payment. Returns the provider's own verdict rather
 * than throwing, because the caller has to show the operator why a refund was refused.
 * Payment state is not written here: the feedback callback remains the single writer.
 */
export async function cancelPayAppPayment(input: {
  userId: string;
  linkKey: string;
  requestNumber: string;
  memo: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const form = new URLSearchParams({
    cmd: "paycancel",
    userid: input.userId,
    linkkey: input.linkKey,
    mul_no: input.requestNumber,
    cancelmemo: input.memo,
    partcancel: "0",
  });

  let response: Response;
  try {
    response = await fetch("https://api.payapp.kr/oapi/apiLoad.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: form.toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return { ok: false, message: "페이앱에 연결하지 못했습니다." };
  }
  if (!response.ok) {
    return { ok: false, message: `페이앱 응답 오류 (HTTP ${response.status})` };
  }

  const parsed = Object.fromEntries(new URLSearchParams(await response.text()));
  if (parsed.state === "1") return { ok: true };
  return {
    ok: false,
    message: typeof parsed.errorMessage === "string" && parsed.errorMessage
      ? parsed.errorMessage
      : "페이앱이 취소를 거부했습니다.",
  };
}

export function securePayAppValueMatches(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length &&
    timingSafeEqual(actualBytes, expectedBytes);
}

export function toInternalPayAppStatus(state: PayAppFeedback["pay_state"]) {
  switch (state) {
    case "1":
      return "READY";
    case "4":
      return "DONE";
    case "10":
      return "WAITING_FOR_DEPOSIT";
    case "70":
    case "71":
      return "PARTIAL_CANCELED";
    case "8":
    case "9":
    case "16":
    case "31":
    case "32":
    case "64":
      return "CANCELED";
  }
}

export function payAppMethodName(payType: string): string {
  return {
    "1": "CARD",
    "2": "MOBILE",
    "4": "FACE_TO_FACE",
    "6": "TRANSFER",
    "7": "VIRTUAL_ACCOUNT",
    "15": "KAKAOPAY",
    "16": "NAVERPAY",
    "17": "REGISTERED_PAYMENT",
    "21": "SMILEPAY",
    "22": "WECHATPAY",
    "23": "APPLEPAY",
    "24": "MYACCOUNT",
    "25": "TOSSPAY",
  }[payType] ?? `PAYAPP_${payType}`;
}
