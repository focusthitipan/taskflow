"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useT } from "./i18n-provider";
import type { Task } from "@/types";
import { cn } from "@/lib/utils";

const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  urgent: { label: "", bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-500" },
  high: { label: "", bg: "bg-orange-100 dark:bg-orange-500/20", text: "text-orange-500" },
  medium: { label: "", bg: "bg-brand-100 dark:bg-brand-500/20", text: "text-brand-500" },
  low: { label: "", bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-500" },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  todo: { label: "", bg: "bg-secondaryGray-100 dark:bg-white/10", text: "text-secondaryGray-600" },
  in_progress: { label: "", bg: "bg-blue-50 dark:bg-blue-500/20", text: "text-blue-500" },
  done: { label: "", bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-500" },
};

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const { t } = useT();
  const [query, setQuery] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Set priority and status labels from i18n
  PRIORITY_CONFIG.urgent.label = t.dashboard.urgent;
  PRIORITY_CONFIG.high.label = t.dashboard.high;
  PRIORITY_CONFIG.medium.label = t.dashboard.medium;
  PRIORITY_CONFIG.low.label = t.dashboard.low;
  STATUS_CONFIG.todo.label = t.dashboard.toDo;
  STATUS_CONFIG.in_progress.label = t.dashboard.inProgress;
  STATUS_CONFIG.done.label = t.dashboard.done;

  const fetchTasks = useCallback(async (q: string) => {
    if (!q.trim()) {
      setTasks([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?search=${encodeURIComponent(q)}&limit=8`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchTasks(query), 200);
    return () => clearTimeout(timer);
  }, [query, fetchTasks]);

  // Reset when modal opens/closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setTasks([]);
    }
  }, [open]);

  const handleSelect = (taskId: string) => {
    onOpenChange(false);
    router.push(`/dashboard?task=${taskId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-[520px] rounded-[20px] bg-white dark:bg-navy-800 border-0 card-shadow">
        <Command shouldFilter={false} className="rounded-[20px]">
          <div className="flex items-center border-b border-secondaryGray-100 dark:border-white/10 px-5">
            <Search className="w-4 h-4 text-secondaryGray-600 flex-shrink-0 mr-2" />
            <CommandInput
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              placeholder={t.search.placeholder}
              className="h-[52px] text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600 placeholder:font-normal border-0 bg-transparent flex-1 outline-none"
            />
          </div>

          <CommandList>
            {query && !loading && tasks.length === 0 && (
              <CommandEmpty className="text-secondaryGray-600 text-sm text-center px-5 py-8">
                {t.search.noResults}
              </CommandEmpty>
            )}

            {!query && (
              <div className="px-5 py-10 text-center">
                <Search className="w-8 h-8 text-secondaryGray-400 mx-auto mb-3" />
                <p className="text-sm text-secondaryGray-600">{t.search.hint}</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              </div>
            )}

            {tasks.length > 0 && (
              <CommandGroup heading={t.search.searchingFor}>
                {tasks.map((task) => {
                  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
                  return (
                    <CommandItem
                      key={task.id}
                      value={task.id}
                      onSelect={() => handleSelect(task.id)}
                      className="px-5 py-3 flex items-center gap-3 aria-selected:bg-secondaryGray-300 dark:aria-selected:bg-navy-700 cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-secondaryGray-900 dark:text-white truncate">
                          {task.title}
                        </p>
                        {task.project && (
                          <p className="text-xs text-secondaryGray-600 font-normal truncate mt-0.5">
                            {task.project}
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-bold px-2 py-1 rounded-[10px] flex-shrink-0 leading-none",
                          priority.bg,
                          priority.text
                        )}
                      >
                        {priority.label}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-bold px-2 py-1 rounded-[10px] flex-shrink-0 leading-none",
                          status.bg,
                          status.text
                        )}
                      >
                        {status.label}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
