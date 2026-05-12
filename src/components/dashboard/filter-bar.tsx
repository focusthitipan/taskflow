"use client";

import { Search, X } from "lucide-react";
import type { TaskFilters } from "@/types";

interface FilterBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

const PRIORITIES = [
  { value: "all", label: "All Priorities" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const STATUSES = [
  { value: "all", label: "All Status" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
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
          placeholder="Search tasks..."
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
          Clear
        </button>
      )}
    </div>
  );
}
