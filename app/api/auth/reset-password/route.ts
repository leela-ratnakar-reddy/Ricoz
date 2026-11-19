import { NextRequest, NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: Max 5 reset attempts per 5 minutes per IP
    const rateLimit = await checkRateLimit("public_reset_pw", clientIp, 5, 300);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many password reset attempts. Please wait ${rateLimit.resetInSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.resetInSeconds) },
        }
      );
    }

    const body = await req.json();
    const { email, otp, code, newPassword } = body;

    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanCode = typeof (otp || code) === "string" ? String(otp || code).trim() : "";

    if (!cleanEmail || !cleanCode) {
      return NextResponse.json(
        { success: false, error: "Please provide your email address and the 6-digit reset code." },
        { status: 400 }
      );
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 8 characters in length." },
        { status: 400 }
      );
    }

    const insforge = getInsforgeClient();

    // Step 1: Exchange code for reset token
    const exchangeRes = await (insforge.auth as any).exchangeResetPasswordToken({
      email: cleanEmail,
      code: cleanCode,
    });

    if (exchangeRes.error) {
      console.warn("Reset code exchange error for", cleanEmail, exchangeRes.error?.message || "Exchange failed");
      const isExpired = exchangeRes.error?.message?.toLowerCase().includes("expired");
      const safeErrorMsg = isExpired
        ? "Password reset code has expired. Please request a new code."
        : "Invalid or expired reset code. Please check your email.";
      return NextResponse.json(
        { success: false, error: safeErrorMsg },
        { status: 400 }
      );
    }

    const token = exchangeRes.data?.token || cleanCode;

    // Step 2: Reset password with token
    const resetRes = await insforge.auth.resetPassword({
      newPassword,
      otp: token,
    });

    if (resetRes.error) {
      console.warn("Reset password submission error for", cleanEmail, resetRes.error?.message || "Reset failed");
      return NextResponse.json(
        { success: false, error: "Failed to update password. Please ensure your new password meets requirements and try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully updated. You may now sign in.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
