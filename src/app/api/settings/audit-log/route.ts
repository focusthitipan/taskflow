import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "";
  const action = searchParams.get("action") || "";

  try {
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: "insensitive" };

    const logs = await db.activityLog.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const mapped = logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      targetTitle: log.targetTitle,
      metadata: log.metadata,
      createdAt: log.createdAt.toISOString(),
      user: log.user
        ? {
            id: log.user.id,
            firstName: log.user.firstName,
            lastName: log.user.lastName,
            email: log.user.email,
            role: log.user.role,
            status: log.user.status,
            avatarColor: log.user.avatarColor,
            createdAt: log.user.createdAt.toISOString(),
          }
        : null,
    }));

    return NextResponse.json({ logs: mapped });
  } catch (error) {
    console.error("GET /api/settings/audit-log error:", error);
    return NextResponse.json({ error: "Failed to fetch audit log" }, { status: 500 });
  }
}
