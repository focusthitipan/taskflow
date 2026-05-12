"use client";

import { Search, X } from "lucide-react";
import { useT } from "@/components/layout/i18n-provider";
import type { TaskFilters } from "@/types";

interface FilterBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const { t } = useT();

  const PRIORITIES = [
    { value: "all", label: t.dashboard.allPriorities },
    { value: "urgent", label: t.dashboard.urgent },
    { value: "high", label: t.dashboard.high },
    { value: "medium", label: t.dashboard.medium },
    { value: "low", label: t.dashboard.low },
  ];

  const STATUSES = [
    { value: "all", label: t.dashboard.allStatus },
    { value: "todo", label: t.dashboard.toDo },
    { value: "in_progress", label: t.dashboard.inProgress },
    { value: "done", label: t.dashboard.done },
  ];

  const hasActiveFilters =
    filters.search || filters.priority !== "all" || filters.status !== "all";

  const clear = () =>
    onFiltersChange({ search: "", priority: "all", status: "all" });

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
      {/* Search */}
      <div className="flex items-center gap-2 h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-800 flex-1 min-w-[160px] sm:min-w-[200px] sm:max-w-xs">
        <Search className="w-4 h-4 text-secondaryGray-600 flex-shrink-0" />
        <input
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          placeholder={t.dashboard.searchTasks}
          className="bg-transparent text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600 placeholder:font-normal flex-1 border-none"
        />
        {filters.search && (
          <button
            onClick={() => onFiltersChange({ ...filters, search: "" })}
            className="text-secondaryGray-600 hover:text-secondaryGray-900 dark:hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Priority filter */}
      <select
        value={filters.priority}
        onChange={(e) =>
          onFiltersChange({ ...filters, priority: e.target.value as TaskFilters["priority"] })
        }
        className="h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-800 text-sm font-medium text-secondaryGray-900 dark:text-white"
      >
        {PRIORITIES.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      {/* Status filter */}
      <select
        value={filters.status}
        onChange={(e) =>
          onFiltersChange({ ...filters, status: e.target.value as TaskFilters["status"] })
        }
        className="h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-800 text-sm font-medium text-secondaryGray-900 dark:text-white"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={clear}
          className="h-[44px] px-4 rounded-2xl text-sm font-medium text-red-500 border border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors duration-150 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          {t.common.clear}
        </button>
      )}
    </div>
  );
}
