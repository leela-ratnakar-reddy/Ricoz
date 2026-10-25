import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest, hasPermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";
import crypto from "node:crypto";

export async function GET(req: NextRequest) {
  try {
    const user = getAdminUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const stage = searchParams.get("stage");
    const search = searchParams.get("search")?.toLowerCase().trim();

    let query = `
      SELECT 
        v.id, v.name, v.service_category, v.contact_name, v.contact_email, v.phone,
        v.onboarding_stage, v.verification_status, v.assigned_coordinator_id, v.notes,
        v.created_at, v.updated_at,
        u.full_name as assigned_coordinator_name,
        (SELECT count(*) FROM vendor_documents vd WHERE vd.vendor_id = v.id AND vd.is_verified = 1) as verified_docs_count,
        (SELECT count(*) FROM vendor_documents vd WHERE vd.vendor_id = v.id) as total_docs_count
      FROM vendors v
      LEFT JOIN admin_users u ON v.assigned_coordinator_id = u.id
      WHERE 1=1
    `;

    const params: (string | number | null)[] = [];

    if (status) {
      query += " AND v.verification_status = ?";
      params.push(status);
    }

    if (stage) {
      query += " AND v.onboarding_stage = ?";
      params.push(stage);
    }

    if (search) {
      query += " AND (LOWER(v.name) LIKE ? OR LOWER(v.service_category) LIKE ? OR LOWER(v.contact_name) LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY v.created_at DESC";

    const vendors = db.prepare(query).all(...params);

    return NextResponse.json({
      success: true,
      vendors,
    });
  } catch (error) {
    console.error("Vendors GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch vendors" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAdminUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
    }

    if (!hasPermission(user.role, "edit_vendors")) {
      return NextResponse.json({ success: false, error: "Permission denied." }, { status: 403 });
    }

    const body = await req.json();
    const { name, serviceCategory, contactName, contactEmail, phone, coordinatorId, notes } = body;

    if (!name || !serviceCategory || !contactName || !contactEmail) {
      return NextResponse.json({ success: false, error: "Name, category, contact name, and email are required." }, { status: 400 });
    }

    const db = getDb();
    const vendorId = `ven-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO vendors (
        id, name, service_category, contact_name, contact_email, phone,
        onboarding_stage, verification_status, assigned_coordinator_id, notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'application', 'unverified', ?, ?, ?, ?)
    `).run(
      vendorId,
      name.trim(),
      serviceCategory.trim(),
      contactName.trim(),
      contactEmail.trim(),
      phone || "",
      coordinatorId || user.id,
      notes || "",
      now,
      now
    );

    // Seed standard required compliance documents
    const requiredDocs = [
      { type: "Master Services Agreement", file: `${name.toLowerCase().replace(/\s+/g, "_")}_msa.pdf` },
      { type: "Tax W-9 / W-8BEN Remittance", file: `${name.toLowerCase().replace(/\s+/g, "_")}_tax.pdf` },
      { type: "Portfolio Craft Verification", file: `${name.toLowerCase().replace(/\s+/g, "_")}_portfolio_audit.pdf` },
      { type: "Professional Indemnity Insurance", file: `${name.toLowerCase().replace(/\s+/g, "_")}_insurance.pdf` },
    ];

    const insertDoc = db.prepare(`
      INSERT INTO vendor_documents (id, vendor_id, document_type, file_name, file_url, is_verified, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `);

    requiredDocs.forEach((doc, idx) => {
      insertDoc.run(
        `vdoc-${vendorId}-${idx}`,
        vendorId,
        doc.type,
        doc.file,
        `/docs/vendors/${doc.file}`,
        now
      );
    });

    recordAuditLog({
      actor: user,
      action: "VENDOR_REGISTERED",
      entityType: "vendor",
      entityId: vendorId,
      changeSummary: `Registered vendor partner ${name} (${serviceCategory})`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, vendorId, message: "Vendor created successfully." });
  } catch (error) {
    console.error("Vendor POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create vendor" }, { status: 500 });
  }
}
