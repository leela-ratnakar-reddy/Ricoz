import { NextRequest, NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: Max 5 password recovery requests per 10 minutes per IP
    const rateLimit = await checkRateLimit("public_forgot_pw", clientIp, 5, 600);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many password reset requests. Please wait ${rateLimit.resetInSeconds} seconds before trying again.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.resetInSeconds) },
        }
      );
    }

    const body = await req.json();
    const { email } = body;
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!cleanEmail) {
      return NextResponse.json(
        { success: false, error: "Please provide your registered email address." },
        { status: 400 }
      );
    }

    const insforge = getInsforgeClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ricoz-six.vercel.app";

    // Call InsForge SDK sendResetPasswordEmail
    await insforge.auth.sendResetPasswordEmail({
      email: cleanEmail,
      redirectTo: `${siteUrl}/reset-password`,
    });

    // Uniform response to prevent account enumeration
    return NextResponse.json({
      success: true,
      message: "If an account is associated with this email, a 6-digit password reset code has been dispatched.",
    });
  } catch (error: any) {
    console.error("Forgot password exception:", error?.message || error);
    // Even on error, return safe uniform message to mitigate account enumeration
    return NextResponse.json({
      success: true,
      message: "If an account is associated with this email, a 6-digit password reset code has been dispatched.",
    });
  }
}
