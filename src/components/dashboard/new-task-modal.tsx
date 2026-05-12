"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import type { Task, User } from "@/types";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["urgent", "high", "medium", "low"]),
  status: z.enum(["todo", "in_progress", "done"]),
  project: z.string().optional(),
  dueDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface NewTaskModalProps {
  onClose: () => void;
  onCreated: (task: Task) => void;
}

export function NewTaskModal({ onClose, onCreated }: NewTaskModalProps) {
  const { data: session } = useSession();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "medium", status: "todo" },
  });

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
      toast.success("Task created successfully");
      onClose();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-navy-800 rounded-[30px] w-full max-w-xl card-shadow overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondaryGray-100 dark:border-white/10">
          <h2 className="text-xl font-bold text-secondaryGray-900 dark:text-white">
            Create New Task
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
              Task Title *
            </label>
            <input
              {...register("title")}
              placeholder="Enter task title..."
              className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600 placeholder:font-normal"
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1 ms-[10px]">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
              Description
            </label>
            <textarea
              {...register("description")}
              placeholder="Describe the task..."
              rows={3}
              className="w-full rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white p-4 placeholder:text-secondaryGray-600 placeholder:font-normal resize-none"
            />
          </div>

          {/* Row: Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                Priority
              </label>
              <select
                {...register("priority")}
                className="w-full h-[44px] px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full h-[44px] px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Row: Project + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                Project
              </label>
              <input
                {...register("project")}
                placeholder="Project name..."
                className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600 placeholder:font-normal"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
                Due Date
              </label>
              <input
                {...register("dueDate")}
                type="date"
                className="w-full h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-bold text-secondaryGray-900 dark:text-white ms-[10px] mb-2">
              Assignees
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
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ backgroundColor: user.avatarColor || "#422AFB" }}
                    >
                      {user.firstName[0]}
                    </div>
                    {user.firstName} {user.lastName}
                  </button>
                );
              })}
              {availableUsers.length === 0 && (
                <span className="text-xs text-secondaryGray-600 font-normal">Loading members...</span>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-[44px] rounded-full text-sm font-bold text-white gradient-brand transition-all duration-250 ease disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
