import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { UserRole } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // In V1, invite is just creating a user with 'invited' status
    // Email sending is out of scope for V1 per SPEC
    const user = await db.user.create({
      data: {
        firstName: body.firstName || "Invited",
        lastName: body.lastName || "Member",
        email: body.email,
        password: "", // Will need to be set by user
        role: (body.role || "member") as UserRole,
        status: "inactive",
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/team/invite error:", error);
    return NextResponse.json({ error: "Failed to invite member" }, { status: 500 });
  }
}
