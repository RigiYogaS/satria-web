import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("🛡️ Middleware - Path:", req.nextUrl.pathname);
    console.log(
      "🍪 Middleware - Cookies:",
      req.cookies.getAll().map((c) => c.name)
    );

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log("🔐 Middleware Auth Check:", {
          hasToken: !!token,
          path: req.nextUrl.pathname,
          tokenSub: token?.sub,
        });

        // Allow access to auth pages and API routes
        if (
          req.nextUrl.pathname.startsWith("/auth") ||
          req.nextUrl.pathname.startsWith("/api/auth")
        ) {
          return true;
        }

        // Require token for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/user/:path*",
    "/admin/:path*",
    "/api/absensi/:path*",
    "/api/cuti/:path*",
  ],
};
