import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";

export async function GET(req: NextRequest) {
  try {
    const user = getAdminUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const db = getDb();
    const today = new Date().toISOString().split("T")[0];

    // Overdue tasks
    const overdueRow = db.prepare(`
      SELECT count(*) as count FROM tasks 
      WHERE status != 'completed' AND due_date < ?
    `).get(today) as { count: number };

    // Open/Escalated tickets
    const ticketRow = db.prepare(`
      SELECT count(*) as count FROM support_tickets 
      WHERE status IN ('open', 'escalated')
    `).get() as { count: number };

    // Pending vendors
    const vendorRow = db.prepare(`
      SELECT count(*) as count FROM vendors 
      WHERE verification_status = 'pending_review'
    `).get() as { count: number };

    // Unread notifications for current user
    const notifRow = db.prepare(`
      SELECT count(*) as count FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `).get(user.id) as { count: number };

    return NextResponse.json({
      success: true,
      counts: {
        overdueTasks: overdueRow?.count || 0,
        openTickets: ticketRow?.count || 0,
        pendingVendors: vendorRow?.count || 0,
        unreadNotifications: notifRow?.count || 0,
      },
    });
  } catch (error) {
    console.error("Dashboard badges API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch badge counts" }, { status: 500 });
  }
}
