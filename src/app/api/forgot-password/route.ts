import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

// POST /api/forgot-password — request a reset link
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // Always return success to prevent user enumeration
        if (!user) {
            return NextResponse.json({ success: true });
        }

        // Generate a secure token valid for 1 hour
        const token = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken: token, resetTokenExpiry: expiry },
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;

        await sendPasswordResetEmail(user.email!, user.username, resetUrl);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Forgot password error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
