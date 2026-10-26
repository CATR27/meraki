import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// /offline la sirve el service worker cuando no hay red (sin sesión que validar).
const PUBLIC_PATHS = ["/login", "/offline"];

/**
 * Chequeo optimista: solo comprueba que exista la cookie de sesión.
 * La validación real (sesión vigente, rol) ocurre en el DAL (`src/lib/dal.ts`).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!isPublic && !getSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("desde", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
