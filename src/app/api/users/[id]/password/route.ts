import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const hashedPw = await bcrypt.hash(password, 10);
    await db.user.update({
      where: { id },
      data: { password: hashedPw },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/users/:id/password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
