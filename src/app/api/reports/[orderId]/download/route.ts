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
  const basicV2 = report.sectionPlan === "basic-19000-v2";
  const detailV2 = report.sectionPlan === "detail-39000-v2";
  const premiumV2 = report.sectionPlan === "premium-79000-v2";
  const structuredV2 = basicV2 || detailV2 || premiumV2;
  const finalTitle = premiumV2
    ? (report.locale === "ko" ? "현실적인 조언과 마무리" : "Grounded closing advice")
    : (report.locale === "ko" ? "최종 결론" : "Final conclusion");
  const stopTitle = report.locale === "ko" ? "보류·중단·재검토 기준" : "Stop, hold, or reconsider";
  const stopSection = detailV2 || premiumV2
    ? report.sections.find((section) => section.title === stopTitle)
    : undefined;
  const premiumStopTitle = report.locale === "ko" ? "보류·중단·전환 기준 6가지" : "Six hold, stop, or pivot conditions";
  const premiumStopSection = premiumV2
    ? report.sections.find((section) => section.title === premiumStopTitle)
    : undefined;
  const premiumManualTitle = report.locale === "ko" ? "6단계 실행 매뉴얼" : "Six-step execution manual";
  const premiumManualSection = premiumV2
    ? report.sections.find((section) => section.title === premiumManualTitle)
    : undefined;
  const finalSection = structuredV2
    ? report.sections.find((section) => section.title === finalTitle)
    : undefined;
  const bodySections = report.sections.filter((section) =>
    section !== stopSection &&
    section !== premiumStopSection &&
    section !== premiumManualSection &&
    section !== finalSection
  );
  const premiumStartTitle = report.locale === "ko" ? "네 숫자를 하나로 읽는 종합 해석" : "Cross-number synthesis";
  const premiumStart = premiumV2
    ? bodySections.findIndex((section) => section.title === premiumStartTitle)
    : -1;
  const renderSections = (items: typeof bodySections) => items
    .map((section) => `<section><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></section>`)
    .join("");
  const sections = renderSections(premiumStart >= 0 ? bodySections.slice(0, premiumStart) : bodySections);
  const premiumExtensions = premiumStart >= 0 ? renderSections(bodySections.slice(premiumStart)) : "";
  const list = (items: readonly string[]) => `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  const basis = structuredV2 && report.calculationBasis
    ? `<p class="basis">${report.locale === "ko" ? "생년월일" : "Birth date"} ${escapeHtml(report.calculationBasis.birthDate)} · ${report.locale === "ko" ? "적용 연도" : "Applied year"} ${report.calculationBasis.serviceYear}</p>`
    : "";
  const question = report.concern ? `<blockquote>${escapeHtml(report.concern)}</blockquote>` : "";
  const cautions = basicV2 || (detailV2 && report.cautions.length === 0)
    ? ""
    : `<section><h2>${report.locale === "ko" ? "이럴 때는 조심하세요" : "Situations to watch"}</h2>${list(report.cautions)}</section>`;
  const stop = stopSection
    ? `<section class="stop"><h2>${escapeHtml(stopSection.title)}</h2><p>${escapeHtml(stopSection.body)}</p></section>`
    : "";
  const premiumStop = premiumStopSection
    ? `<section class="stop"><h2>${escapeHtml(premiumStopSection.title)}</h2><p>${escapeHtml(premiumStopSection.body)}</p></section>`
    : "";
  const premiumManual = premiumManualSection
    ? `<section class="manual"><h2>${escapeHtml(premiumManualSection.title)}</h2><p>${escapeHtml(premiumManualSection.body)}</p></section>`
    : "";
  const final = finalSection
    ? `<section class="final"><h2>${escapeHtml(finalSection.title)}</h2><p>${escapeHtml(finalSection.body)}</p></section>`
    : "";
  const actionTitle = detailV2 || premiumV2
    ? (report.locale === "ko" ? "우선 실행 계획" : "Prioritized execution plan")
    : (report.locale === "ko" ? "지금 해볼 일" : "Next actions");
  const html = `<!doctype html><html lang="${report.locale}"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(report.title)}</title><style>body{max-width:760px;margin:40px auto;padding:0 22px;color:#20231f;background:#fffdf8;font:18px/1.8 system-ui,sans-serif}h1,h2{font-family:serif;line-height:1.35}section{margin:38px 0;padding-top:20px;border-top:1px solid #d7d0c3}section p{white-space:pre-wrap}blockquote{padding:18px;background:#f5f1e8;border-left:4px solid #9b7651}.basis,.note{color:#686b63;font-size:14px}.stop{padding:24px;background:#fff7f2;border-radius:16px}.manual{padding:24px;background:#f4f1e8;border-radius:16px}.final{padding:24px;background:#f5f1e8;border-radius:16px}@media print{body{margin:0}}</style><body><h1>${escapeHtml(report.title)}</h1>${basis}<p>${escapeHtml(report.summary)}</p>${question}${sections}<section><h2>${actionTitle}</h2>${list(report.actions)}</section>${premiumManual}${stop}${premiumStop}${premiumExtensions}${final}${cautions}<p class="note">${escapeHtml(report.disclaimer)}</p></body></html>`;
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="innerarc-${orderId}.html"`,
      "Cache-Control": "private, no-store",
    },
  });
}
