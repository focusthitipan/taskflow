import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { UserRole } from "@/types";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const user = await db.user.update({
      where: { id },
      data: { role: body.role as UserRole },
    });
    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("PUT /api/team/members/:id error:", error);
    return NextResponse.json({ error: "Failed to update member role" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/team/members/:id error:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
