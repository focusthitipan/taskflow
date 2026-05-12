"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { UsersTable } from "@/components/users/users-table";
import { UserModal } from "@/components/users/user-modal";
import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { useT } from "@/components/layout/i18n-provider";
import type { User } from "@/types";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function UsersPage() {
  const { t } = useT();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  useEffect(() => {
    if (session && !isAdmin) {
      redirect("/dashboard");
    }
  }, [session, isAdmin]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (role !== "all") params.set("role", role);
      if (status !== "all") params.set("status", status);
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));
      params.set("sort_by", sortBy);
      params.set("sort_dir", sortDir);

      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      setUsers(data.users);
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, role, status, pagination.page, pagination.limit, sortBy, sortDir]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(newSortBy);
      setSortDir("desc");
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleUserSaved = () => {
    fetchUsers();
  };

  const handleDeleted = () => {
    fetchUsers();
  };

  const activeCount = users.filter((u) => u.status === "active").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="stagger stagger-1 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: t.users.totalUsers, value: pagination.total, color: "text-brand-500" },
          { label: t.users.active, value: activeCount, color: "text-green-500" },
          { label: t.users.admins, value: adminCount, color: "text-orange-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-navy-800 rounded-[20px] p-5 card-shadow"
          >
            <p className="text-sm text-secondaryGray-600 font-normal">{stat.label}</p>
            <p className={`text-[24px] sm:text-[34px] font-bold leading-none mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="stagger stagger-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-secondaryGray-900 dark:text-white">{t.users.allUsers}</h2>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 h-[44px] px-5 rounded-full text-sm font-bold text-white gradient-brand transition-all duration-250 ease"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden 2sm:inline">{t.users.addUser}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="stagger stagger-3 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-800 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-secondaryGray-600 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
            placeholder={t.users.searchUsers}
            className="bg-transparent text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600 placeholder:font-normal flex-1 border-none"
          />
        </div>

        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); handleFilterChange(); }}
          className="h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-800 text-sm font-medium text-secondaryGray-900 dark:text-white"
        >
          <option value="all">{t.users.allRoles}</option>
          <option value="admin">{t.team.admin}</option>
          <option value="member">{t.team.member}</option>
          <option value="viewer">{t.team.viewer}</option>
        </select>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); handleFilterChange(); }}
          className="h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white dark:bg-navy-800 text-sm font-medium text-secondaryGray-900 dark:text-white"
        >
          <option value="all">{t.users.allStatus}</option>
          <option value="active">{t.users.active}</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="stagger stagger-4">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <UsersTable
          users={users}
          pagination={pagination}
          sortBy={sortBy}
          sortDir={sortDir}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          onEdit={setEditUser}
          onDelete={setDeleteUser}
        />
      )}

      </div>
      {/* Modals */}
      {addOpen && (
        <UserModal mode="add" onClose={() => setAddOpen(false)} onSaved={handleUserSaved} />
      )}
      {editUser && (
        <UserModal
          mode="edit"
          user={editUser}
          onClose={() => setEditUser(null)}
          onSaved={handleUserSaved}
        />
      )}
      {deleteUser && (
        <DeleteUserDialog
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
