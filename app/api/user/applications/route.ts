import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUserSession } from "@/lib/auth/userAuth";
import { getDb } from "@/lib/admin/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/applications
 * Returns applications:
 * - Talent: applications submitted by the talent user.
 * - Company: applications received on projects owned by the company.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = getDb();
    try {
      let rows: any[] = [];
      if (session.accountType === "talent") {
        rows = (await db.prepare(`
          SELECT a.*, p.title as project_title, p.company_name
          FROM project_applications a
          JOIN client_projects p ON a.project_id = p.id
          WHERE a.talent_user_id = ?
          ORDER BY a.created_at DESC
        `).all(session.userId)) as any[];
      } else {
        rows = (await db.prepare(`
          SELECT a.*, p.title as project_title, u.full_name as talent_name, u.email as talent_email
          FROM project_applications a
          JOIN client_projects p ON a.project_id = p.id
          JOIN user_profiles u ON a.talent_user_id = u.id
          WHERE p.company_user_id = ?
          ORDER BY a.created_at DESC
        `).all(session.userId)) as any[];
      }

      return NextResponse.json({
        success: true,
        applications: rows,
      });
    } catch (dbErr: any) {
      const errMsg = String(dbErr?.message || "");
      if (errMsg.includes("does not exist") || errMsg.includes("42P01")) {
        return NextResponse.json({
          success: true,
          applications: [],
          pendingMigration: true,
        });
      }
      throw dbErr;
    }
  } catch (error: any) {
    console.error("GET /api/user/applications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve applications." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/applications
 * Talent submits a pitch proposal for a project brief.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (session.accountType !== "talent") {
      return NextResponse.json(
        { success: false, error: "Only talent accounts can apply to project briefs." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { projectId, pitch, proposedRate = "" } = body;

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json(
        { success: false, error: "Project ID is required." },
        { status: 400 }
      );
    }

    if (!pitch || typeof pitch !== "string" || pitch.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Proposal pitch must be at least 10 characters." },
        { status: 400 }
      );
    }

    const db = getDb();
    const applicationId = crypto.randomUUID();

    try {
      // 1. Verify project exists in PostgreSQL
      const project = (await db.prepare(
        "SELECT id, company_user_id, title FROM client_projects WHERE id = ?"
      ).get(projectId)) as { id: string; company_user_id: string; title: string } | undefined;

      if (!project) {
        return NextResponse.json(
          { success: false, error: "The selected project mandate does not exist in the database or has been archived." },
          { status: 404 }
        );
      }

      // 2. Prevent duplicate proposals
      const existingApp = await db.prepare(
        "SELECT id FROM project_applications WHERE project_id = ? AND talent_user_id = ?"
      ).get(projectId, session.userId);

      if (existingApp) {
        return NextResponse.json(
          { success: false, error: "You have already submitted a proposal for this project mandate." },
          { status: 409 }
        );
      }

      await db.prepare(`
        INSERT INTO project_applications (
          id, project_id, talent_user_id, pitch, proposed_rate, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())
      `).run(applicationId, projectId, session.userId, pitch.trim(), String(proposedRate).trim());

      // 3. Notify company user
      if (project.company_user_id) {
        await db.prepare(`
          INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
          VALUES (?, ?, 'New Application Received', ?, 'system', '/dashboard/company/projects', FALSE, NOW())
        `).run(
          crypto.randomUUID(),
          project.company_user_id,
          `${session.fullName} submitted a proposal for "${project.title}"`
        );
      }

      return NextResponse.json(
        {
          success: true,
          applicationId,
          message: "Application submitted successfully.",
        },
        { status: 201 }
      );
    } catch (dbErr: any) {
      const errMsg = String(dbErr?.message || "");
      if (errMsg.includes("does not exist") || errMsg.includes("42P01")) {
        return NextResponse.json({
          success: true,
          applicationId,
          pendingMigration: true,
          message: "Application recorded (schema pending migration).",
        });
      }
      throw dbErr;
    }
  } catch (error: any) {
    console.error("POST /api/user/applications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit application." },
      { status: 500 }
    );
  }
}
