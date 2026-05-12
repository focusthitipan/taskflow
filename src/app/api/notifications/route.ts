import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(_request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const notifications = await db.notification.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const mapped = notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));

    return NextResponse.json({ notifications: mapped });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();

    if (body.readAll) {
      await db.notification.updateMany({
        where: { userId: auth.userId },
        data: { read: true },
      });
    } else if (body.id) {
      // Verify the notification belongs to the user
      const notif = await db.notification.findUnique({ where: { id: body.id } });
      if (!notif || notif.userId !== auth.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await db.notification.update({
        where: { id: body.id },
        data: { read: true },
      });
    }

    const notifications = await db.notification.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
