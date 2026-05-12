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

  await prisma.user.create({
    data: {
      firstName: "Tom",
      lastName: "Walsh",
      email: "tom@taskflow.io",
      password: viewerPw,
      role: "viewer",
      status: "active",
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

  // Create comments — spanning entire May 2026
  const may = (day: number, hour = 9) => new Date(2026, 4, day, hour, 0, 0); // month is 0-indexed

  await prisma.comment.createMany({
    data: [
      // ── Week 1: May 1–3 ──
      { taskId: task1.id, userId: admin.id,
        content: "Let's kick off the onboarding redesign. Sarah, can you lead the wireframes?",
        createdAt: may(1, 10) },
      { taskId: task1.id, userId: sarah.id,
        content: "On it! I'll start with user flow mapping today.",
        createdAt: may(1, 11) },
      { taskId: task2.id, userId: admin.id,
        content: "Marcus, this is urgent — we need auth done before the sprint demo on the 8th.",
        createdAt: may(2, 9) },
      { taskId: task2.id, userId: marcus.id,
        content: "Understood. Starting with the JWT token generation module.",
        createdAt: may(2, 10) },
      { taskId: task3.id, userId: admin.id,
        content: "Setting up the initial GitHub Actions config. Will use staging env first.",
        createdAt: may(3, 14) },

      // ── Week 2: May 4–10 ──
      { taskId: task1.id, userId: sarah.id,
        content: "Wireframes v1 ready for review. Sharing the Figma link in the description.",
        createdAt: may(5, 11) },
      { taskId: task1.id, userId: priya.id,
        content: "Looks great Sarah! I have a few suggestions on the sign-up step — will annotate in Figma.",
        createdAt: may(5, 14) },
      { taskId: task4.id, userId: sarah.id,
        content: "Started documenting the REST endpoints. Marcus, can you help with the auth endpoints section?",
        createdAt: may(6, 9) },
      { taskId: task4.id, userId: marcus.id,
        content: "Sure, I'll write up the auth section this afternoon.",
        createdAt: may(6, 11) },
      { taskId: task5.id, userId: priya.id,
        content: "Found 3 critical layout breaks on iPhone SE. Working on fixes now.",
        createdAt: may(7, 10) },
      { taskId: task5.id, userId: admin.id,
        content: "Good catch Priya. Make sure to test Android Chrome too.",
        createdAt: may(7, 11) },
      { taskId: task2.id, userId: marcus.id,
        content: "JWT generation and refresh token rotation done. Moving on to login/register endpoints.",
        createdAt: may(8, 16) },
      { taskId: task6.id, userId: admin.id,
        content: "Initial Lighthouse scores are in — performance is 62 on mobile. We need to aim for 90+.",
        createdAt: may(9, 10) },
      { taskId: task6.id, userId: sarah.id,
        content: "62 is rough. I suspect the hero images and unoptimized JS bundles are the main culprits.",
        createdAt: may(9, 11) },
      { taskId: task7.id, userId: sarah.id,
        content: "Completed all 10 interviews! Summary doc is attached in the description.",
        createdAt: may(10, 17) },
      { taskId: task7.id, userId: admin.id,
        content: "Excellent work Sarah. Let's schedule a findings review meeting next week.",
        createdAt: may(10, 17) },

      // ── Week 3: May 11–17 ──
      { taskId: task1.id, userId: sarah.id,
        content: "Incorporated Priya's feedback. Updated wireframes v2 uploaded.",
        createdAt: may(12, 9) },
      { taskId: task4.id, userId: marcus.id,
        content: "Auth endpoints doc complete. Moving on to task CRUD endpoints.",
        createdAt: may(12, 15) },
      { taskId: task8.id, userId: admin.id,
        content: "Migration script is ready. We'll run it during off-peak hours tonight.",
        createdAt: may(13, 10) },
      { taskId: task8.id, userId: marcus.id,
        content: "I'll monitor the migration and run validation checks after it completes.",
        createdAt: may(13, 11) },
      { taskId: task5.id, userId: priya.id,
        content: "All mobile breakpoints fixed. Running cross-browser regression tests now.",
        createdAt: may(14, 14) },
      { taskId: task3.id, userId: admin.id,
        content: "Staging pipeline is green! Adding production deployment stage next.",
        createdAt: may(15, 10) },
      { taskId: task6.id, userId: sarah.id,
        content: "Lazy-loaded images and code-split the dashboard bundle. Score jumped to 78.",
        createdAt: may(16, 9) },
      { taskId: task6.id, userId: admin.id,
        content: "Good progress. Let's target 85+ by end of sprint. What about font optimization?",
        createdAt: may(16, 10) },
      { taskId: task2.id, userId: marcus.id,
        content: "Login, register, and password reset endpoints all working. Writing tests now.",
        createdAt: may(17, 16) },

      // ── Week 4: May 18–24 ──
      { taskId: task8.id, userId: marcus.id,
        content: "Migration completed successfully. Zero downtime achieved. All data validated.",
        createdAt: may(18, 8) },
      { taskId: task8.id, userId: admin.id,
        content: "Fantastic work Marcus. Marking this as done.",
        createdAt: may(18, 9) },
      { taskId: task7.id, userId: sarah.id,
        content: "Research findings presentation is ready. Key insight: users want a guided tutorial on first login.",
        createdAt: may(19, 11) },
      { taskId: task1.id, userId: priya.id,
        content: "High-fidelity mockups looking good. Should we add an interactive prototype?",
        createdAt: may(20, 14) },
      { taskId: task1.id, userId: sarah.id,
        content: "Yes! I'll build a clickable prototype in Figma by Friday.",
        createdAt: may(20, 15) },
      { taskId: task4.id, userId: sarah.id,
        content: "API docs are about 55% done. On track for the deadline.",
        createdAt: may(21, 10) },
      { taskId: task5.id, userId: priya.id,
        content: "Regression tests passed on all major browsers and devices. Almost there!",
        createdAt: may(22, 16) },
      { taskId: task9.id, userId: admin.id,
        content: "Datadog dashboards configured. PagerDuty alerts are live for CPU > 80% and error rate > 5%.",
        createdAt: may(23, 10) },
      { taskId: task9.id, userId: admin.id,
        content: "All monitors green. Marking monitoring setup as done.",
        createdAt: may(23, 17) },
      { taskId: task3.id, userId: admin.id,
        content: "Production deployment pipeline is live. Auto-deploys on merge to main.",
        createdAt: may(24, 11) },

      // ── Week 5: May 25–31 ──
      { taskId: task6.id, userId: sarah.id,
        content: "Switched to next/font and preloaded critical CSS. Lighthouse score now at 84!",
        createdAt: may(26, 10) },
      { taskId: task6.id, userId: admin.id,
        content: "Great improvement! Let's squeeze a bit more — can we defer non-critical JS?",
        createdAt: may(26, 11) },
      { taskId: task2.id, userId: marcus.id,
        content: "All auth tests passing. Ready for code review.",
        createdAt: may(27, 14) },
      { taskId: task4.id, userId: marcus.id,
        content: "Finished documenting all task endpoints. Sarah, how's the overview section going?",
        createdAt: may(28, 9) },
      { taskId: task4.id, userId: sarah.id,
        content: "Overview and error handling sections are in progress. Should be done by tomorrow.",
        createdAt: may(28, 10) },
      { taskId: task1.id, userId: sarah.id,
        content: "Clickable prototype is ready! Sharing link with the team for feedback.",
        createdAt: may(29, 16) },
      { taskId: task1.id, userId: admin.id,
        content: "Prototype looks amazing. Let's plan a user test session next week.",
        createdAt: may(29, 17) },
      { taskId: task5.id, userId: priya.id,
        content: "One more edge case found on iPad landscape mode. Fixing now.",
        createdAt: may(30, 10) },
      { taskId: task3.id, userId: admin.id,
        content: "Pipeline ran 12 deploys this month with zero failures. Very stable.",
        createdAt: may(31, 9) },
      { taskId: task6.id, userId: sarah.id,
        content: "Deferred analytics and chat widgets. Final Lighthouse score: 91! 🎉",
        createdAt: may(31, 15) },
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

void (async () => {
  try {
    await main();
  } catch (e) {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
