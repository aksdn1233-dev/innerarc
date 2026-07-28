import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { ORDER_PASS_COOKIE, readOrderPass, readOrderTicket } from "@/server/order-pass";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { getAuthorizedStoredReport } from "@/server/reports/access";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(orderId)) {
    return NextResponse.json({ error: "INVALID_ORDER" }, { status: 400 });
  }
  const auth = await requireSupabaseUser();
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "UNAVAILABLE" }, { status: 503 });
  const query = new URL(request.url).searchParams;
  const accessToken = query.get("access") ?? undefined;
  const provenOrderId = readOrderTicket(query.get("t") ?? undefined, new Date()) ??
    readOrderPass((await cookies()).get(ORDER_PASS_COOKIE)?.value, new Date())?.orderId;
  const stored = await getAuthorizedStoredReport({
    lookupProof: query.get("proof") ?? undefined,
    provenOrderId: provenOrderId ?? undefined,
    admin,
    orderId,
    userId: auth.user?.id,
    accessToken,
  });
  if (!stored || stored.status !== "ready" || !stored.report) {
    return NextResponse.json({ error: "REPORT_NOT_FOUND" }, { status: 404 });
  }
  const report = stored.report;
  const sections = report.sections
    .map((section) => `<section><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></section>`)
    .join("");
  const list = (items: readonly string[]) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  const html = `<!doctype html><html lang="${report.locale}"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(report.title)}</title><style>body{max-width:760px;margin:40px auto;padding:0 22px;color:#20231f;background:#fffdf8;font:18px/1.8 system-ui,sans-serif}h1,h2{font-family:serif;line-height:1.35}section{margin:38px 0;padding-top:20px;border-top:1px solid #d7d0c3}section p{white-space:pre-wrap}blockquote{padding:18px;background:#f5f1e8;border-left:4px solid #9b7651}.note{color:#686b63;font-size:14px}@media print{body{margin:0}}</style><body><h1>${escapeHtml(report.title)}</h1><p>${escapeHtml(report.summary)}</p><blockquote>${escapeHtml(report.concern)}</blockquote>${sections}<section><h2>${report.locale === "ko" ? "지금 해볼 일" : "Next actions"}</h2>${list(report.actions)}</section><section><h2>${report.locale === "ko" ? "이럴 때는 조심하세요" : "Situations to watch"}</h2>${list(report.cautions)}</section><p class="note">${escapeHtml(report.disclaimer)}</p></body></html>`;
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="innerarc-${orderId}.html"`,
      "Cache-Control": "private, no-store",
    },
  });
}
