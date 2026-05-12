"use client";

import { Edit2, Trash2, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { useT } from "@/components/layout/i18n-provider";
import type { User, UserRole, UserStatus } from "@/types";
import { cn } from "@/lib/utils";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UsersTableProps {
  users: User[];
  pagination: PaginationMeta;
  sortBy: string;
  sortDir: string;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UsersTable({
  users,
  pagination,
  sortBy,
  sortDir,
  onPageChange,
  onSortChange,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const { t } = useT();

  const ROLE_CONFIG: Record<UserRole, { bg: string; text: string }> = {
    admin: { bg: "bg-brand-100 dark:bg-brand-900/40", text: "text-brand-500" },
    member: { bg: "bg-secondaryGray-300 dark:bg-navy-700", text: "text-secondaryGray-700 dark:text-white" },
    viewer: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-500" },
  };

  const ROLE_LABELS: Record<UserRole, string> = {
    admin: t.team.admin,
    member: t.team.member,
    viewer: t.team.viewer,
  };

  const STATUS_CONFIG: Record<UserStatus, { bg: string; text: string; dot: string }> = {
    active: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-500", dot: "bg-green-500" },
    inactive: { bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-500", dot: "bg-red-500" },
  };

  const handleSort = (key: string) => {
    onSortChange(key);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return null;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 inline ml-1" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-white dark:bg-navy-800 rounded-[20px] card-shadow overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-secondaryGray-100 dark:border-white/10">
                <th className="text-left px-3 sm:px-5 py-3 sm:py-4 text-xs font-normal text-secondaryGray-600 uppercase">
                  <button
                    onClick={() => handleSort("name")}
                    className="hover:text-secondaryGray-900 dark:hover:text-white transition-colors duration-150"
                  >
                    {t.users.user}<SortIcon column="name" />
                  </button>
                </th>
                <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-xs font-normal text-secondaryGray-600 uppercase hidden md:table-cell">
                  <button
                    onClick={() => handleSort("email")}
                    className="hover:text-secondaryGray-900 dark:hover:text-white transition-colors duration-150"
                  >
                    {t.users.email}<SortIcon column="email" />
                  </button>
                </th>
                <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-xs font-normal text-secondaryGray-600 uppercase">
                  <button
                    onClick={() => handleSort("role")}
                    className="hover:text-secondaryGray-900 dark:hover:text-white transition-colors duration-150"
                  >
                    {t.users.role}<SortIcon column="role" />
                  </button>
                </th>
                <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-xs font-normal text-secondaryGray-600 uppercase">
                  {t.users.status}
                </th>
                <th className="text-left px-3 sm:px-4 py-3 sm:py-4 text-xs font-normal text-secondaryGray-600 uppercase hidden lg:table-cell">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="hover:text-secondaryGray-900 dark:hover:text-white transition-colors duration-150"
                  >
                    {t.users.joined}<SortIcon column="createdAt" />
                  </button>
                </th>
                <th className="text-right px-3 sm:px-5 py-3 sm:py-4 text-xs font-normal text-secondaryGray-600 uppercase">
                  {t.users.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const rc = ROLE_CONFIG[user.role];
                const sc = STATUS_CONFIG[user.status];
                return (
                  <tr
                    key={user.id}
                    className="border-b border-secondaryGray-100 dark:border-white/10 last:border-0 hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150"
                  >
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: user.avatarColor || "#422AFB" }}
                        >
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <p className="text-sm font-bold text-secondaryGray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
                      <span className="text-sm text-secondaryGray-600 font-normal">{user.email}</span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <span className={cn("text-xs font-bold px-2 py-1 rounded-[10px]", rc.bg, rc.text)}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                      <span
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-[10px] w-fit",
                          sc.bg,
                          sc.text
                        )}
                      >
                        <div className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 sm:py-4 hidden lg:table-cell">
                      <span className="text-sm text-secondaryGray-600 font-normal">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-3 sm:px-5 py-4">
                      <div className="flex items-center gap-1 sm:gap-2 justify-end">
                        <button
                          onClick={() => onEdit(user)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-brand-500 hover:bg-brand-100 dark:hover:bg-brand-900/20 transition-colors duration-150"
                        >
                          <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(user)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors duration-150"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 border-t border-secondaryGray-100 dark:border-white/10 flex-wrap gap-2">
          <p className="text-xs text-secondaryGray-600 font-normal">
            {t.users.showing} {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} {t.users.of}{" "}
            {pagination.total} {t.users.users}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="w-8 h-8 rounded-full flex items-center justify-center text-secondaryGray-700 dark:text-white hover:bg-secondaryGray-300 dark:hover:bg-navy-700 disabled:opacity-40 transition-colors duration-150"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-secondaryGray-900 dark:text-white">
              {pagination.page} / {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="w-8 h-8 rounded-full flex items-center justify-center text-secondaryGray-700 dark:text-white hover:bg-secondaryGray-300 dark:hover:bg-navy-700 disabled:opacity-40 transition-colors duration-150"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {users.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-secondaryGray-600 font-normal">{t.users.noUsersFound}</p>
          </div>
        )}
      </div>
    </div>
  );
}
