import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Log token di server
    console.log("MIDDLEWARE TOKEN:", req.nextauth.token);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Log authorized callback
        console.log("AUTHORIZED CALLBACK TOKEN:", token, req.nextUrl.pathname);
        if (
          req.nextUrl.pathname.startsWith("/auth") ||
          req.nextUrl.pathname.startsWith("/api/auth")
        ) {
          return true;
        }
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
