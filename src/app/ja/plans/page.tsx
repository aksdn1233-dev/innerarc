import type { Metadata } from "next";
import { PlansExperience } from "@/components/plans-experience";
import { resolveProductPricing } from "@/core/product-prices";
import { requireSupabaseUser } from "@/lib/supabase/auth";
import { resolveSupabaseAdminClient } from "@/lib/supabase/admin";
import { inspectPaymentReadiness } from "@/server/payments/config";
import { readOperationsGate } from "@/server/payments/gate";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "リーディング商品 | 結 GYEOL", description: "必要な深さに合わせて選べる一回払いのパーソナルリーディング。" };

export default async function JapanesePlansPage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const query = await searchParams;
  const now = new Date();
  const pricing = resolveProductPricing();
  const admin = resolveSupabaseAdminClient().client;
  const [auth, gate] = await Promise.all([requireSupabaseUser(), readOperationsGate(admin)]);
  const readiness = inspectPaymentReadiness(process.env, undefined, now);
  const enabled = readiness.enabled && gate.salesEnabled && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const products = [
    { code: "plus_30d" as const, tier: "四柱推命・命式", name: "四柱推命・命式リーディング", amount: readiness.enabled ? readiness.config.products.plus_30d.amount : pricing.prices.plus_30d, regularAmount: pricing.regularPrices.plus_30d, features: ["四柱と通変星", "五行のバランスと節気", "出生時刻・真太陽時の補正根拠", "ウェブ閲覧・ファイル保存", "ギフト共有"] },
    { code: "pro_30d" as const, tier: "詳細分析", name: "詳細リーディング", amount: readiness.enabled ? readiness.config.products.pro_30d.amount : pricing.prices.pro_30d, regularAmount: pricing.regularPrices.pro_30d, features: ["5つの中心数と内面の矛盾", "一つの質問分野を詳しく分析", "二人の相性分析", "状況別の行動ガイド", "5段階の実行計画", "閲覧・ダウンロード・ギフト共有"] },
    { code: "premium_pdf" as const, tier: "プレミアム", name: "プレミアム深層リーディング", amount: readiness.enabled ? readiness.config.products.premium_pdf.amount : pricing.prices.premium_pdf, regularAmount: pricing.regularPrices.premium_pdf, features: ["詳細リーディングの全分析", "質問がなくても完結する総合レポート", "隠れた動機と失敗の根", "3つの可能性シナリオ", "6段階の実行と中止基準", "閲覧・ダウンロード・ギフト共有"] },
  ];
  const initialProduct = query.product === "plus_30d" || query.product === "pro_30d" || query.product === "premium_pdf" ? query.product : null;
  return <PlansExperience locale="ja" products={products} initialProduct={initialProduct} signedIn={Boolean(auth.user)} paymentsEnabled={enabled} paymentProvider={readiness.enabled ? readiness.config.provider : null} pricing={pricing} />;
}
