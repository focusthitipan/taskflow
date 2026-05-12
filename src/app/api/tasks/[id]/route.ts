import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { notifyUsers } from "@/lib/notify";
import type { TaskStatus, TaskPriority } from "@/types";

function mapTask(t: Awaited<ReturnType<typeof db.task.findUnique>> & { assignees?: Array<{ user: { id: string; firstName: string; lastName: string; email: string; role: string; status: string; avatarUrl: string | null; avatarColor: string | null; createdAt: Date } }>; comments?: Array<{ id: string; taskId: string; userId: string; content: string; createdAt: Date; user: { id: string; firstName: string; lastName: string; avatarUrl: string | null; avatarColor: string | null } | null }> }) {
  if (!t) return null;
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    project: t.project,
    tags: t.tags,
    dueDate: t.dueDate?.toISOString(),
    progress: t.progress,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    assignees: (t.assignees || []).map((a) => ({
      id: a.user.id,
      firstName: a.user.firstName,
      lastName: a.user.lastName,
      email: a.user.email,
      role: a.user.role,
      status: a.user.status,
      avatarUrl: a.user.avatarUrl,
      avatarColor: a.user.avatarColor,
      createdAt: a.user.createdAt.toISOString(),
    })),
    comments: (t.comments || []).map((c) => ({
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
            avatarUrl: c.user.avatarUrl,
            avatarColor: c.user.avatarColor,
          }
        : null,
    })),
  };
}

const includeShape = {
  assignees: { include: { user: true } },
  comments: { include: { user: true }, orderBy: { createdAt: "asc" as const } },
};

/**
 * Check if the current user can write to this task.
 * - Admin: always allowed
 * - Member: allowed only if assigned to the task
 * - Viewer: never allowed
 */
function notifyStatusChange(
  oldTask: { title: string; status: string; assignees: Array<{ user: { id: string } }>; createdById: string | null } | null,
  newStatus: string | undefined
) {
  if (!oldTask || !newStatus || newStatus === oldTask.status) return;
  const assigneeIds = oldTask.assignees.map((a) => a.user.id);
  const allInvolved = [...new Set([...assigneeIds, ...(oldTask.createdById ? [oldTask.createdById] : [])])];
  if (allInvolved.length > 0) {
    notifyUsers(allInvolved, "notifTeamActivity", {
      title: "Task Status Updated",
      message: `"${oldTask.title}" moved from ${oldTask.status.replace("_", " ")} to ${newStatus.replace("_", " ")}`,
      type: newStatus === "done" ? "success" : "info",
    });
  }
}

async function authorizeWrite(taskId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { authorized: false, status: 401, userId: null, role: null };

  const userId = (session.user as { id?: string }).id;
  const role = (session.user as { role?: string }).role;

  if (!userId) return { authorized: false, status: 401, userId: null, role: null };

  // Admin can do everything
  if (role === "admin") return { authorized: true, status: 200, userId, role };

  // Viewer cannot write at all
  if (role === "viewer") return { authorized: false, status: 403, userId, role };

  // Member: must be assigned to the task
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { assignees: true },
  });

  if (!task) return { authorized: false, status: 404, userId, role };

  const isAssigned = task.assignees.some((a) => a.userId === userId);
  if (!isAssigned) return { authorized: false, status: 403, userId, role };

  return { authorized: true, status: 200, userId, role };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const task = await db.task.findUnique({ where: { id }, include: includeShape });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json({ task: mapTask(task as Parameters<typeof mapTask>[0]) });
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const auth = await authorizeWrite(id);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: auth.status }
    );
  }

  try {
    const body = await req.json();

    const oldTask = await db.task.findUnique({
      where: { id },
      include: { assignees: { include: { user: true } } },
    });

    const task = await db.task.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        status: body.status as TaskStatus | undefined,
        priority: body.priority as TaskPriority | undefined,
        project: body.project,
        tags: body.tags,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        progress: body.progress === undefined ? undefined : Number(body.progress),
      },
      include: includeShape,
    });

    if (oldTask && body.status && body.status !== oldTask.status) {
      const assigneeIds = oldTask.assignees.map((a) => a.user.id);
      const creatorId = oldTask.createdById;
      const allInvolved = [...new Set([...assigneeIds, ...(creatorId ? [creatorId] : [])])];

      if (allInvolved.length > 0) {
        notifyUsers(allInvolved, "notifTeamActivity", {
          title: "Task Status Updated",
          message: `"${oldTask.title}" moved from ${oldTask.status.replace("_", " ")} to ${(body.status as string).replace("_", " ")}`,
          type: body.status === "done" ? "success" : "info",
        });
      }
    }

    return NextResponse.json({ task: mapTask(task as Parameters<typeof mapTask>[0]) });
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const auth = await authorizeWrite(id);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: auth.status }
    );
  }

  try {
    const body = await req.json();

    const oldTask = await db.task.findUnique({
      where: { id },
      include: { assignees: { include: { user: true } } },
    });

    const task = await db.task.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status as TaskStatus }),
        ...(body.priority && { priority: body.priority as TaskPriority }),
        ...(body.progress !== undefined && { progress: Number(body.progress) }),
      },
      include: includeShape,
    });

    notifyStatusChange(oldTask, body.status as string | undefined);

    return NextResponse.json({ task: mapTask(task as Parameters<typeof mapTask>[0]) });
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to patch task" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const auth = await authorizeWrite(id);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: auth.status }
    );
  }

  try {
    await db.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
