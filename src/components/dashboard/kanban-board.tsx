"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, TaskStatus, UserRole } from "@/types";
import { TaskCard } from "./task-card";
import { TaskDetailModal } from "./task-detail-modal";
import { useT } from "@/components/layout/i18n-provider";
import { canEditTask } from "@/lib/can-edit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function SortableTaskCard({ task, onClick }: Readonly<{ task: Task; onClick: () => void }>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  return (
    <div
      ref={setNodeRef}
      // Use Translate (not Transform) to avoid unwanted scale from dnd-kit
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(isDragging && "opacity-30")}
    >
      <TaskCard task={task} onClick={onClick} />
    </div>
  );
}

function DroppableColumn({
  column,
  tasks,
  onTaskClick,
  isOver,
  dropText,
  currentUserRole,
  currentUserId,
}: Readonly<{
  column: { id: TaskStatus; label: string; dotColor: string };
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  isOver: boolean;
  dropText: string;
  currentUserRole?: UserRole;
  currentUserId?: string;
}>) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div
      className={cn(
        "flex flex-col rounded-[20px] p-4 transition-all duration-150",
        isOver
          ? "bg-brand-100/60 dark:bg-brand-900/20"
          : "bg-secondaryGray-300/50 dark:bg-navy-900/40"
      )}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 mb-4">
        <div className={cn("w-2.5 h-2.5 rounded-full", column.dotColor)} />
        <span className="text-sm font-bold text-secondaryGray-900 dark:text-white">
          {column.label}
        </span>
        <span className="ml-auto text-xs font-bold text-secondaryGray-600 w-6 h-6 rounded-full bg-secondaryGray-300 dark:bg-navy-700 flex items-center justify-center">
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div ref={setNodeRef} className="flex-1 min-h-[120px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) =>
              canEditTask(currentUserRole, currentUserId, task) ? (
                <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
              ) : (
                <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
              )
            )}
          </div>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-24 rounded-[20px] border-2 border-dashed border-secondaryGray-200 dark:border-white/10 mt-2">
            <p className="text-xs text-secondaryGray-600 font-normal">{dropText}</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  readonly tasks: Task[];
  readonly onTasksChange: (tasks: Task[]) => void;
  readonly currentUserRole?: UserRole;
  readonly currentUserId?: string;
}

export function KanbanBoard({ tasks, onTasksChange, currentUserRole, currentUserId }: KanbanBoardProps) {
  const { t } = useT();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);

  const COLUMNS: { id: TaskStatus; label: string; dotColor: string }[] = [
    { id: "todo", label: t.dashboard.toDo, dotColor: "bg-secondaryGray-600" },
    { id: "in_progress", label: t.dashboard.inProgress, dotColor: "bg-orange-500" },
    { id: "done", label: t.dashboard.done, dotColor: "bg-green-500" },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const tasksByColumn = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (!task || !canEditTask(currentUserRole, currentUserId, task)) {
      setActiveTask(null);
      return;
    }
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverColumn(null);
      return;
    }
    const colId = COLUMNS.find((c) => c.id === over.id)?.id;
    const taskColId = tasks.find((t) => t.id === over.id)?.status;
    setOverColumn(colId || taskColId || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverColumn(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !canEditTask(currentUserRole, currentUserId, task)) return;

    const targetColId = COLUMNS.find((c) => c.id === over.id)?.id;
    const overTaskColId = tasks.find((t) => t.id === over.id)?.status;
    const newStatus = targetColId || overTaskColId;

    if (!newStatus || task.status === newStatus) return;

    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    );
    onTasksChange(updated);

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`${t.dashboard.movedTo} ${COLUMNS.find((c) => c.id === newStatus)?.label}`);
    } catch {
      onTasksChange(tasks);
      toast.error(t.dashboard.failedUpdateStatus);
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    onTasksChange(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTask(updatedTask);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Grid layout — no overflow-x-auto/snap to avoid pointer offset bugs during drag */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {COLUMNS.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn(column.id)}
              onTaskClick={setSelectedTask}
              isOver={overColumn === column.id}
              dropText={t.dashboard.dropTasksHere}
              currentUserRole={currentUserRole}
              currentUserId={currentUserId}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask && (
            <div className="opacity-90 rotate-2 scale-105">
              <TaskCard task={activeTask} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          onDelete={() => {
            onTasksChange(tasks.filter((t) => t.id !== selectedTask.id));
            setSelectedTask(null);
          }}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}
