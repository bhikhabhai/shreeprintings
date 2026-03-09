import nodemailer from "nodemailer";

export function createTransporter() {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    });
}

export async function sendPasswordResetEmail(
    toEmail: string,
    username: string,
    resetUrl: string
) {
    const transporter = createTransporter();

    await transporter.sendMail({
        from: `"Shree Multipack" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: "Password Reset Request — Shree Multipack",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; color: #fff; border-radius: 12px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 28px 32px;">
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700;">Shree Multipack</h1>
                    <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.8;">Attendance Management</p>
                </div>
                <div style="padding: 32px;">
                    <h2 style="margin: 0 0 8px; font-size: 18px; color: #e2e8f0;">Password Reset</h2>
                    <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
                        Hi <strong style="color: #e2e8f0">${username}</strong>,<br/>
                        We received a request to reset your password. Click the button below to set a new one.
                    </p>
                    <a href="${resetUrl}"
                        style="display: inline-block; margin: 20px 0; padding: 12px 28px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                        Reset Password
                    </a>
                    <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin-top: 16px;">
                        This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.
                    </p>
                </div>
            </div>
        `,
    });
}
