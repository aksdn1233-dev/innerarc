import { permanentRedirect } from "next/navigation";

/**
 * The site has one home per locale and `/` is not one of them.
 *
 * This was a temporary redirect, which tells a crawler to keep asking for `/` and to leave
 * the ranking signals there rather than passing them to `/ko`. Permanent says what is
 * actually true: this address is not coming back.
 */
export default function RootPage() {
  permanentRedirect("/ko");
}
