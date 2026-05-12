export type UserRole = "admin" | "member" | "viewer";
export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  avatarColor?: string;
  timezone?: string;
  language?: string;
  createdAt: string;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project?: string;
  tags?: string[];
  dueDate?: string;
  progress?: number;
  assignees?: User[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  user?: User;
  content: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  user?: User;
  action: string;
  targetType: "task" | "user" | "workspace";
  targetId?: string;
  targetTitle?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface GraphDataPoint {
  hour: string;
  productivity: number;
  energy: number;
  focus: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export interface WorkspaceSettings {
  id: string;
  name: string;
  logoUrl?: string;
  defaultPriority: TaskPriority;
  tags: string[];
  workingDays: string[];
  businessHoursStart: string;
  businessHoursEnd: string;
}

export interface TeamMember extends User {
  taskCount: number;
  completedTaskCount: number;
  workloadPercent: number;
}

export interface TaskFilters {
  search: string;
  priority: TaskPriority | "all";
  status: TaskStatus | "all";
}
