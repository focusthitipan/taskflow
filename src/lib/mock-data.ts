import type {
  User,
  Task,
  TeamMember,
  ActivityLog,
  GraphDataPoint,
  Notification,
  WorkspaceSettings,
} from "@/types";

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    firstName: "Alex",
    lastName: "Johnson",
    email: "admin@taskflow.io",
    role: "admin",
    status: "active",
    avatarColor: "#422AFB",
    timezone: "UTC+7",
    language: "en",
    isOnline: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "u2",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah@taskflow.io",
    role: "member",
    status: "active",
    avatarColor: "#01B574",
    timezone: "UTC+8",
    language: "en",
    isOnline: true,
    createdAt: "2024-01-05T00:00:00Z",
  },
  {
    id: "u3",
    firstName: "Marcus",
    lastName: "Rivera",
    email: "marcus@taskflow.io",
    role: "member",
    status: "active",
    avatarColor: "#FFB547",
    timezone: "UTC-5",
    language: "en",
    isOnline: false,
    createdAt: "2024-01-10T00:00:00Z",
  },
  {
    id: "u4",
    firstName: "Priya",
    lastName: "Patel",
    email: "priya@taskflow.io",
    role: "member",
    status: "active",
    avatarColor: "#EE5D50",
    timezone: "UTC+5:30",
    language: "en",
    isOnline: true,
    createdAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "u5",
    firstName: "Tom",
    lastName: "Walsh",
    email: "tom@taskflow.io",
    role: "viewer",
    status: "inactive",
    avatarColor: "#3965FF",
    timezone: "UTC+0",
    language: "en",
    isOnline: false,
    createdAt: "2024-02-15T00:00:00Z",
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    title: "Design new onboarding flow",
    description:
      "Create wireframes and high-fidelity mockups for the revised user onboarding experience.",
    status: "todo",
    priority: "high",
    project: "Product Design",
    tags: ["Design", "UX"],
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 20,
    assignees: [MOCK_USERS[1], MOCK_USERS[3]],
    createdBy: "u1",
    createdAt: "2024-06-01T00:00:00Z",
    updatedAt: "2024-06-10T00:00:00Z",
    comments: [
      {
        id: "c1",
        taskId: "t1",
        userId: "u2",
        user: MOCK_USERS[1],
        content: "Starting on wireframes today. Will share a draft by end of week.",
        createdAt: "2024-06-08T10:00:00Z",
      },
    ],
  },
  {
    id: "t2",
    title: "Implement authentication module",
    description: "Build JWT-based authentication with refresh token support.",
    status: "todo",
    priority: "urgent",
    project: "Backend API",
    tags: ["Backend", "Security"],
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 0,
    assignees: [MOCK_USERS[2]],
    createdBy: "u1",
    createdAt: "2024-06-02T00:00:00Z",
    updatedAt: "2024-06-11T00:00:00Z",
    comments: [],
  },
  {
    id: "t3",
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing and deployment.",
    status: "todo",
    priority: "medium",
    project: "DevOps",
    tags: ["DevOps", "Infrastructure"],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 5,
    assignees: [MOCK_USERS[0]],
    createdBy: "u1",
    createdAt: "2024-06-03T00:00:00Z",
    updatedAt: "2024-06-09T00:00:00Z",
    comments: [],
  },
  {
    id: "t4",
    title: "Write API documentation",
    description: "Document all REST endpoints using OpenAPI 3.0 spec.",
    status: "in_progress",
    priority: "medium",
    project: "Backend API",
    tags: ["Documentation"],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 55,
    assignees: [MOCK_USERS[1], MOCK_USERS[2]],
    createdBy: "u2",
    createdAt: "2024-06-04T00:00:00Z",
    updatedAt: "2024-06-12T00:00:00Z",
    comments: [
      {
        id: "c2",
        taskId: "t4",
        userId: "u3",
        user: MOCK_USERS[2],
        content: "Completed auth endpoints. Moving on to task endpoints.",
        createdAt: "2024-06-11T14:00:00Z",
      },
    ],
  },
  {
    id: "t5",
    title: "Mobile responsive fixes",
    description: "Address layout issues on mobile screens below 768px.",
    status: "in_progress",
    priority: "high",
    project: "Frontend",
    tags: ["Frontend", "Bug"],
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 70,
    assignees: [MOCK_USERS[3]],
    createdBy: "u1",
    createdAt: "2024-06-05T00:00:00Z",
    updatedAt: "2024-06-13T00:00:00Z",
    comments: [],
  },
  {
    id: "t6",
    title: "Performance optimization audit",
    description: "Run Lighthouse audits and optimize Core Web Vitals.",
    status: "in_progress",
    priority: "low",
    project: "Frontend",
    tags: ["Performance"],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 30,
    assignees: [MOCK_USERS[0], MOCK_USERS[1]],
    createdBy: "u2",
    createdAt: "2024-06-06T00:00:00Z",
    updatedAt: "2024-06-10T00:00:00Z",
    comments: [],
  },
  {
    id: "t7",
    title: "User interview sessions",
    description: "Conduct 10 user interviews for the upcoming redesign research.",
    status: "done",
    priority: "high",
    project: "Research",
    tags: ["Research", "UX"],
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    assignees: [MOCK_USERS[1]],
    createdBy: "u1",
    createdAt: "2024-05-20T00:00:00Z",
    updatedAt: "2024-06-07T00:00:00Z",
    comments: [],
  },
  {
    id: "t8",
    title: "Database schema migration",
    description: "Migrate from v1 to v2 schema with zero downtime strategy.",
    status: "done",
    priority: "urgent",
    project: "Backend API",
    tags: ["Backend", "Database"],
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    assignees: [MOCK_USERS[2], MOCK_USERS[0]],
    createdBy: "u1",
    createdAt: "2024-05-25T00:00:00Z",
    updatedAt: "2024-06-09T00:00:00Z",
    comments: [],
  },
  {
    id: "t9",
    title: "Setup monitoring & alerting",
    description: "Configure Datadog dashboards and PagerDuty alert rules.",
    status: "done",
    priority: "medium",
    project: "DevOps",
    tags: ["DevOps", "Monitoring"],
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 100,
    assignees: [MOCK_USERS[0]],
    createdBy: "u1",
    createdAt: "2024-05-28T00:00:00Z",
    updatedAt: "2024-06-11T00:00:00Z",
    comments: [],
  },
];

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { ...MOCK_USERS[0], taskCount: 8, completedTaskCount: 5, workloadPercent: 80 },
  { ...MOCK_USERS[1], taskCount: 12, completedTaskCount: 7, workloadPercent: 95 },
  { ...MOCK_USERS[2], taskCount: 6, completedTaskCount: 4, workloadPercent: 60 },
  { ...MOCK_USERS[3], taskCount: 9, completedTaskCount: 3, workloadPercent: 70 },
  { ...MOCK_USERS[4], taskCount: 2, completedTaskCount: 1, workloadPercent: 20 },
];

export const MOCK_ACTIVITY: ActivityLog[] = [
  {
    id: "a1",
    userId: "u2",
    user: MOCK_USERS[1],
    action: "completed",
    targetType: "task",
    targetId: "t7",
    targetTitle: "User interview sessions",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: "a2",
    userId: "u3",
    user: MOCK_USERS[2],
    action: "updated",
    targetType: "task",
    targetId: "t4",
    targetTitle: "Write API documentation",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a3",
    userId: "u1",
    user: MOCK_USERS[0],
    action: "created",
    targetType: "task",
    targetId: "t3",
    targetTitle: "Set up CI/CD pipeline",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a4",
    userId: "u4",
    user: MOCK_USERS[3],
    action: "started",
    targetType: "task",
    targetId: "t5",
    targetTitle: "Mobile responsive fixes",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "a5",
    userId: "u1",
    user: MOCK_USERS[0],
    action: "commented on",
    targetType: "task",
    targetId: "t1",
    targetTitle: "Design new onboarding flow",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    userId: "u1",
    title: "Task overdue",
    message: "Implement authentication module is past its due date.",
    type: "error",
    read: false,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "n2",
    userId: "u1",
    title: "New comment",
    message: "Sarah Chen commented on Design new onboarding flow.",
    type: "info",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "n3",
    userId: "u1",
    title: "Task completed",
    message: "Database schema migration was marked as done.",
    type: "success",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function generateGraphData(date?: string): GraphDataPoint[] {
  const points: GraphDataPoint[] = [];
  const seed = date ? new Date(date).getDate() : new Date().getDate();

  for (let h = 1; h <= 24; h++) {
    const hour = `${String(h).padStart(2, "0")}:00`;
    const t = h / 24;
    const noise = (Math.sin(h * seed * 0.3) + Math.cos(h * 0.7)) * 10;

    const productivity =
      h < 7
        ? Math.max(0, 10 + noise)
        : h < 12
          ? Math.min(100, 60 + (h - 7) * 10 + noise)
          : h < 14
            ? Math.max(30, 80 - noise)
            : h < 18
              ? Math.min(100, 75 + noise)
              : Math.max(0, 40 - (h - 18) * 8 + noise);

    const energy =
      h < 8
        ? -50 + h * 5 + noise
        : h < 13
          ? Math.min(80, (h - 8) * 20 + noise)
          : h < 15
            ? 60 - (h - 13) * 30 + noise
            : h < 20
              ? -10 + (h - 15) * 5 + noise
              : -40 - (h - 20) * 10 + noise;

    const focus =
      h < 9
        ? Math.max(0, h - 1)
        : h < 12
          ? Math.min(10, 4 + (h - 9) * 2 + noise * 0.05)
          : h < 14
            ? Math.max(2, 8 - (h - 12) * 2)
            : h < 18
              ? Math.min(10, 5 + (h - 14) + noise * 0.05)
              : Math.max(0, 6 - (h - 18) * 1.5);

    points.push({
      hour,
      productivity: Math.round(Math.min(100, Math.max(0, productivity))),
      energy: Math.round(Math.min(100, Math.max(-100, energy))),
      focus: Math.round(Math.min(10, Math.max(0, focus)) * 10) / 10,
    });
  }

  return points;
}

export const MOCK_WORKSPACE: WorkspaceSettings = {
  id: "ws1",
  name: "TaskFlow Workspace",
  defaultPriority: "medium",
  tags: ["Design", "Backend", "Frontend", "DevOps", "Research", "Bug", "Feature"],
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  businessHoursStart: "09:00",
  businessHoursEnd: "18:00",
};
