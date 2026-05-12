import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { TaskStatus, TaskPriority } from "@/types";

function mapTask(t: {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  project: string | null;
  tags: string[];
  dueDate: Date | null;
  progress: number;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  assignees: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      status: string;
      avatarColor: string | null;
      createdAt: Date;
    };
  }>;
  comments: Array<{
    id: string;
    taskId: string;
    userId: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      status: string;
      avatarColor: string | null;
      createdAt: Date;
    } | null;
  }>;
}) {
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
    createdBy: t.createdById,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    assignees: t.assignees.map((a) => ({
      id: a.user.id,
      firstName: a.user.firstName,
      lastName: a.user.lastName,
      email: a.user.email,
      role: a.user.role,
      status: a.user.status,
      avatarColor: a.user.avatarColor,
      createdAt: a.user.createdAt.toISOString(),
    })),
    comments: t.comments.map((c) => ({
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
    })),
  };
}

const includeShape = {
  assignees: { include: { user: true } },
  comments: { include: { user: true }, orderBy: { createdAt: "asc" as const } },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const priority = searchParams.get("priority") || "all";
  const status = searchParams.get("status") || "all";
  const assignee = searchParams.get("assignee") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "6", 10)));

  // Map search keywords to priority/status values for unified search
  const priorityMap: Record<string, string[]> = {
    urgent: ["urgent"],
    high: ["high"],
    medium: ["medium"],
    low: ["low"],
  };
  const statusMap: Record<string, string[]> = {
    todo: ["todo"],
    "to do": ["todo"],
    "in progress": ["in_progress"],
    "in_progress": ["in_progress"],
    done: ["done"],
    completed: ["done"],
    complete: ["done"],
  };

  const searchLower = search.toLowerCase().trim();
  const matchedPriorities = priorityMap[searchLower] || [];
  const matchedStatuses = statusMap[searchLower] || [];

  const where = {
    AND: [
      search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
              { project: { contains: search, mode: "insensitive" as const } },
              ...(matchedPriorities.length > 0
                ? [{ priority: { in: matchedPriorities as TaskPriority[] } }]
                : []),
              ...(matchedStatuses.length > 0
                ? [{ status: { in: matchedStatuses as TaskStatus[] } }]
                : []),
            ],
          }
        : {},
      priority !== "all" ? { priority: priority as TaskPriority } : {},
      status !== "all" ? { status: status as TaskStatus } : {},
      assignee ? { assignees: { some: { userId: assignee } } } : {},
    ],
  };

  try {
    const [tasks, total] = await Promise.all([
      db.task.findMany({
        where,
        include: includeShape,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.task.count({ where }),
    ]);

    // Get counts per status (from ALL tasks matching filters, ignoring pagination)
    const statusCounts = await db.task.groupBy({
      by: ["status"],
      where,
      _count: { status: true },
    });
    const counts = { todo: 0, in_progress: 0, done: 0 };
    statusCounts.forEach((g) => {
      counts[g.status as keyof typeof counts] = g._count.status;
    });

    const mapped = tasks.map((t) => mapTask(t as Parameters<typeof mapTask>[0]));

    return NextResponse.json({
      tasks: mapped,
      counts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const task = await db.task.create({
      data: {
        title: body.title,
        description: body.description,
        status: body.status || "todo",
        priority: body.priority || "medium",
        project: body.project,
        tags: body.tags || [],
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        progress: 0,
        createdById: body.createdBy,
        assignees: {
          create: (body.assignees || []).map((a: { id: string }) => ({ userId: a.id })),
        },
      },
      include: includeShape,
    });

    return NextResponse.json({ task: mapTask(task as Parameters<typeof mapTask>[0]) }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
