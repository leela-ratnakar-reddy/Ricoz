import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getAllPermissions } from "@/lib/admin/permissions";

export async function GET(req: NextRequest) {
  const auth = await requirePermission("users.view", req);
  if ("errorResponse" in auth) return auth.errorResponse;

  try {
    const permissions = getAllPermissions();
    return NextResponse.json({ success: true, permissions });
  } catch (error) {
    console.error("Permissions GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch permissions catalogue." }, { status: 500 });
  }
}
