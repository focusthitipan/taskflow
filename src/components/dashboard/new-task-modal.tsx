"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { useT } from "@/components/layout/i18n-provider";
import { useWorkspace } from "@/components/layout/workspace-context";
import type { Task, User } from "@/types";
import { toast } from "sonner";

interface NewTaskModalProps {
  readonly onClose: () => void;
  readonly onCreated: (task: Task) => void;
}

export function NewTaskModal({ onClose, onCreated }: NewTaskModalProps) {
  const { t } = useT();
  const { data: session } = useSession();
  const { defaultPriority } = useWorkspace();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const schema = z.object({
    title: z
      .string()
      .min(1, t.dashboard.taskTitleRequired)
      .max(100, t.dashboard.taskTitleTooLong),
    description: z
      .string()
      .max(500, t.dashboard.descriptionTooLong)
      .optional(),
    priority: z.enum(["urgent", "high", "medium", "low"]),
    status: z.enum(["todo", "in_progress", "done"]),
    project: z.string().optional(),
    dueDate: z
      .string()
      .optional()
      .refine(
        (v) => !v || new Date(v) >= new Date(new Date().toDateString()),
        t.dashboard.dueDatePast
      ),
  });

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: defaultPriority, status: "todo" },
  });

  const titleValue = watch("title") ?? "";
  const descriptionValue = watch("description") ?? "";

  useEffect(() => {
    fetch("/api/team/members")
      .then((r) => r.json())
      .then((d) => {
        if (d.members) setAvailableUsers(d.members);
      })
      .catch(console.error);
  }, []);

  const currentUserId = (session?.user as { id?: string })?.id || "";

  const toggleAssignee = (id: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const assignees = availableUsers.filter((u) => selectedAssignees.includes(u.id));
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
          assignees,
          createdBy: currentUserId,
        }),
      });
      const result = await res.json();
      onCreated(result.task);
      toast.success(t.dashboard.taskCreated);
      onClose();
    } catch {
      toast.error(t.dashboard.failedCreateTask);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default border-0 p-0"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-navy-800 rounded-[30px] w-full max-w-xl card-shadow overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondaryGray-100 dark:border-white/10">
          <h2 className="text-xl font-bold text-secondaryGray-900 dark:text-white">
            {t.dashboard.createNewTask}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-secondaryGray-600 hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
              {t.dashboard.taskTitle} *
            </label>
            <input
              {...register("title")}
              placeholder={t.dashboard.enterTaskTitle}
              className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600 placeholder:font-normal"
            />
            <div className="flex items-center justify-between mt-1 ms-[10px]">
              {errors.title ? (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              ) : <span />}
              <p className={`text-xs ${titleValue.length > 100 ? "text-red-500" : "text-secondaryGray-600"}`}>
                {titleValue.length}/100
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
              {t.dashboard.description}
            </label>
            <textarea
              {...register("description")}
              placeholder={t.dashboard.describeTask}
              rows={3}
              className="w-full rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white p-4 placeholder:text-secondaryGray-600 placeholder:font-normal resize-none"
            />
            <div className="flex items-center justify-between mt-1 ms-[10px]">
              {errors.description ? (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              ) : <span />}
              <p className={`text-xs ${descriptionValue.length > 500 ? "text-red-500" : "text-secondaryGray-600"}`}>
                {descriptionValue.length}/500
              </p>
            </div>
          </div>

          {/* Row: Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                {t.dashboard.priority}
              </label>
              <select
                {...register("priority")}
                className="w-full h-[44px] px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
              >
                <option value="urgent">{t.dashboard.urgent}</option>
                <option value="high">{t.dashboard.high}</option>
                <option value="medium">{t.dashboard.medium}</option>
                <option value="low">{t.dashboard.low}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                {t.dashboard.status}
              </label>
              <select
                {...register("status")}
                className="w-full h-[44px] px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
              >
                <option value="todo">{t.dashboard.toDo}</option>
                <option value="in_progress">{t.dashboard.inProgress}</option>
                <option value="done">{t.dashboard.done}</option>
              </select>
            </div>
          </div>

          {/* Row: Project + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                {t.dashboard.project}
              </label>
              <input
                {...register("project")}
                placeholder={t.dashboard.projectName}
                className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600 placeholder:font-normal"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                {t.dashboard.dueDate}
              </label>
              <input
                {...register("dueDate")}
                type="date"
                className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
              />
              {errors.dueDate && (
                <p className="text-xs text-red-500 mt-1 ms-[10px]">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
              {t.dashboard.assignees}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableUsers.filter((u) => u.status === "active").map((user) => {
                const selected = selectedAssignees.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleAssignee(user.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-150 ${
                      selected
                        ? "bg-brand-500 text-white"
                        : "bg-secondaryGray-300 dark:bg-navy-700 text-secondaryGray-900 dark:text-white"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={`${user.firstName}`} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white text-[9px] font-bold"
                          style={{ backgroundColor: user.avatarColor || "#EE5D50" }}
                        >
                          {user.firstName[0]}
                        </div>
                      )}
                    </div>
                    {user.firstName} {user.lastName}
                  </button>
                );
              })}
              {availableUsers.length === 0 && (
                <span className="text-xs text-secondaryGray-600 font-normal">{t.dashboard.loadingMembers}</span>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[44px] rounded-full border border-secondaryGray-100 dark:border-white/10 text-sm font-bold text-secondaryGray-900 dark:text-white hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-[44px] rounded-full text-sm font-bold text-white gradient-brand transition-all duration-250 ease disabled:opacity-60"
            >
              {saving ? t.dashboard.creating : t.dashboard.createTask}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
