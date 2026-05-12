"use client";

import { Calendar, MessageSquare } from "lucide-react";
import { parseISO } from "date-fns";
import type { Task } from "@/types";
import { useT } from "@/components/layout/i18n-provider";
import { useWorkspace } from "@/components/layout/workspace-context";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn, remainingWorkDays } from "@/lib/utils";

interface TaskCardProps {
  readonly task: Task;
  readonly onClick: () => void;
  readonly isDragging?: boolean;
}

function DueDateBadge({ dueDate }: { readonly dueDate: string }) {
  const { t } = useT();
  const { workingDays } = useWorkspace();
  const days = remainingWorkDays(parseISO(dueDate), workingDays);
  const isOverdue = days < 0;
  const isUrgent = days >= 0 && days <= 2;

  let badgeClass: string;
  if (isOverdue) {
    badgeClass = "bg-red-100 text-red-500 dark:bg-red-500/20";
  } else if (isUrgent) {
    badgeClass = "bg-orange-100 text-orange-500 dark:bg-orange-500/20";
  } else {
    badgeClass = "bg-green-100 text-green-500 dark:bg-green-500/20";
  }

  let badgeLabel: string;
  if (isOverdue) {
    badgeLabel = `${Math.abs(days)}${t.dashboard.workDaysOverdue}`;
  } else if (days === 0) {
    badgeLabel = t.common.today;
  } else {
    badgeLabel = `${days}${t.dashboard.workDaysLeft}`;
  }

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-[10px]",
        badgeClass
      )}
    >
      <Calendar className="w-3 h-3" />
      {badgeLabel}
    </span>
  );
}

export function TaskCard({ task, onClick, isDragging }: TaskCardProps) {
  const { t } = useT();

  const PRIORITY_CONFIG = {
    urgent: { label: t.dashboard.urgent, bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-500" },
    high: { label: t.dashboard.high, bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-500" },
    medium: { label: t.dashboard.medium, bg: "bg-brand-100 dark:bg-brand-900/40", text: "text-brand-500" },
    low: { label: t.dashboard.low, bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-500" },
  };

  const priority = PRIORITY_CONFIG[task.priority];
  const maxAvatars = 3;
  const assignees = task.assignees || [];
  const visibleAssignees = assignees.slice(0, maxAvatars);
  const extraCount = assignees.length - maxAvatars;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left bg-white dark:bg-navy-800 rounded-[20px] p-5 card-shadow cursor-pointer",
        "hover:shadow-[14px_17px_50px_4px_rgba(112,144,176,0.15)] transition-all duration-250 ease",
        isDragging && "opacity-50 rotate-2"
      )}
    >
      {/* Header: project + priority */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs text-secondaryGray-600 font-normal truncate">
          {task.project || t.dashboard.noProject}
        </span>
        <span
          className={cn(
            "text-xs font-bold px-2 py-1 rounded-[10px] flex-shrink-0",
            priority.bg,
            priority.text
          )}
        >
          {priority.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-secondaryGray-900 dark:text-white leading-[150%] mb-2">
        {task.title}
      </h3>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2 py-0.5 rounded-[10px] bg-brand-100 dark:bg-brand-900/40 text-brand-500 dark:text-brand-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {task.progress !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-secondaryGray-600 font-normal">{t.dashboard.progress}</span>
            <span className="text-xs font-bold text-secondaryGray-900 dark:text-white">
              {task.progress}%
            </span>
          </div>
          <div className="h-2 rounded-[20px] bg-blue-50 dark:bg-white/10">
            <div
              className="h-full rounded-[20px] bg-brand-500 transition-all duration-250"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        {/* Assignee avatars */}
        <div className="flex items-center">
          {visibleAssignees.map((user, i) => (
            <Avatar
              key={user.id}
              className="w-7 h-7 rounded-full border-2 border-white dark:border-navy-800 -ml-1 first:ml-0"
              title={`${user.firstName} ${user.lastName}`}
            >
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />}
              <AvatarFallback
                className="text-white text-xs font-bold"
                style={{ backgroundColor: user.avatarColor || "#EE5D50" }}
              >
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
          ))}
          {extraCount > 0 && (
            <div className="w-7 h-7 rounded-full border-2 border-white dark:border-navy-800 bg-secondaryGray-600 flex items-center justify-center text-white text-xs font-bold -ml-1">
              +{extraCount}
            </div>
          )}
          {assignees.length === 0 && (
            <span className="text-xs text-secondaryGray-600 font-normal">{t.dashboard.unassigned}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Comments count */}
          {task.comments && task.comments.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-secondaryGray-600 font-normal">
              <MessageSquare className="w-3 h-3" />
              {task.comments.length}
            </span>
          )}
          {/* Due date */}
          {task.dueDate && <DueDateBadge dueDate={task.dueDate} />}
        </div>
      </div>
    </button>
  );
}
