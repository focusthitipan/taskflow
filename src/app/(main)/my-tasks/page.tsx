"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LayoutGrid, List, CalendarDays } from "lucide-react";
import { SummaryWidgets } from "@/components/my-tasks/summary-widgets";
import { ListView } from "@/components/my-tasks/list-view";
import { CalendarView } from "@/components/my-tasks/calendar-view";
import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { useT } from "@/components/layout/i18n-provider";
import type { Task, UserRole } from "@/types";
import { cn } from "@/lib/utils";

type ViewMode = "kanban" | "list" | "calendar";

export default function MyTasksPage() {
  const { t } = useT();
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<ViewMode>("kanban");
  const [loading, setLoading] = useState(true);

  const userId = (session?.user as { id?: string })?.id;
  const userRole = (session?.user as { role?: UserRole })?.role;

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/tasks?assignee=${userId}`)
      .then((r) => r.json())
      .then((d) => setTasks(d.tasks))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const views: { id: ViewMode; label: string; icon: React.ElementType }[] = [
    { id: "kanban", label: t.myTasks.kanban, icon: LayoutGrid },
    { id: "list", label: t.myTasks.list, icon: List },
    { id: "calendar", label: t.myTasks.calendar, icon: CalendarDays },
  ];

  return (
    <div>
      <div className="stagger stagger-1">
        <SummaryWidgets tasks={tasks} />
      </div>

      {/* View toggle */}
      <div className="stagger stagger-2 flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-navy-800 card-shadow">
          {views.map((v) => {
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-medium transition-all duration-150",
                  view === v.id
                    ? "bg-brand-500 text-white font-bold"
                    : "text-secondaryGray-600 hover:text-secondaryGray-900 dark:hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{v.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="stagger stagger-3 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      )}
      {!loading && view === "kanban" && (
        <KanbanBoard tasks={tasks} onTasksChange={setTasks} currentUserRole={userRole} currentUserId={userId} />
      )}
      {!loading && view === "list" && (
        <ListView tasks={tasks} onTasksChange={setTasks} currentUserRole={userRole} currentUserId={userId} />
      )}
      {!loading && view !== "kanban" && view !== "list" && (
        <CalendarView tasks={tasks} onTasksChange={setTasks} currentUserRole={userRole} currentUserId={userId} />
      )}
    </div>
  );
}
