import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "./config";

export async function refreshSupabaseSession(request: NextRequest): Promise<NextResponse> {
  // This runs in middleware, on nearly every request the site serves. A rejected
  // public config must not be able to take the entire site down — it was doing exactly
  // that, 500ing every route, when a secret key was pasted into the browser-public
  // variable. The malformed value is still a real misconfiguration (login and account
  // sync stay broken until it's fixed), but that is now the extent of the damage.
  let config: ReturnType<typeof getSupabasePublicConfig>;
  try {
    config = getSupabasePublicConfig();
  } catch {
    return NextResponse.next({ request });
  }
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
