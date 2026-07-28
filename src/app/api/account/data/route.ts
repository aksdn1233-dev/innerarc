import { crossOriginRefused, isSameOriginRequest } from "@/server/same-origin";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSupabaseUser } from "@/lib/supabase/auth";

const scopeSchema = z.enum(["all_data", "third_party"]);
const requestIdSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/);

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) return crossOriginRefused();
  const auth = await requireSupabaseUser();
  if (auth.error || !auth.client || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.error === "AUTH_REQUIRED" ? 401 : 503 });
  }

  const url = new URL(request.url);
  const parsedScope = scopeSchema.safeParse(url.searchParams.get("scope"));
  const parsedRequestId = requestIdSchema.safeParse(request.headers.get("x-client-request-id"));
  if (!parsedScope.success || !parsedRequestId.success) {
    return NextResponse.json({ error: "INVALID_DELETION_REQUEST" }, { status: 400 });
  }

  const { data, error } = await auth.client.rpc("delete_account_data", {
    p_request_id: parsedRequestId.data,
    p_scope: parsedScope.data,
  });
  if (error) {
    const status = error.code === "23505" ? 409 : 500;
    const code = status === 409 ? "DELETION_IDEMPOTENCY_CONFLICT" : "DELETION_FAILED";
    return NextResponse.json({ error: code }, { status });
  }

  return NextResponse.json(data);
}
