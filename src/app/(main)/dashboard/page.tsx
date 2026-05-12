"use client";

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Clock, Briefcase } from "lucide-react";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { NewTaskModal } from "@/components/dashboard/new-task-modal";
import { TaskDetailModal } from "@/components/dashboard/task-detail-modal";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useT } from "@/components/layout/i18n-provider";
import { useWorkspace } from "@/components/layout/workspace-context";
import { isWithinBusinessHours, isWorkingDay } from "@/lib/utils";
import { canCreateTask } from "@/lib/can-edit";
import type { Task, TaskFilters, UserRole } from "@/types";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function DashboardPage() {
  const { t } = useT();
  const { data: session } = useSession();
  const { workingDays, businessHoursStart, businessHoursEnd } = useWorkspace();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const currentUserRole = (session?.user as { role?: UserRole })?.role;
  const currentUserId = (session?.user as { id?: string })?.id;
  const [counts, setCounts] = useState({ todo: 0, in_progress: 0, done: 0 });
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 6, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState<TaskFilters>({
    search: "",
    priority: "all",
    status: "all",
  });
  const [showNewTask, setShowNewTask] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.priority !== "all") params.set("priority", filters.priority);
      if (filters.status !== "all") params.set("status", filters.status);
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));

      const res = await fetch(`/api/tasks?${params}`);
      const data = await res.json();
      setTasks(data.tasks ?? []);
      setCounts(data.counts || { todo: 0, in_progress: 0, done: 0 });
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle ?task= param from search navigation
  useEffect(() => {
    const taskId = searchParams.get("task");
    if (taskId) {
      fetch(`/api/tasks/${taskId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.task) setSelectedTask(d.task);
        })
        .catch(console.error);
    }
  }, [searchParams]);

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: TaskFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "n" && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setShowNewTask(true);
      }
      if (e.key === "Escape") {
        setShowNewTask(false);
      }
    };
    globalThis.addEventListener("keydown", handler);
    return () => globalThis.removeEventListener("keydown", handler);
  }, []);

  const handleTaskCreated = () => {
    fetchTasks();
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <div>
      {/* Stats row */}
      <div className="stagger stagger-1 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: t.dashboard.toDo, count: counts.todo, color: "text-secondaryGray-600" },
          { label: t.dashboard.inProgress, count: counts.in_progress, color: "text-orange-500" },
          { label: t.dashboard.completed, count: counts.done, color: "text-green-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-navy-800 rounded-[20px] p-5 card-shadow"
          >
            <p className="text-sm text-secondaryGray-600 font-normal">{stat.label}</p>
            <p className={`text-[24px] sm:text-[34px] font-bold leading-none mt-1 ${stat.color}`}>
              {stat.count}
            </p>
          </div>
        ))}
        {/* Business Hours Status */}
        <div className="bg-white dark:bg-navy-800 rounded-[20px] p-5 card-shadow">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-secondaryGray-600" />
            <p className="text-sm text-secondaryGray-600 font-normal">{businessHoursStart} – {businessHoursEnd}</p>
          </div>
          {isWorkingDay(workingDays) ? (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isWithinBusinessHours(businessHoursStart, businessHoursEnd) ? "bg-green-500" : "bg-orange-500"}`} />
              <p className={`text-[24px] sm:text-[34px] font-bold leading-none ${isWithinBusinessHours(businessHoursStart, businessHoursEnd) ? "text-green-500" : "text-orange-500"}`}>
                {isWithinBusinessHours(businessHoursStart, businessHoursEnd) ? t.dashboard.inProgress : t.dashboard.done}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondaryGray-600" />
              <p className="text-[24px] sm:text-[34px] font-bold leading-none text-secondaryGray-600">
                <Briefcase className="w-6 h-6 inline" />
              </p>
            </div>
          )}
          <p className="text-xs text-secondaryGray-600 font-normal mt-0.5">
            {(() => {
              if (!isWorkingDay(workingDays)) return "○ Day Off";
              return isWithinBusinessHours(businessHoursStart, businessHoursEnd) ? "● On Duty" : "○ Off Hours";
            })()}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="stagger stagger-2 flex flex-wrap items-center justify-between gap-3 mb-2">
        <FilterBar filters={filters} onFiltersChange={handleFiltersChange} />
        {canCreateTask(currentUserRole) && (
        <button
          onClick={() => setShowNewTask(true)}
          className="flex items-center gap-2 h-[44px] px-5 rounded-full text-sm font-bold text-white gradient-brand flex-shrink-0 transition-all duration-250 ease"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden 2sm:inline">{t.dashboard.newTask}</span>
          <span className="hidden md:block text-xs opacity-70 font-normal">(N)</span>
        </button>
        )}
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="stagger stagger-3 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[20px] bg-secondaryGray-300/50 dark:bg-navy-900/50 p-4 space-y-3">
              {[1, 2].map((j) => (
                <div key={j} className="bg-white dark:bg-navy-800 rounded-[20px] p-5 h-32 animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <KanbanBoard tasks={tasks} onTasksChange={setTasks} currentUserRole={currentUserRole} currentUserId={currentUserId} />
      )}
      {/* Pagination */}
      <PaginationControls
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={handlePageChange}
      />

      {showNewTask && (
        <NewTaskModal
          onClose={() => setShowNewTask(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            globalThis.history.replaceState({}, "", "/dashboard");
          }}
          onUpdate={(updated) => {
            setSelectedTask(updated);
            fetchTasks();
          }}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
