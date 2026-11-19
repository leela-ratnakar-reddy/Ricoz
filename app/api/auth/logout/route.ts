import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearUserSessionCookies } from "@/lib/auth/userAuth";
import { destroyAdminSession, SESSION_COOKIE_NAME } from "@/lib/admin/auth";

export async function POST() {
  try {
    await clearUserSessionCookies();

    // Also clean up any active admin session cleanly
    const cookieStore = await cookies();
    const adminSessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (adminSessionCookie?.value) {
      await destroyAdminSession(adminSessionCookie.value);
    }
    cookieStore.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({
      success: true,
      message: "Successfully logged out.",
    });
  } catch (error: any) {
    console.error("POST /api/auth/logout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log out cleanly." },
      { status: 500 }
    );
  }
}
