import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/admin/auth";

export async function GET(req: NextRequest) {
  try {
    const user = getAdminUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Auth me API error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
