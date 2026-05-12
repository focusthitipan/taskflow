"use client";

import { useState } from "react";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { differenceInDays, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: "bg-red-100 text-red-500",
  high: "bg-orange-100 text-orange-500",
  medium: "bg-brand-100 text-brand-500",
  low: "bg-green-100 text-green-500",
};

interface ListViewProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

export function ListView({ tasks, onTasksChange }: ListViewProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (taskId: string, newStatus: TaskStatus) => {
    setUpdating(taskId);
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    onTasksChange(updated);

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success("Status updated");
    } catch {
      onTasksChange(tasks);
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="bg-white dark:bg-navy-800 rounded-[20px] card-shadow overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-secondaryGray-100 dark:border-white/10">
            <th className="text-left px-5 py-4 text-[10px] font-normal text-secondaryGray-600 uppercase tracking-wider">
              Task
            </th>
            <th className="text-left px-4 py-4 text-[10px] font-normal text-secondaryGray-600 uppercase tracking-wider hidden md:table-cell">
              Project
            </th>
            <th className="text-left px-4 py-4 text-[10px] font-normal text-secondaryGray-600 uppercase tracking-wider hidden lg:table-cell">
              Priority
            </th>
            <th className="text-left px-4 py-4 text-[10px] font-normal text-secondaryGray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="text-left px-4 py-4 text-[10px] font-normal text-secondaryGray-600 uppercase tracking-wider hidden md:table-cell">
              Due Date
            </th>
            <th className="text-left px-4 py-4 text-[10px] font-normal text-secondaryGray-600 uppercase tracking-wider hidden lg:table-cell">
              Progress
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const daysLeft = task.dueDate
              ? differenceInDays(parseISO(task.dueDate), new Date())
              : null;
            const isOverdue = daysLeft !== null && daysLeft < 0;

            return (
              <tr
                key={task.id}
                className="border-b border-secondaryGray-100 dark:border-white/10 last:border-0 hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150"
              >
                <td className="px-5 py-4">
                  <p className="text-sm font-bold text-secondaryGray-900 dark:text-white">
                    {task.title}
                  </p>
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {task.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-[5px] bg-brand-100 dark:bg-brand-900/40 text-brand-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <span className="text-sm text-secondaryGray-600 font-normal">
                    {task.project || "—"}
                  </span>
                </td>
                <td className="px-4 py-4 hidden lg:table-cell">
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-1 rounded-[10px]",
                      PRIORITY_COLORS[task.priority]
                    )}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <select
                    value={task.status}
                    disabled={updating === task.id}
                    onChange={(e) => updateStatus(task.id, e.target.value as TaskStatus)}
                    className="text-xs font-medium rounded-[10px] px-2 py-1 bg-secondaryGray-300 dark:bg-navy-700 text-secondaryGray-900 dark:text-white border-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  {task.dueDate ? (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isOverdue ? "text-red-500" : "text-secondaryGray-600"
                      )}
                    >
                      {isOverdue ? `${Math.abs(daysLeft!)}d overdue` : `${daysLeft}d left`}
                    </span>
                  ) : (
                    <span className="text-xs text-secondaryGray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-4 hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-[54px] h-2 rounded-[20px] bg-blue-50 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-[20px] bg-brand-500"
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-secondaryGray-900 dark:text-white">
                      {task.progress || 0}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {tasks.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-secondaryGray-600 font-normal">No tasks found</p>
        </div>
      )}
    </div>
  );
}
