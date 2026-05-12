"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { useT } from "@/components/layout/i18n-provider";
import { TaskDetailModal } from "@/components/dashboard/task-detail-modal";
import type { Task, UserRole } from "@/types";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-brand-500",
  low: "bg-green-500",
};

function TaskChip({ task, onSelect }: Readonly<{ task: Task; onSelect: (t: Task) => void }>) {
  return (
    <button
      key={task.id}
      onClick={() => onSelect(task)}
      className="flex items-center gap-1 px-1.5 py-0.5 rounded-[5px] bg-secondaryGray-300 dark:bg-navy-700 hover:bg-secondaryGray-400 dark:hover:bg-navy-600 transition-colors duration-150 w-full text-left cursor-pointer"
    >
      <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", PRIORITY_COLORS[task.priority])} />
      <span className="text-[9px] font-medium text-secondaryGray-900 dark:text-white truncate">
        {task.title}
      </span>
    </button>
  );
}

interface CalendarViewProps {
  readonly tasks: Task[];
  readonly onTasksChange: (tasks: Task[]) => void;
  readonly currentUserRole?: UserRole;
  readonly currentUserId?: string;
}

export function CalendarView({ tasks, onTasksChange, currentUserRole, currentUserId }: CalendarViewProps) {
  const { t } = useT();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskUpdate = (updatedTask: Task) => {
    onTasksChange(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const getTasksForDay = (day: Date) => {
    return tasks.filter(
      (t) => t.dueDate && isSameDay(new Date(t.dueDate), day)
    );
  };

  const rows: Date[][] = [];
  let row: Date[] = [];
  let day = startDate;

  while (day <= endDate) {
    row.push(day);
    if (row.length === 7) {
      rows.push(row);
      row = [];
    }
    day = addDays(day, 1);
  }

  const DAY_HEADERS = [t.myTasks.sun, t.myTasks.mon, t.myTasks.tue, t.myTasks.wed, t.myTasks.thu, t.myTasks.fri, t.myTasks.sat];

  return (
    <div className="bg-white dark:bg-navy-800 rounded-[20px] card-shadow overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-secondaryGray-100 dark:border-white/10">
        <h3 className="text-lg font-bold text-secondaryGray-900 dark:text-white">
          {format(currentDate, "MMMM yyyy")}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150"
          >
            <ChevronLeft className="w-4 h-4 text-secondaryGray-700 dark:text-white" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 h-8 rounded-full text-xs font-medium text-brand-500 hover:bg-brand-100 dark:hover:bg-brand-900/20 transition-colors duration-150"
          >
            {t.common.today}
          </button>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150"
          >
            <ChevronRight className="w-4 h-4 text-secondaryGray-700 dark:text-white" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-secondaryGray-100 dark:border-white/10">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="py-3 text-center text-[10px] font-normal text-secondaryGray-600 uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      {rows.map((row) => (
        <div
          key={format(row[0], "yyyy-MM-dd")}
          className="grid grid-cols-7 border-b border-secondaryGray-100 dark:border-white/10 last:border-0"
        >
          {row.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={format(day, "yyyy-MM-dd")}
                className={cn(
                  "min-h-[100px] p-2 border-r border-secondaryGray-100 dark:border-white/10 last:border-0",
                  !isCurrentMonth && "opacity-40"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-[10px] flex items-center justify-center text-sm font-bold mb-1",
                    isToday
                      ? "bg-brand-500 text-white"
                      : "text-secondaryGray-900 dark:text-white"
                  )}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <TaskChip key={task.id} task={task} onSelect={setSelectedTask} />
                  ))}
                  {dayTasks.length > 3 && (
                    <p className="text-[9px] text-secondaryGray-600 font-normal pl-1">
                      +{dayTasks.length - 3} {t.myTasks.more}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
