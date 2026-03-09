import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// POST /api/reset-password — consume token and set new password
export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password required" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { resetToken: token } });

        if (!user || !user.resetTokenExpiry) {
            return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
        }

        if (new Date() > user.resetTokenExpiry) {
            return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return NextResponse.json({ success: true, username: user.username });
    } catch (err) {
        console.error("Reset password error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
