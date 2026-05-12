import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data (order matters for FK)
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.taskAssignee.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.workspaceSetting.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleaned existing data");

  // Hash passwords
  const adminPw = await bcrypt.hash("admin123", 10);
  const memberPw = await bcrypt.hash("member123", 10);
  const viewerPw = await bcrypt.hash("viewer123", 10);

  // Create users
  const admin = await prisma.user.create({
    data: {
      firstName: "Alex",
      lastName: "Johnson",
      email: "admin@taskflow.io",
      password: adminPw,
      role: "admin",
      status: "active",
      avatarColor: "#EE5D50",
      timezone: "UTC+7",
      language: "en",
    },
  });

  const sarah = await prisma.user.create({
    data: {
      firstName: "Sarah",
      lastName: "Chen",
      email: "sarah@taskflow.io",
      password: memberPw,
      role: "member",
      status: "active",
      avatarColor: "#01B574",
      timezone: "UTC+8",
      language: "en",
    },
  });

  const marcus = await prisma.user.create({
    data: {
      firstName: "Marcus",
      lastName: "Rivera",
      email: "marcus@taskflow.io",
      password: memberPw,
      role: "member",
      status: "active",
      avatarColor: "#FFB547",
      timezone: "UTC-5",
      language: "en",
    },
  });

  const priya = await prisma.user.create({
    data: {
      firstName: "Priya",
      lastName: "Patel",
      email: "priya@taskflow.io",
      password: memberPw,
      role: "member",
      status: "active",
      avatarColor: "#EE5D50",
      timezone: "UTC+5:30",
      language: "en",
    },
  });

  const tom = await prisma.user.create({
    data: {
      firstName: "Tom",
      lastName: "Walsh",
      email: "tom@taskflow.io",
      password: viewerPw,
      role: "viewer",
      status: "inactive",
      avatarColor: "#3965FF",
      timezone: "UTC+0",
      language: "en",
    },
  });

  console.log("👥 Created 5 users");

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: "Design new onboarding flow",
      description: "Create wireframes and high-fidelity mockups for the revised user onboarding experience.",
      status: "todo",
      priority: "high",
      project: "Product Design",
      tags: ["Design", "UX"],
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      progress: 20,
      createdById: admin.id,
      assignees: {
        create: [
          { userId: sarah.id },
          { userId: priya.id },
        ],
      },
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Implement authentication module",
      description: "Build JWT-based authentication with refresh token support.",
      status: "todo",
      priority: "urgent",
      project: "Backend API",
      tags: ["Backend", "Security"],
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      progress: 0,
      createdById: admin.id,
      assignees: {
        create: [{ userId: marcus.id }],
      },
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: "Set up CI/CD pipeline",
      description: "Configure GitHub Actions for automated testing and deployment.",
      status: "todo",
      priority: "medium",
      project: "DevOps",
      tags: ["DevOps", "Infrastructure"],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      progress: 5,
      createdById: admin.id,
      assignees: {
        create: [{ userId: admin.id }],
      },
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: "Write API documentation",
      description: "Document all REST endpoints using OpenAPI 3.0 spec.",
      status: "in_progress",
      priority: "medium",
      project: "Backend API",
      tags: ["Documentation"],
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      progress: 55,
      createdById: sarah.id,
      assignees: {
        create: [
          { userId: sarah.id },
          { userId: marcus.id },
        ],
      },
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: "Mobile responsive fixes",
      description: "Address layout issues on mobile screens below 768px.",
      status: "in_progress",
      priority: "high",
      project: "Frontend",
      tags: ["Frontend", "Bug"],
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      progress: 70,
      createdById: admin.id,
      assignees: {
        create: [{ userId: priya.id }],
      },
    },
  });

  const task6 = await prisma.task.create({
    data: {
      title: "Performance optimization audit",
      description: "Run Lighthouse audits and optimize Core Web Vitals.",
      status: "in_progress",
      priority: "low",
      project: "Frontend",
      tags: ["Performance"],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      progress: 30,
      createdById: sarah.id,
      assignees: {
        create: [
          { userId: admin.id },
          { userId: sarah.id },
        ],
      },
    },
  });

  const task7 = await prisma.task.create({
    data: {
      title: "User interview sessions",
      description: "Conduct 10 user interviews for the upcoming redesign research.",
      status: "done",
      priority: "high",
      project: "Research",
      tags: ["Research", "UX"],
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      progress: 100,
      createdById: admin.id,
      assignees: {
        create: [{ userId: sarah.id }],
      },
    },
  });

  const task8 = await prisma.task.create({
    data: {
      title: "Database schema migration",
      description: "Migrate from v1 to v2 schema with zero downtime strategy.",
      status: "done",
      priority: "urgent",
      project: "Backend API",
      tags: ["Backend", "Database"],
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      progress: 100,
      createdById: admin.id,
      assignees: {
        create: [
          { userId: marcus.id },
          { userId: admin.id },
        ],
      },
    },
  });

  const task9 = await prisma.task.create({
    data: {
      title: "Setup monitoring & alerting",
      description: "Configure Datadog dashboards and PagerDuty alert rules.",
      status: "done",
      priority: "medium",
      project: "DevOps",
      tags: ["DevOps", "Monitoring"],
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      progress: 100,
      createdById: admin.id,
      assignees: {
        create: [{ userId: admin.id }],
      },
    },
  });

  console.log("📋 Created 9 tasks");

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        taskId: task1.id,
        userId: sarah.id,
        content: "Starting on wireframes today. Will share a draft by end of week.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        taskId: task4.id,
        userId: marcus.id,
        content: "Completed auth endpoints. Moving on to task endpoints.",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("💬 Created comments");

  // Create activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: sarah.id,
        action: "completed",
        targetType: "task",
        targetId: task7.id,
        targetTitle: "User interview sessions",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        userId: marcus.id,
        action: "updated",
        targetType: "task",
        targetId: task4.id,
        targetTitle: "Write API documentation",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        userId: admin.id,
        action: "created",
        targetType: "task",
        targetId: task3.id,
        targetTitle: "Set up CI/CD pipeline",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        userId: priya.id,
        action: "started",
        targetType: "task",
        targetId: task5.id,
        targetTitle: "Mobile responsive fixes",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        userId: admin.id,
        action: "commented on",
        targetType: "task",
        targetId: task1.id,
        targetTitle: "Design new onboarding flow",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("📊 Created activity logs");

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: "Task overdue",
        message: "Implement authentication module is past its due date.",
        type: "error",
        read: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        userId: admin.id,
        title: "New comment",
        message: "Sarah Chen commented on Design new onboarding flow.",
        type: "info",
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        userId: admin.id,
        title: "Task completed",
        message: "Database schema migration was marked as done.",
        type: "success",
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("🔔 Created notifications");

  // ── Graph data is now computed on-the-fly from real task/activity data ──
  // The first request to /api/graph/daily?date=YYYY-MM-DD auto-calculates
  // and caches the result in graph_data for subsequent reads.
  console.log("📈 Graph data: calculated on-demand from real activity");

  // Create workspace settings
  await prisma.workspaceSetting.create({
    data: {
      name: "TaskFlow Workspace",
      defaultPriority: "medium",
      tags: ["Design", "Backend", "Frontend", "DevOps", "Research", "Bug", "Feature"],
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      businessHoursStart: "09:00",
      businessHoursEnd: "18:00",
    },
  });

  console.log("⚙️  Created workspace settings");
  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
