import type { UserRole } from "@/types";

/**
 * Check if the current user can edit a given task.
 *
 * Rules:
 * - Admin: always can edit
 * - Member: can edit only if assigned to the task
 * - Viewer: never can edit
 */
export function canEditTask(
  userRole: UserRole | undefined,
  userId: string | undefined,
  task: { assignees?: Array<{ id: string }> }
): boolean {
  if (!userRole || !userId) return false;
  if (userRole === "admin") return true;
  if (userRole === "member") {
    return task.assignees?.some((a) => a.id === userId) ?? false;
  }
  return false;
}

/**
 * Check if the current user can create new tasks.
 *
 * Rules:
 * - Admin/Member: can create
 * - Viewer: cannot create
 */
export function canCreateTask(userRole: UserRole | undefined): boolean {
  return userRole === "admin" || userRole === "member";
}
