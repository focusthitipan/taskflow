"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell, Search, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/types";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/my-tasks": "My Tasks",
  "/team": "Team",
  "/graph": "Daily Graph",
  "/users": "User Management",
  "/settings": "Settings",
};

export function Topbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { collapsed } = useSidebar();
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const userId = (session?.user as { id?: string })?.id;

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setNotifLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setNotifLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const title = PAGE_TITLES[pathname] || "TaskFlow";
  const unreadCount = notifications.filter((n) => !n.read).length;
  const user = session?.user;
  const userName = user?.name || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sidebarWidth = collapsed ? 72 : 300;

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  const markRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  return (
    <div
      className="fixed top-5 right-5 z-30 transition-all duration-200"
      style={{ left: `${sidebarWidth + 20}px` }}
    >
      <div className="glass-navbar dark:glass-navbar rounded-2xl px-6 min-h-[75px] flex items-center justify-between gap-4">
        {/* Page title */}
        <div>
          <h1 className="text-[34px] font-bold text-secondaryGray-900 dark:text-white leading-none">
            {title}
          </h1>
          <p className="text-sm text-secondaryGray-600 font-normal mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white/60 dark:bg-navy-700/60 min-w-[200px]">
            <Search className="w-4 h-4 text-secondaryGray-600 flex-shrink-0" />
            <input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="bg-transparent text-sm text-secondaryGray-900 dark:text-white placeholder:text-secondaryGray-600 placeholder:font-normal flex-1 border-none"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setAvatarOpen(false);
                if (!notifOpen) fetchNotifications();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-navy-700 hover:bg-secondaryGray-400 dark:hover:bg-navy-900 transition-colors duration-150 relative"
            >
              <Bell className="w-5 h-5 text-secondaryGray-700 dark:text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-[340px] bg-white dark:bg-navy-800 rounded-[20px] card-shadow overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-secondaryGray-100 dark:border-white/10">
                    <p className="font-bold text-secondaryGray-900 dark:text-white text-sm">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-[10px] bg-brand-100 dark:bg-brand-900 text-brand-500 dark:text-brand-400 text-xs font-bold">
                          {unreadCount}
                        </span>
                      )}
                    </p>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-brand-500 dark:text-brand-400 font-medium hover:opacity-80 transition-opacity"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <p className="text-sm text-secondaryGray-600 text-center py-8">
                        No notifications
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={cn(
                            "w-full text-left px-5 py-4 border-b border-secondaryGray-100 dark:border-white/10 last:border-0 hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150",
                            !n.read && "bg-brand-100/30 dark:bg-brand-900/20"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                                n.type === "error"
                                  ? "bg-red-500"
                                  : n.type === "success"
                                    ? "bg-green-500"
                                    : n.type === "warning"
                                      ? "bg-orange-500"
                                      : "bg-brand-500"
                              )}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-secondaryGray-900 dark:text-white">
                                {n.title}
                              </p>
                              <p className="text-xs text-secondaryGray-600 font-normal mt-0.5">
                                {n.message}
                              </p>
                              <p className="text-[10px] text-secondaryGray-600 font-normal mt-1">
                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            {!n.read && (
                              <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setAvatarOpen(!avatarOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 h-10 px-3 rounded-full bg-white dark:bg-navy-700 hover:bg-secondaryGray-400 dark:hover:bg-navy-900 transition-colors duration-150"
            >
              <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                {userInitials}
              </div>
              <span className="hidden md:block text-sm font-bold text-secondaryGray-900 dark:text-white">
                {userName.split(" ")[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-secondaryGray-600" />
            </button>

            {avatarOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setAvatarOpen(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-[200px] bg-white dark:bg-navy-800 rounded-[20px] card-shadow overflow-hidden py-2">
                  <div className="px-4 py-3 border-b border-secondaryGray-100 dark:border-white/10">
                    <p className="text-sm font-bold text-secondaryGray-900 dark:text-white">
                      {userName}
                    </p>
                    <p className="text-xs text-secondaryGray-600 font-normal">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setAvatarOpen(false);
                      window.location.href = "/settings";
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-secondaryGray-900 dark:text-white hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150"
                  >
                    <User className="w-4 h-4 text-secondaryGray-600" />
                    Profile & Settings
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors duration-150"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
