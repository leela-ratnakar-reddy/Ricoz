import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/permissions";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("vendors.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const { id } = await params;
    const db = getDb();

    const vendor = db.prepare(`
      SELECT 
        v.id, v.name, v.service_category, v.contact_name, v.contact_email, v.phone,
        v.onboarding_stage, v.verification_status, v.assigned_coordinator_id, v.notes,
        v.created_at, v.updated_at,
        u.full_name as assigned_coordinator_name
      FROM vendors v
      LEFT JOIN admin_users u ON v.assigned_coordinator_id = u.id
      WHERE v.id = ?
    `).get(id);

    if (!vendor) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });
    }

    const documents = db.prepare(`
      SELECT 
        vd.id, vd.vendor_id, vd.document_type, vd.file_name, vd.file_url, vd.is_verified,
        vd.verified_at,
        u.full_name as verified_by_user_name
      FROM vendor_documents vd
      LEFT JOIN admin_users u ON vd.verified_by_user_id = u.id
      WHERE vd.vendor_id = ?
      ORDER BY vd.created_at ASC
    `).all(id);

    return NextResponse.json({
      success: true,
      vendor,
      documents,
    });
  } catch (error) {
    console.error("Vendor detail GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch vendor" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("vendors.edit", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const { id } = await params;
    const db = getDb();

    const existing = db.prepare("SELECT * FROM vendors WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!existing) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });
    }

    const body = await req.json();
    const now = new Date().toISOString();

    // 1. Individual document verification toggle
    if (body.toggleDocId !== undefined) {
      if (!hasPermission(user, "vendors.approve")) {
        return NextResponse.json({ success: false, error: "Permission denied: 'vendors.approve' required to verify vendor documents." }, { status: 403 });
      }

      const isVerified = body.isVerified ? 1 : 0;
      db.prepare(`
        UPDATE vendor_documents SET
          is_verified = ?,
          verified_by_user_id = ?,
          verified_at = ?
        WHERE id = ? AND vendor_id = ?
      `).run(
        isVerified,
        isVerified ? user.id : null,
        isVerified ? now : null,
        body.toggleDocId,
        id
      );

      recordAuditLog({
        actor: user,
        action: "VENDOR_DOCUMENT_VERIFIED",
        entityType: "vendor_document",
        entityId: body.toggleDocId,
        changeSummary: `${isVerified ? "Verified" : "Unverified"} document on vendor ${existing.name}`,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      });

      return NextResponse.json({ success: true, message: "Document verification updated." });
    }

    // 2. Strict vendor status verification gate
    if (body.verificationStatus === "verified") {
      if (!hasPermission(user, "vendors.approve")) {
        return NextResponse.json({ success: false, error: "Permission denied: 'vendors.approve' required to verify a vendor." }, { status: 403 });
      }

      // Check whether all required documents are verified
      const unverifiedCount = (db.prepare(`
        SELECT count(*) as count FROM vendor_documents
        WHERE vendor_id = ? AND is_verified = 0
      `).get(id) as { count: number })?.count || 0;

      if (unverifiedCount > 0 && !body.forceOverride) {
        return NextResponse.json({
          success: false,
          error: `Cannot mark vendor as verified: ${unverifiedCount} required compliance document(s) remain unverified.`,
        }, { status: 400 });
      }
    }

    const stage = body.onboardingStage !== undefined ? body.onboardingStage : existing.onboarding_stage;
    const verificationStatus = body.verificationStatus !== undefined ? body.verificationStatus : existing.verification_status;
    const notes = body.notes !== undefined ? body.notes : existing.notes;
    const coordinatorId = body.assignedCoordinatorId !== undefined ? body.assignedCoordinatorId : existing.assigned_coordinator_id;

    db.prepare(`
      UPDATE vendors SET
        onboarding_stage = ?,
        verification_status = ?,
        notes = ?,
        assigned_coordinator_id = ?,
        updated_at = ?
      WHERE id = ?
    `).run(stage, verificationStatus, notes, coordinatorId, now, id);

    recordAuditLog({
      actor: user,
      action: "VENDOR_UPDATED",
      entityType: "vendor",
      entityId: id,
      changeSummary: `Updated vendor ${existing.name}: status=${verificationStatus}, stage=${stage}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "Vendor updated successfully." });
  } catch (error) {
    console.error("Vendor PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update vendor" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("vendors.delete", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const { id } = await params;
    const db = getDb();

    const existing = db.prepare("SELECT name FROM vendors WHERE id = ?").get(id) as { name: string } | undefined;
    if (!existing) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });
    }

    db.prepare("DELETE FROM vendors WHERE id = ?").run(id);

    recordAuditLog({
      actor: user,
      action: "VENDOR_DELETED",
      entityType: "vendor",
      entityId: id,
      changeSummary: `Deleted vendor "${existing.name}".`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, message: "Vendor deleted successfully." });
  } catch (error) {
    console.error("Vendor DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete vendor" }, { status: 500 });
  }
}
