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
  await prisma.graphData.deleteMany();
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
      avatarColor: "#422AFB",
      timezone: "UTC+7",
      language: "en",
      isOnline: true,
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
      isOnline: true,
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
      isOnline: false,
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
      isOnline: true,
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
      isOnline: false,
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

  // Create graph data for today and yesterday
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const graphRows: Array<{ date: string; hour: string; productivity: number; energy: number; focus: number }> = [];
  
  for (const date of [today, yesterday]) {
    const seed = new Date(date).getDate();
    for (let h = 1; h <= 24; h++) {
      const hour = `${String(h).padStart(2, "0")}:00`;
      const noise = (Math.sin(h * seed * 0.3) + Math.cos(h * 0.7)) * 10;

      const productivity = h < 7
        ? Math.max(0, 10 + noise)
        : h < 12 ? Math.min(100, 60 + (h - 7) * 10 + noise)
        : h < 14 ? Math.max(30, 80 - noise)
        : h < 18 ? Math.min(100, 75 + noise)
        : Math.max(0, 40 - (h - 18) * 8 + noise);

      const energy = h < 8 ? -50 + h * 5 + noise
        : h < 13 ? Math.min(80, (h - 8) * 20 + noise)
        : h < 15 ? 60 - (h - 13) * 30 + noise
        : h < 20 ? -10 + (h - 15) * 5 + noise
        : -40 - (h - 20) * 10 + noise;

      const focus = h < 9 ? Math.max(0, h - 1)
        : h < 12 ? Math.min(10, 4 + (h - 9) * 2 + noise * 0.05)
        : h < 14 ? Math.max(2, 8 - (h - 12) * 2)
        : h < 18 ? Math.min(10, 5 + (h - 14) + noise * 0.05)
        : Math.max(0, 6 - (h - 18) * 1.5);

      graphRows.push({
        date,
        hour,
        productivity: Math.round(Math.min(100, Math.max(0, productivity))),
        energy: Math.round(Math.min(100, Math.max(-100, energy))),
        focus: Math.round(Math.min(10, Math.max(0, focus)) * 10) / 10,
      });
    }
  }

  await prisma.graphData.createMany({ data: graphRows });
  console.log("📈 Created graph data");

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
