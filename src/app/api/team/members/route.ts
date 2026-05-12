import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        assignedTasks: {
          include: { task: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const members = users.map((u) => {
      const taskCount = u.assignedTasks.length;
      const completedTaskCount = u.assignedTasks.filter(
        (a) => a.task.status === "done"
      ).length;
      const workloadPercent = Math.min(100, Math.round((taskCount / 15) * 100));

      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
        status: u.status,
        avatarColor: u.avatarColor,
        timezone: u.timezone,
        language: u.language,
        isOnline: u.isOnline,
        createdAt: u.createdAt.toISOString(),
        taskCount,
        completedTaskCount,
        workloadPercent,
      };
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("GET /api/team/members error:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}
