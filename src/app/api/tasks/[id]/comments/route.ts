import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyUsers, notifyOne } from "@/lib/notify";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const comments = await db.comment.findMany({
      where: { taskId: id },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    const mapped = comments.map((c) => ({
      id: c.id,
      taskId: c.taskId,
      userId: c.userId,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      user: c.user
        ? {
            id: c.user.id,
            firstName: c.user.firstName,
            lastName: c.user.lastName,
            email: c.user.email,
            role: c.user.role,
            status: c.user.status,
            avatarColor: c.user.avatarColor,
            createdAt: c.user.createdAt.toISOString(),
          }
        : null,
    }));

    return NextResponse.json({ comments: mapped });
  } catch (error) {
    console.error("GET /api/tasks/:id/comments error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    const role = (session.user as { role?: string }).role;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    // Viewer cannot comment
    if (role === "viewer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const comment = await db.comment.create({
      data: {
        taskId: id,
        userId,
        content: body.content,
      },
      include: { user: true },
    });

    // Also log activity
    const task = await db.task.findUnique({
      where: { id },
      include: { assignees: { include: { user: true } } },
    });

    if (task) {
      await db.activityLog.create({
        data: {
          userId,
          action: "commented on",
          targetType: "task",
          targetId: id,
          targetTitle: task.title,
        },
      });

      // 🔔 Notify assignees (skip commenter)
      const otherAssigneeIds = task.assignees
        .map((a) => a.user.id)
        .filter((uid) => uid !== userId);

      if (otherAssigneeIds.length > 0) {
        notifyUsers(otherAssigneeIds, "notifCommentMention", {
          title: "New Comment",
          message: `New comment on "${task.title}"`,
          type: "info",
        });
      }

      // 🔔 Check for @mentions in comment content
      const mentionPattern = /@(\S+)/g;
      const mentionedNames = [...new Set([...body.content.matchAll(mentionPattern)].map((m: RegExpMatchArray) => m[1]))];

      if (mentionedNames.length > 0) {
        const mentionedUsers = await db.user.findMany({
          where: {
            OR: mentionedNames.map((name) => ({
              firstName: { contains: name, mode: "insensitive" as const },
            })),
          },
          select: { id: true, firstName: true },
        });

        for (const mu of mentionedUsers) {
          if (mu.id !== userId) {
            notifyOne(mu.id, {
              title: "You Were Mentioned",
              message: `You were mentioned in a comment on "${task.title}"`,
              type: "info",
            }, "notifCommentMention");
          }
        }
      }
    }

    return NextResponse.json(
      {
        comment: {
          id: comment.id,
          taskId: comment.taskId,
          userId: comment.userId,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          user: comment.user
            ? {
                id: comment.user.id,
                firstName: comment.user.firstName,
                lastName: comment.user.lastName,
                email: comment.user.email,
                role: comment.user.role,
                status: comment.user.status,
                avatarColor: comment.user.avatarColor,
                createdAt: comment.user.createdAt.toISOString(),
              }
            : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tasks/:id/comments error:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
