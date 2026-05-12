"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "@/components/layout/i18n-provider";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  readonly page: number;
  readonly totalPages: number;
  readonly total: number;
  readonly onPageChange: (page: number) => void;
}

export function PaginationControls({ page, totalPages, total, onPageChange }: PaginationControlsProps) {
  const { t } = useT();

  if (totalPages <= 1 && total <= 0) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-xs text-secondaryGray-600 font-normal">
        {t.dashboard.title} {page} {t.users.of} {totalPages} ({total} {t.team.totalTasksLabel.toLowerCase()})
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="w-9 h-9 rounded-full flex items-center justify-center text-secondaryGray-700 dark:text-white hover:bg-secondaryGray-300 dark:hover:bg-navy-700 disabled:opacity-30 transition-colors duration-150"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-before-${pages[i + 1] ?? "end"}`} className="w-9 h-9 flex items-center justify-center text-xs text-secondaryGray-600">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "w-9 h-9 rounded-full text-xs font-bold transition-all duration-150",
                p === page
                  ? "bg-brand-500 text-white"
                  : "text-secondaryGray-600 hover:bg-secondaryGray-300 dark:hover:bg-navy-700 dark:text-white"
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="w-9 h-9 rounded-full flex items-center justify-center text-secondaryGray-700 dark:text-white hover:bg-secondaryGray-300 dark:hover:bg-navy-700 disabled:opacity-30 transition-colors duration-150"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
