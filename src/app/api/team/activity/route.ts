import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const activity = await db.activityLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const mapped = activity.map((a) => ({
      id: a.id,
      userId: a.userId,
      action: a.action,
      targetType: a.targetType,
      targetId: a.targetId,
      targetTitle: a.targetTitle,
      createdAt: a.createdAt.toISOString(),
      user: a.user
        ? {
            id: a.user.id,
            firstName: a.user.firstName,
            lastName: a.user.lastName,
            email: a.user.email,
            role: a.user.role,
            status: a.user.status,
            avatarUrl: a.user.avatarUrl,
            avatarColor: a.user.avatarColor,
            createdAt: a.user.createdAt.toISOString(),
          }
        : null,
    }));

    return NextResponse.json({ activity: mapped });
  } catch (error) {
    console.error("GET /api/team/activity error:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
