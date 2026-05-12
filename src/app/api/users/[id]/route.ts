import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { UserRole, UserStatus } from "@/types";

function mapUser(u: { id: string; firstName: string; lastName: string; email: string; role: string; status: string; avatarColor: string | null; timezone: string | null; language: string | null; isOnline: boolean; createdAt: Date }) {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role as UserRole,
    status: u.status as UserStatus,
    avatarColor: u.avatarColor,
    timezone: u.timezone,
    language: u.language,
    isOnline: u.isOnline,
    createdAt: u.createdAt.toISOString(),
  };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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
  const { id } = await params;
  try {
    await db.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
