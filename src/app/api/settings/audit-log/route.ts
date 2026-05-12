import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "";
  const action = searchParams.get("action") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "15", 10)));

  try {
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (action) where.action = { contains: action, mode: "insensitive" };

    const [logs, total] = await Promise.all([
      db.activityLog.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.activityLog.count({ where }),
    ]);

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
            avatarUrl: log.user.avatarUrl,
            avatarColor: log.user.avatarColor,
            createdAt: log.user.createdAt.toISOString(),
          }
        : null,
    }));

    return NextResponse.json({
      logs: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/settings/audit-log error:", error);
    return NextResponse.json({ error: "Failed to fetch audit log" }, { status: 500 });
  }
}
