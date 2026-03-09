import { NextRequest, NextResponse } from "next/server";
import { decodeSession } from "@/lib/session";

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow login page and auth API
    if (
        pathname === "/login" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password" ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/forgot-password") ||
        pathname.startsWith("/api/reset-password")
    ) {
        return NextResponse.next();
    }

    // Allow static files and Next.js internals
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.endsWith(".ico") ||
        pathname.endsWith(".png") ||
        pathname.endsWith(".svg")
    ) {
        return NextResponse.next();
    }

    // Check for auth token
    const tokenCookie = request.cookies.get("auth_token");

    if (!tokenCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = decodeSession(tokenCookie.value);
    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const { role } = session;

    // EMPLOYEE — restrict to only /my-attendance and its API
    if (role === "EMPLOYEE") {
        const employeeAllowed = ["/my-attendance", "/api/my-attendance"];
        const allowed = employeeAllowed.some((p) => pathname.startsWith(p));
        if (!allowed) {
            return NextResponse.redirect(new URL("/my-attendance", request.url));
        }
    }

    // VIEW_ADMIN — block Users management and password management pages
    if (role === "VIEW_ADMIN") {
        if (pathname.startsWith("/users") || pathname.startsWith("/api/users") || pathname.startsWith("/manage-passwords")) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    // Refresh rolling session (30 min)
    const response = NextResponse.next();
    response.cookies.set("auth_token", tokenCookie.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 60,
    });

    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
