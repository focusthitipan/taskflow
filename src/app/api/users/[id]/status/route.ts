import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { UserStatus } from "@/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const body = await req.json();
    const user = await db.user.update({
      where: { id },
      data: { status: body.status as UserStatus },
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
    console.error("PATCH /api/users/:id/status error:", error);
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 });
  }
}
