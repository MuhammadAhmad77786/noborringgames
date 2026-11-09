import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/session";

/**
 * First line of defence: every route except /login and public assets needs a
 * valid session cookie. Pages and server actions re-check the user against
 * the database via requireUser()/assertRole().
 */
export async function proxy(req: NextRequest) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = req.nextUrl.pathname !== "/" ? `?next=${encodeURIComponent(req.nextUrl.pathname)}` : "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!login|api/cron|_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
