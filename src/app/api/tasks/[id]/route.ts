import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { TaskStatus, TaskPriority } from "@/types";

function mapTask(t: Awaited<ReturnType<typeof db.task.findUnique>> & { assignees?: Array<{ user: { id: string; firstName: string; lastName: string; email: string; role: string; status: string; avatarColor: string | null; createdAt: Date } }>; comments?: Array<{ id: string; taskId: string; userId: string; content: string; createdAt: Date; user: { id: string; firstName: string; lastName: string; avatarColor: string | null } | null }> }) {
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

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const task = await db.task.findUnique({ where: { id }, include: includeShape });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json({ task: mapTask(task as Parameters<typeof mapTask>[0]) });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
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
        progress: body.progress !== undefined ? Number(body.progress) : undefined,
      },
      include: includeShape,
    });
    return NextResponse.json({ task: mapTask(task as Parameters<typeof mapTask>[0]) });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const task = await db.task.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status as TaskStatus }),
        ...(body.priority && { priority: body.priority as TaskPriority }),
        ...(body.progress !== undefined && { progress: Number(body.progress) }),
      },
      include: includeShape,
    });
    return NextResponse.json({ task: mapTask(task as Parameters<typeof mapTask>[0]) });
  } catch (error) {
    return NextResponse.json({ error: "Failed to patch task" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
