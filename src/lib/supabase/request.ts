import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "./config";

export async function refreshSupabaseSession(request: NextRequest): Promise<NextResponse> {
  const config = getSupabasePublicConfig();
  if (!config) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const client = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(items) {
        for (const item of items) {
          request.cookies.set(item.name, item.value);
        }
        response = NextResponse.next({ request });
        for (const item of items) {
          response.cookies.set(item.name, item.value, item.options);
        }
      },
    },
  });

  await client.auth.getUser();
  return response;
}
