import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    let workspace = await db.workspaceSetting.findFirst();

    if (!workspace) {
      workspace = await db.workspaceSetting.create({
        data: {
          name: "TaskFlow Workspace",
          defaultPriority: "medium",
          tags: ["Design", "Backend", "Frontend", "DevOps", "Research", "Bug", "Feature"],
          workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          businessHoursStart: "09:00",
          businessHoursEnd: "18:00",
        },
      });
    }

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        logoUrl: workspace.logoUrl,
        defaultPriority: workspace.defaultPriority,
        tags: workspace.tags,
        workingDays: workspace.workingDays,
        businessHoursStart: workspace.businessHoursStart,
        businessHoursEnd: workspace.businessHoursEnd,
      },
    });
  } catch (error) {
    console.error("GET /api/settings/workspace error:", error);
    return NextResponse.json({ error: "Failed to fetch workspace" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    let workspace = await db.workspaceSetting.findFirst();

    if (workspace) {
      workspace = await db.workspaceSetting.update({
        where: { id: workspace.id },
        data: {
          name: body.name,
          defaultPriority: body.defaultPriority,
          tags: body.tags,
          workingDays: body.workingDays,
          businessHoursStart: body.businessHoursStart,
          businessHoursEnd: body.businessHoursEnd,
        },
      });
    } else {
      workspace = await db.workspaceSetting.create({ data: body });
    }

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("PUT /api/settings/workspace error:", error);
    return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 });
  }
}
