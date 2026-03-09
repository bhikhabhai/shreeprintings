import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encodeSession } from "@/lib/session";

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 }
            );
        }

        // Check against DB users first
        const dbUser = await prisma.user.findUnique({ where: { username } });

        if (dbUser) {
            const valid = await bcrypt.compare(password, dbUser.passwordHash);
            if (!valid) {
                return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
            }

            const token = encodeSession({
                userId: dbUser.id,
                username: dbUser.username,
                role: dbUser.role,
                employeeId: dbUser.employeeId,
                ts: Date.now(),
            });

            const response = NextResponse.json({
                success: true,
                role: dbUser.role,
                employeeId: dbUser.employeeId,
            });
            response.cookies.set("auth_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 30 * 60,
            });
            return response;
        }

        // Fallback: bootstrap super-admin via env vars
        const superUser = process.env.SUPER_ADMIN_USERNAME;
        const superPass = process.env.SUPER_ADMIN_PASSWORD;

        if (superUser && superPass && username === superUser && password === superPass) {
            const token = encodeSession({
                userId: "env-super-admin",
                username: superUser,
                role: "SUPER_ADMIN",
                employeeId: null,
                ts: Date.now(),
            });

            const response = NextResponse.json({ success: true, role: "SUPER_ADMIN" });
            response.cookies.set("auth_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 30 * 60,
            });
            return response;
        }

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    } catch (err) {
        console.error("Auth error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("auth_token");
    return response;
}

export async function GET(request: NextRequest) {
    const token = request.cookies.get("auth_token");
    if (!token) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { decodeSession } = await import("@/lib/session");
    const session = decodeSession(token.value);
    if (!session) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json({
        userId: session.userId,
        username: session.username,
        role: session.role,
        employeeId: session.employeeId ?? null,
    });
}
