import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getDb } from "@/lib/admin/db";
import { recordAuditLog } from "@/lib/admin/audit";
import crypto from "node:crypto";

export async function GET(req: NextRequest) {
  try {
    const auth = await requirePermission("clients.view", req);
    if ("errorResponse" in auth) return auth.errorResponse;

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage");
    const search = searchParams.get("search")?.toLowerCase().trim();

    let query = `
      SELECT 
        c.id, c.name, c.industry, c.contact_name, c.contact_email, c.phone, c.company_size,
        c.onboarding_stage, c.assigned_owner_id, c.notes, c.next_follow_up, c.created_at, c.updated_at,
        u.full_name as assigned_owner_name,
        (SELECT count(*) FROM client_onboarding_items coi WHERE coi.client_id = c.id AND coi.is_completed = 1) as completed_checklist_count,
        (SELECT count(*) FROM client_onboarding_items coi WHERE coi.client_id = c.id) as total_checklist_count
      FROM clients c
      LEFT JOIN admin_users u ON c.assigned_owner_id = u.id
      WHERE 1=1
    `;

    const params: (string | number | null)[] = [];

    if (stage) {
      query += " AND c.onboarding_stage = ?";
      params.push(stage);
    }

    if (search) {
      query += " AND (LOWER(c.name) LIKE ? OR LOWER(c.contact_name) LIKE ? OR LOWER(c.contact_email) LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY c.created_at DESC";

    const clients = db.prepare(query).all(...params);

    return NextResponse.json({
      success: true,
      clients,
    });
  } catch (error) {
    console.error("Clients GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requirePermission("clients.create", req);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { user } = auth;

    const body = await req.json();
    const { name, industry, contactName, contactEmail, phone, companySize, stage, assignedOwnerId, notes, nextFollowUp } = body;

    if (!name || !contactName || !contactEmail) {
      return NextResponse.json({ success: false, error: "Company name, contact name, and contact email are required." }, { status: 400 });
    }

    const db = getDb();
    const clientId = `cli-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO clients (
        id, name, industry, contact_name, contact_email, phone, company_size,
        onboarding_stage, assigned_owner_id, notes, next_follow_up, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      clientId,
      name.trim(),
      industry || "Technology",
      contactName.trim(),
      contactEmail.trim(),
      phone || "",
      companySize || "10-50 employees",
      stage || "inquiry",
      assignedOwnerId || user.id,
      notes || "",
      nextFollowUp || null,
      now,
      now
    );

    // Seed standard onboarding checklist items for the client
    const defaultChecklist = [
      { title: "Execute Mutual Standard NDA", category: "Legal" },
      { title: "Verified Enterprise Billing Profile", category: "Finance" },
      { title: "Define Project Deliverables & Creative Brief", category: "Scoping" },
      { title: "Confirm Escrow Milestone Structure", category: "Finance" },
      { title: "Creative Lead Introduction & Alignment", category: "Kickoff" },
    ];

    const insertChecklist = db.prepare(`
      INSERT INTO client_onboarding_items (id, client_id, title, category, is_completed, created_at)
      VALUES (?, ?, ?, ?, 0, ?)
    `);

    defaultChecklist.forEach((item, idx) => {
      insertChecklist.run(`chk-${clientId}-${idx}`, clientId, item.title, item.category, now);
    });

    recordAuditLog({
      actor: user,
      action: "CLIENT_CREATED",
      entityType: "client",
      entityId: clientId,
      changeSummary: `Created enterprise client profile for ${name}`,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({ success: true, clientId, message: "Client created successfully." });
  } catch (error) {
    console.error("Client POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create client" }, { status: 500 });
  }
}
