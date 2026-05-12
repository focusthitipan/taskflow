"use client";

import { useState } from "react";
import { X, Edit2, Save, Calendar, Tag, User, AlertCircle, MessageSquare } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { Task, TaskPriority, TaskStatus } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: "bg-red-100 text-red-500",
  high: "bg-orange-100 text-orange-500",
  medium: "bg-brand-100 text-brand-500",
  low: "bg-green-100 text-green-500",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export function TaskDetailModal({ task, onClose, onUpdate }: TaskDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...task });
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      onUpdate(data.task);
      setEditing(false);
      toast.success("Task updated successfully");
    } catch {
      toast.error("Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      const data = await res.json();
      if (data.comment) {
        setForm((f) => ({ ...f, comments: [...(f.comments || []), data.comment] }));
        setNewComment("");
        toast.success("Comment added");
      }
    } catch {
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-navy-800 rounded-[30px] w-full max-w-2xl max-h-[90vh] overflow-y-auto card-shadow custom-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-secondaryGray-100 dark:border-white/10">
          <div className="flex-1 min-w-0 pr-4">
            {editing ? (
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full text-xl font-bold text-secondaryGray-900 dark:text-white bg-transparent border-b border-brand-500 pb-1"
              />
            ) : (
              <h2 className="text-xl font-bold text-secondaryGray-900 dark:text-white">
                {task.title}
              </h2>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className={cn(
                  "text-xs font-bold px-2 py-1 rounded-[10px]",
                  PRIORITY_COLORS[task.priority]
                )}
              >
                {task.priority}
              </span>
              <span className="text-xs font-medium px-2 py-1 rounded-[10px] bg-secondaryGray-300 dark:bg-navy-700 text-secondaryGray-700 dark:text-white">
                {STATUS_LABELS[task.status]}
              </span>
              {task.project && (
                <span className="text-xs text-secondaryGray-600 font-normal">{task.project}</span>
              )}
            </div>
            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2 py-0.5 rounded-[10px] bg-brand-100 dark:bg-brand-900/40 text-brand-500 dark:text-brand-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {editing ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white transition-colors duration-150 disabled:opacity-60 gradient-brand"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Save"}
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-brand-500 border border-brand-500/30 hover:bg-brand-100 dark:hover:bg-brand-900/20 transition-colors duration-150"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-secondaryGray-600 hover:text-secondaryGray-900 dark:hover:text-white hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="text-sm font-bold text-secondaryGray-900 dark:text-white block mb-2">
              Description
            </label>
            {editing ? (
              <textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white p-4 resize-none"
              />
            ) : (
              <p className="text-sm text-secondaryGray-600 font-normal leading-[150%]">
                {task.description || "No description provided."}
              </p>
            )}
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs text-secondaryGray-600 font-normal mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Due Date
              </label>
              {editing ? (
                <input
                  type="date"
                  value={form.dueDate?.split("T")[0] || ""}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })
                  }
                  className="w-full h-10 px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
                />
              ) : (
                <p className="text-sm font-bold text-secondaryGray-900 dark:text-white">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs text-secondaryGray-600 font-normal mb-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Priority
              </label>
              {editing ? (
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                  className="w-full h-10 px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
                >
                  {["urgent", "high", "medium", "low"].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-1 rounded-[10px]",
                    PRIORITY_COLORS[task.priority]
                  )}
                >
                  {task.priority}
                </span>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs text-secondaryGray-600 font-normal mb-1.5">
                <Tag className="w-3.5 h-3.5" /> Status
              </label>
              {editing ? (
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                  className="w-full h-10 px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              ) : (
                <p className="text-sm font-bold text-secondaryGray-900 dark:text-white">
                  {STATUS_LABELS[task.status]}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs text-secondaryGray-600 font-normal mb-1.5">
                Progress
              </label>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form.progress || 0}
                    onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                    className="flex-1 accent-brand-500"
                  />
                  <span className="text-sm font-bold text-secondaryGray-900 dark:text-white w-8">
                    {form.progress}%
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 rounded-[20px] bg-blue-50 dark:bg-white/10">
                      <div
                        className="h-full rounded-[20px] bg-brand-500"
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-secondaryGray-900 dark:text-white">
                      {task.progress || 0}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-1.5 text-xs text-secondaryGray-600 font-normal mb-1.5">
                <Tag className="w-3.5 h-3.5" /> Tags
              </label>
              {editing ? (
                <input
                  value={(form.tags || []).join(", ")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="e.g. Feature, Bug, UI"
                  className="w-full h-10 px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600 placeholder:font-normal"
                />
              ) : (
                <div className="flex flex-wrap gap-1">
                  {task.tags && task.tags.length > 0 ? (
                    task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-2 py-0.5 rounded-[10px] bg-brand-100 dark:bg-brand-900/40 text-brand-500 dark:text-brand-400"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-secondaryGray-600 font-normal">—</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-secondaryGray-900 dark:text-white mb-3">
              <User className="w-4 h-4" /> Assignees
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {(task.assignees || []).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondaryGray-300 dark:bg-navy-700"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: user.avatarColor || "#422AFB" }}
                  >
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                  <span className="text-xs font-medium text-secondaryGray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              ))}
              {(!task.assignees || task.assignees.length === 0) && (
                <span className="text-sm text-secondaryGray-600 font-normal">No assignees</span>
              )}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-secondaryGray-900 dark:text-white mb-3">
              <MessageSquare className="w-4 h-4" /> Comments ({form.comments?.length || 0})
            </label>
            <div className="space-y-3 mb-4">
              {(form.comments || []).map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: comment.user?.avatarColor || "#422AFB" }}
                  >
                    {comment.user?.firstName?.[0]}
                    {comment.user?.lastName?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-secondaryGray-900 dark:text-white">
                        {comment.user?.firstName} {comment.user?.lastName}
                      </span>
                      <span className="text-[10px] text-secondaryGray-600 font-normal">
                        {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-secondaryGray-700 dark:text-secondaryGray-300 font-normal leading-[150%]">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                placeholder="Add a comment..."
                className="flex-1 h-10 px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600 placeholder:font-normal"
              />
              <button
                onClick={addComment}
                className="px-4 h-10 rounded-full text-sm font-bold text-white gradient-brand"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
