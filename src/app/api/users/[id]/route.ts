import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { UserRole, UserStatus } from "@/types";

function mapUser(u: { id: string; firstName: string; lastName: string; email: string; role: string; status: string; avatarUrl: string | null; avatarColor: string | null; timezone: string | null; language: string | null; createdAt: Date }) {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role as UserRole,
    status: u.status as UserStatus,
    avatarUrl: u.avatarUrl,
    avatarColor: u.avatarColor,
    timezone: u.timezone,
    language: u.language,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ user: mapUser(user) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    const body = await req.json();
    const user = await db.user.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        role: body.role as UserRole | undefined,
        status: body.status as UserStatus | undefined,
        avatarColor: body.avatarColor,
        timezone: body.timezone,
      },
    });
    return NextResponse.json({ user: mapUser(user) });
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  try {
    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
