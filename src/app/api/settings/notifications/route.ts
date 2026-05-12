import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const DEFAULT_PREFS = {
  taskAssigned: true,
  taskDue: true,
  commentMention: true,
  teamActivity: false,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });

    return NextResponse.json({
      preferences: {
        taskAssigned: user?.notifTaskAssigned ?? DEFAULT_PREFS.taskAssigned,
        taskDue: user?.notifTaskDue ?? DEFAULT_PREFS.taskDue,
        commentMention: user?.notifCommentMention ?? DEFAULT_PREFS.commentMention,
        teamActivity: user?.notifTeamActivity ?? DEFAULT_PREFS.teamActivity,
      },
    });
  } catch (error) {
    console.error("GET /api/settings/notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notification preferences" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const body = await request.json();

    await db.user.update({
      where: { id: userId },
      data: {
        notifTaskAssigned: body.taskAssigned ?? undefined,
        notifTaskDue: body.taskDue ?? undefined,
        notifCommentMention: body.commentMention ?? undefined,
        notifTeamActivity: body.teamActivity ?? undefined,
      },
    });

    return NextResponse.json({
      preferences: {
        taskAssigned: body.taskAssigned ?? DEFAULT_PREFS.taskAssigned,
        taskDue: body.taskDue ?? DEFAULT_PREFS.taskDue,
        commentMention: body.commentMention ?? DEFAULT_PREFS.commentMention,
        teamActivity: body.teamActivity ?? DEFAULT_PREFS.teamActivity,
      },
    });
  } catch (error) {
    console.error("PUT /api/settings/notifications error:", error);
    return NextResponse.json({ error: "Failed to update notification preferences" }, { status: 500 });
  }
}
