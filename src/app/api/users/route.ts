import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { UserRole, UserStatus } from "@/types";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

function mapUser(u: { id: string; firstName: string; lastName: string; email: string; role: string; status: string; avatarColor: string | null; avatarUrl: string | null; timezone: string | null; language: string | null; createdAt: Date }) {
  return {
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    role: u.role as UserRole,
    status: u.status as UserStatus,
    avatarColor: u.avatarColor,
    avatarUrl: u.avatarUrl,
    timezone: u.timezone,
    language: u.language,
    createdAt: u.createdAt.toISOString(),
  };
}

const VALID_SORT_BY = ["name", "email", "createdAt", "role"] as const;
type SortBy = (typeof VALID_SORT_BY)[number];

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "all";
  const status = searchParams.get("status") || "all";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));
  const sortBy = (VALID_SORT_BY.includes(searchParams.get("sort_by") as SortBy) ? searchParams.get("sort_by") : "createdAt") as SortBy;
  const sortDir = searchParams.get("sort_dir") === "asc" ? "asc" : "desc";

  const where = {
    AND: [
      search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" as const } },
              { lastName: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {},
      role !== "all" ? { role: role as UserRole } : {},
      status !== "all" ? { status: status as UserStatus } : {},
    ],
  };

  // Build orderBy based on sort_by
  let orderBy: Prisma.UserOrderByWithRelationInput;
  if (sortBy === "name") {
    orderBy = { firstName: sortDir };
  } else if (sortBy === "role") {
    orderBy = { role: sortDir };
  } else if (sortBy === "email") {
    orderBy = { email: sortDir };
  } else {
    orderBy = { createdAt: sortDir };
  }

  try {
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map(mapUser),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const hashedPw = body.password ? await bcrypt.hash(body.password, 10) : await bcrypt.hash("changeme123", 10);

    const user = await db.user.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: hashedPw,
        role: (body.role || "member") as UserRole,
        status: (body.status || "active") as UserStatus,
        avatarColor: body.avatarColor || "#EE5D50",
        timezone: body.timezone || "UTC+7",
        language: "en",
      },
    });

    return NextResponse.json({ user: mapUser(user) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
