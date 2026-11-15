import { NextResponse, type NextRequest } from "next/server";
import { getProductBySlug } from "@/lib/mock/catalog";

/**
 * Product pages stream their content inside <Suspense> (for instant navigation),
 * so by the time the page could call notFound() the 200 status is already sent.
 * Check the slug here first, before streaming starts, so unknown products return
 * a real 404. The lookup is in-memory; keep this check fast.
 */
export function proxy(request: NextRequest) {
  const slug = decodeURIComponent(request.nextUrl.pathname.split("/")[2] ?? "");
  if (!getProductBySlug(slug)) {
    // A path that matches no route renders the app's not-found page with a 404 status.
    return NextResponse.rewrite(new URL("/_product-not-found", request.url));
  }
}

export const config = {
  matcher: "/catalog/:slug",
};
