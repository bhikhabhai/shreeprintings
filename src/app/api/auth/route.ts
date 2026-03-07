import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        const adminUser = process.env.ADMIN_USERNAME;
        const adminPass = process.env.ADMIN_PASSWORD;

        if (!adminUser || !adminPass) {
            return NextResponse.json(
                { error: "Server misconfiguration: missing admin credentials" },
                { status: 500 }
            );
        }

        if (username === adminUser && password === adminPass) {
            // Create a simple session token
            const token = Buffer.from(
                JSON.stringify({ user: username, ts: Date.now() })
            ).toString("base64");

            const response = NextResponse.json({ success: true });
            response.cookies.set("auth_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });

            return response;
        }

        return NextResponse.json(
            { error: "Invalid credentials" },
            { status: 401 }
        );
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("auth_token");
    return response;
}
