import { NextRequest, NextResponse } from "next/server";
import { getInsforgeClient } from "@/lib/insforge";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting: Max 3 resend attempts per 5 minutes per IP
    const rateLimit = await checkRateLimit("public_resend_otp", clientIp, 3, 300);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${rateLimit.resetInSeconds} seconds before requesting another code.`,
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
        { success: false, error: "Please provide your email address." },
        { status: 400 }
      );
    }

    const insforge = getInsforgeClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ricoz-six.vercel.app";
    const res = await insforge.auth.resendVerificationEmail({
      email: cleanEmail,
      redirectTo: `${siteUrl}/login`,
    });

    if (res.error) {
      console.warn("InsForge resendVerification error:", res.error.message);
      if (res.error.message?.toLowerCase().includes("already verified")) {
        return NextResponse.json(
          { success: false, error: "This email address is already verified. Please sign in." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Unable to resend verification code at this time. Please try again shortly." },
        { status: res.error.statusCode || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "A fresh verification code has been dispatched to your email address.",
    });
  } catch (error: any) {
    console.error("Resend verification code exception:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Unable to resend verification code. Please try again later." },
      { status: 500 }
    );
  }
}
