"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Edit2, Save, Calendar, Tag, User, AlertCircle, MessageSquare, Trash2 } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { Task, TaskPriority, TaskStatus, UserRole } from "@/types";
import { useT } from "@/components/layout/i18n-provider";
import { cn } from "@/lib/utils";
import { canEditTask, canCreateTask } from "@/lib/can-edit";
import { toast } from "sonner";

interface MentionUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  avatarColor?: string | null;
}

interface TaskDetailModalProps {
  readonly task: Task;
  readonly onClose: () => void;
  readonly onUpdate: (task: Task) => void;
  readonly onDelete?: () => void;
  readonly currentUserRole?: UserRole;
  readonly currentUserId?: string;
}

export function TaskDetailModal({ task, onClose, onUpdate, onDelete, currentUserRole, currentUserId }: TaskDetailModalProps) {
  const canEdit = canEditTask(currentUserRole, currentUserId, task);
  const canComment = canCreateTask(currentUserRole);
  const { t, locale } = useT();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...task });
  const [newComment, setNewComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [tagsError, setTagsError] = useState("");
  const [dueDateError, setDueDateError] = useState("");

  // Mention autocomplete
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const mentionInputRef = useRef<HTMLInputElement>(null);

  const PRIORITY_COLORS: Record<TaskPriority, string> = {
    urgent: "bg-red-100 text-red-500",
    high: "bg-orange-100 text-orange-500",
    medium: "bg-brand-100 text-brand-500",
    low: "bg-green-100 text-green-500",
  };

  const STATUS_LABELS: Record<TaskStatus, string> = {
    todo: t.dashboard.toDo,
    in_progress: t.dashboard.inProgress,
    done: t.dashboard.done,
  };

  const dateLocale = locale === "th" ? "th-TH" : "en-US";

  const handleSave = async () => {
    if (!form.title.trim()) {
      setTitleError(t.dashboard.taskTitleRequired);
      return;
    }
    if (form.title.length > 100) {
      setTitleError(t.dashboard.taskTitleTooLong);
      return;
    }
    setTitleError("");
    if ((form.description ?? "").length > 500) {
      setDescriptionError(t.dashboard.descriptionTooLong);
      return;
    }
    setDescriptionError("");
    if ((form.tags ?? []).length > 5) {
      setTagsError(t.dashboard.tooManyTags);
      return;
    }
    setTagsError("");
    if (form.dueDate && new Date(form.dueDate) < new Date(new Date().toDateString())) {
      setDueDateError(t.dashboard.dueDatePast);
      return;
    }
    setDueDateError("");
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
      toast.success(t.dashboard.taskUpdated);
    } catch {
      toast.error(t.dashboard.failedUpdateTask);
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
        toast.success(t.dashboard.commentAdded);
      }
    } catch {
      toast.error(t.dashboard.failedAddComment);
    }
  };

  const deleteTask = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      toast.success(t.dashboard.taskDeleted);
      if (onDelete) onDelete();
      else onClose();
    } catch {
      toast.error(t.dashboard.failedDeleteTask);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await fetch(`/api/tasks/${task.id}/comments/${commentId}`, { method: "DELETE" });
      setForm((f) => ({ ...f, comments: (f.comments || []).filter((c) => c.id !== commentId) }));
      toast.success(t.dashboard.commentDeleted);
    } catch {
      toast.error(t.dashboard.failedDeleteComment);
    }
  };

  // Fetch team members for mention autocomplete
  useEffect(() => {
    fetch("/api/team/members")
      .then((r) => r.json())
      .then((d) => {
        if (d.members) setMentionUsers(d.members);
      })
      .catch(() => {});
  }, []);

  const getMentionCandidates = useCallback((query: string) => {
    if (!query) return mentionUsers.slice(0, 6);
    const q = query.toLowerCase();
    return mentionUsers
      .filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [mentionUsers]);

  const handleCommentChange = (value: string) => {
    setNewComment(value);
    const atMatch = (/@(\S*)$/).exec(value);
    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setMentionOpen(true);
      setMentionIndex(0);
    } else {
      setMentionOpen(false);
      setMentionQuery("");
    }
  };

  const selectMention = (user: MentionUser) => {
    const replaced = newComment.replace(/@\S*$/, `@${user.firstName} `);
    setNewComment(replaced);
    setMentionOpen(false);
    setMentionQuery("");
    mentionInputRef.current?.focus();
  };

  const handleMentionKeyDown = (e: React.KeyboardEvent) => {
    if (!mentionOpen) return;
    const candidates = getMentionCandidates(mentionQuery);
    if (candidates.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMentionIndex((i) => (i + 1) % candidates.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setMentionIndex((i) => (i - 1 + candidates.length) % candidates.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      selectMention(candidates[mentionIndex]);
    } else if (e.key === "Escape") {
      setMentionOpen(false);
    }
  };

  const PRIORITY_LABELS: Record<TaskPriority, string> = {
    urgent: t.dashboard.urgent,
    high: t.dashboard.high,
    medium: t.dashboard.medium,
    low: t.dashboard.low,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default border-0 p-0"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-navy-800 rounded-[30px] w-full max-w-2xl max-h-[90vh] overflow-y-auto card-shadow custom-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-secondaryGray-100 dark:border-white/10">
          <div className="flex-1 min-w-0 pr-4">
            {editing ? (
              <div>
                <input
                  value={form.title}
                  onChange={(e) => { setForm({ ...form, title: e.target.value }); setTitleError(""); }}
                  className="w-full text-xl font-bold text-secondaryGray-900 dark:text-white bg-transparent border-b border-brand-500 pb-1"
                />
                <div className="flex items-center justify-between mt-1">
                  {titleError ? (
                    <p className="text-xs text-red-500">{titleError}</p>
                  ) : <span />}
                  <p className={`text-xs ${form.title.length > 100 ? "text-red-500" : "text-secondaryGray-600"}`}>
                    {form.title.length}/100
                  </p>
                </div>
              </div>
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
                {PRIORITY_LABELS[task.priority]}
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
            {editing && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white transition-colors duration-150 disabled:opacity-60 gradient-brand"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? t.common.saving : t.common.save}
              </button>
            )}
            {!editing && canEdit && (
              <button
                onClick={() => { setEditing(true); setTitleError(""); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-brand-500 border border-brand-500/30 hover:bg-brand-100 dark:hover:bg-brand-900/20 transition-colors duration-150"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {t.common.edit}
              </button>
            )}
            {!editing && canEdit && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                title={t.dashboard.deleteTask}
              >
                <Trash2 className="w-4 h-4" />
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

        {confirmDelete && (
          <div className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/40 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400 font-normal flex-1">{t.dashboard.deleteTaskWarning}</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-secondaryGray-600 hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={deleteTask}
                disabled={deleting}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors duration-150 disabled:opacity-60"
              >
                {deleting ? "..." : t.dashboard.deleteTask}
              </button>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="text-sm font-bold text-secondaryGray-900 dark:text-white block mb-2">
              {t.dashboard.description}
            </label>
            {editing ? (
              <>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => { setForm({ ...form, description: e.target.value }); setDescriptionError(""); }}
                  rows={3}
                  className="w-full rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white p-4 resize-none"
                />
                <div className="flex items-center justify-between mt-1">
                  {descriptionError ? (
                    <p className="text-xs text-red-500">{descriptionError}</p>
                  ) : <span />}
                  <p className={`text-xs ${(form.description ?? "").length > 500 ? "text-red-500" : "text-secondaryGray-600"}`}>
                    {(form.description ?? "").length}/500
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-secondaryGray-600 font-normal leading-[150%]">
                {task.description || t.dashboard.noDescription}
              </p>
            )}
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs text-secondaryGray-600 font-normal mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> {t.dashboard.dueDate}
              </label>
              {editing ? (
                <>
                  <input
                    type="date"
                    value={form.dueDate?.split("T")[0] || ""}
                    onChange={(e) => {
                      setForm({ ...form, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined });
                      setDueDateError("");
                    }}
                    className="w-full h-10 px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
                  />
                  {dueDateError && (
                    <p className="text-xs text-red-500 mt-1">{dueDateError}</p>
                  )}
                </>
              ) : (
                <p className="text-sm font-bold text-secondaryGray-900 dark:text-white">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString(dateLocale, {
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
                <AlertCircle className="w-3.5 h-3.5" /> {t.dashboard.priority}
              </label>
              {editing ? (
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                  className="w-full h-10 px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
                >
                  {(["urgent", "high", "medium", "low"] as TaskPriority[]).map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p]}
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
                  {PRIORITY_LABELS[task.priority]}
                </span>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs text-secondaryGray-600 font-normal mb-1.5">
                <Tag className="w-3.5 h-3.5" /> {t.dashboard.status}
              </label>
              {editing ? (
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                  className="w-full h-10 px-3 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white"
                >
                  <option value="todo">{t.dashboard.toDo}</option>
                  <option value="in_progress">{t.dashboard.inProgress}</option>
                  <option value="done">{t.dashboard.done}</option>
                </select>
              ) : (
                <p className="text-sm font-bold text-secondaryGray-900 dark:text-white">
                  {STATUS_LABELS[task.status]}
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs text-secondaryGray-600 font-normal mb-1.5">
                {t.dashboard.progress}
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
                <Tag className="w-3.5 h-3.5" /> {t.dashboard.tags}
              </label>
              {editing ? (
                <>
                  <input
                    value={(form.tags || []).join(", ")}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      });
                      setTagsError("");
                    }}
                    placeholder={t.dashboard.egTags}
                    className="w-full h-10 px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600 placeholder:font-normal"
                  />
                  {tagsError && (
                    <p className="text-xs text-red-500 mt-1">{tagsError}</p>
                  )}
                </>) : (
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
              <User className="w-4 h-4" /> {t.dashboard.assignees}
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {(task.assignees || []).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondaryGray-300 dark:bg-navy-700"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={`${user.firstName}`} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: user.avatarColor || "#EE5D50" }}
                      >
                        {user.firstName[0]}
                        {user.lastName[0]}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-secondaryGray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              ))}
              {(!task.assignees || task.assignees.length === 0) && (
                <span className="text-sm text-secondaryGray-600 font-normal">{t.dashboard.noDescription.split(".")[0]}</span>
              )}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-secondaryGray-900 dark:text-white mb-3">
              <MessageSquare className="w-4 h-4" /> {t.dashboard.comments} ({form.comments?.length || 0})
            </label>
            <div className="space-y-3 mb-4">
              {(form.comments || []).map((comment) => {
                const canDeleteComment = currentUserRole === "admin" || comment.userId === currentUserId;
                return (
                  <div key={comment.id} className="flex gap-3 group">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {comment.user?.avatarUrl ? (
                        <img src={comment.user.avatarUrl} alt={comment.user.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: comment.user?.avatarColor || "#EE5D50" }}
                        >
                          {comment.user?.firstName?.[0]}
                          {comment.user?.lastName?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-secondaryGray-900 dark:text-white">
                          {comment.user?.firstName} {comment.user?.lastName}
                        </span>
                        <span className="text-[10px] text-secondaryGray-600 font-normal">
                          {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}
                        </span>
                        {canDeleteComment && (
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="ml-auto opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-secondaryGray-400 hover:text-red-500 transition-all duration-150"
                            title={t.common.delete}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-secondaryGray-700 dark:text-secondaryGray-300 font-normal leading-[150%]">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {canComment && (
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  ref={mentionInputRef}
                  value={newComment}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (mentionOpen) {
                      handleMentionKeyDown(e);
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      addComment();
                    }
                  }}
                  placeholder={t.dashboard.addComment}
                  className="w-full h-10 px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600 placeholder:font-normal"
                />
                {mentionOpen && getMentionCandidates(mentionQuery).length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-navy-800 rounded-[16px] card-shadow border border-secondaryGray-100 dark:border-white/10 overflow-hidden z-50">
                    {getMentionCandidates(mentionQuery).map((user, idx) => (
                      <button
                        key={user.id}
                        onClick={() => selectMention(user)}
                        onMouseEnter={() => setMentionIndex(idx)}
                        className={cn(
                          "flex items-center gap-2 w-full px-3 py-2 text-left transition-colors duration-150",
                          idx === mentionIndex
                            ? "bg-brand-100 dark:bg-brand-900/30"
                            : "hover:bg-secondaryGray-300 dark:hover:bg-navy-700"
                        )}
                      >
                        <div className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: user.avatarColor || "#EE5D50" }}
                            >
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-bold text-secondaryGray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={addComment}
                className="px-4 h-10 rounded-full text-sm font-bold text-white gradient-brand"
              >
                {t.common.post}
              </button>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
