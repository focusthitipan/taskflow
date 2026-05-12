import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const notif = await db.notification.findUnique({ where: { id } });
    if (!notif) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }
    if (notif.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.notification.update({
      where: { id },
      data: { read: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/notifications/:id/read error:", error);
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 });
  }
}
