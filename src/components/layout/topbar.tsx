"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell, Search, LogOut, User, ChevronDown, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect, useCallback } from "react";
import { useSidebar } from "./sidebar-context";
import { useT } from "./i18n-provider";
import { useProfile } from "./profile-context";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@/types";
import { SearchModal } from "./search-modal";

function getNotifDotColor(type: string): string {
  if (type === "error") return "bg-red-500";
  if (type === "success") return "bg-green-500";
  if (type === "warning") return "bg-orange-500";
  return "bg-brand-500";
}

export function Topbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t, locale } = useT();
  const { collapsed, toggleMobile, isMobile } = useSidebar();
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const userId = (session?.user as { id?: string })?.id;

  const PAGE_TITLES: Record<string, string> = {
    "/dashboard": t.dashboard.title,
    "/my-tasks": t.myTasks.title,
    "/team": t.team.title,
    "/graph": t.graph.title,
    "/users": t.users.title,
    "/settings": t.settings.title,
  };

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

  const { avatarUrl: userAvatarUrl, avatarColor: userAvatarColor, displayName } = useProfile();

  const title = PAGE_TITLES[pathname] || "TaskFlow";
  const unreadCount = notifications.filter((n) => !n.read).length;
  const user = session?.user;
  const userName = displayName || user?.name || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const collapsedWidth = collapsed ? 72 : 300;
  const sidebarWidth = isMobile ? 0 : collapsedWidth;

  function renderNotifList() {
    if (notifLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      );
    }
    if (notifications.length === 0) {
      return (
        <p className="text-sm text-secondaryGray-600 text-center py-8">
          {t.topbar.noNotifications}
        </p>
      );
    }
    return notifications.map((n) => (
      <button
        key={n.id}
        onClick={() => markRead(n.id)}
        className={cn(
          "w-full text-left px-4 sm:px-5 py-4 border-b border-secondaryGray-100 dark:border-white/10 last:border-0 hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150",
          !n.read && "bg-brand-100/30 dark:bg-brand-900/20"
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", getNotifDotColor(n.type))} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-secondaryGray-900 dark:text-white">{n.title}</p>
            <p className="text-xs text-secondaryGray-600 font-normal mt-0.5">{n.message}</p>
            <p className="text-[10px] text-secondaryGray-600 font-normal mt-1">
              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
            </p>
          </div>
          {!n.read && (
            <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />
          )}
        </div>
      </button>
    ));
  }

  const dateLocale = locale === "th" ? "th-TH" : "en-US";

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
      className="fixed top-3 sm:top-5 right-3 sm:right-5 z-30 transition-all duration-200"
      style={{ left: isMobile ? "12px" : `${sidebarWidth + 20}px` }}
    >
      <div className="glass-navbar dark:glass-navbar rounded-2xl px-4 sm:px-6 min-h-[60px] sm:min-h-[75px] flex items-center justify-between gap-4">
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger — mobile only */}
          {isMobile && (
            <button
              onClick={toggleMobile}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-secondaryGray-700 dark:text-white hover:bg-secondaryGray-400 dark:hover:bg-navy-900 transition-colors duration-150"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="text-[22px] sm:text-[28px] md:text-[34px] font-bold text-secondaryGray-900 dark:text-white leading-none truncate">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-secondaryGray-600 font-normal mt-1 hidden 2sm:block">
              {new Date().toLocaleDateString(dateLocale, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Search — hidden on small screens, shown as icon button on mobile */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-2 h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-white/60 dark:bg-navy-700/60 min-w-[180px] lg:min-w-[200px] cursor-text"
          >
            <Search className="w-4 h-4 text-secondaryGray-600 flex-shrink-0" />
            <span className="text-sm text-secondaryGray-600 font-normal flex-1 text-left">
              {t.topbar.search}
            </span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded-[8px] bg-secondaryGray-200 dark:bg-navy-900 px-1.5 py-0.5 text-[10px] text-secondaryGray-600 font-normal">
              <span className="text-[10px]">⌘</span>K
            </kbd>
          </button>

          {/* Mobile search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex md:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center bg-white dark:bg-navy-700 hover:bg-secondaryGray-400 dark:hover:bg-navy-900 transition-colors duration-150"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-secondaryGray-700 dark:text-white" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setAvatarOpen(false);
                if (!notifOpen) fetchNotifications();
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-white dark:bg-navy-700 hover:bg-secondaryGray-400 dark:hover:bg-navy-900 transition-colors duration-150 relative"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-secondaryGray-700 dark:text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close notifications"
                  className="fixed inset-0 z-40 cursor-default border-0 bg-transparent p-0"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-[300px] sm:w-[340px] bg-white dark:bg-navy-800 rounded-[20px] card-shadow overflow-hidden">
                  <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-secondaryGray-100 dark:border-white/10">
                    <p className="font-bold text-secondaryGray-900 dark:text-white text-sm">
                      {t.topbar.notifications}
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
                        {t.topbar.markAllRead}
                      </button>
                    )}
                  </div>
                  <div className="max-h-[280px] sm:max-h-[300px] overflow-y-auto custom-scrollbar">
                    {renderNotifList()}
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
              className="flex items-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-2 sm:px-3 rounded-full bg-white dark:bg-navy-700 hover:bg-secondaryGray-400 dark:hover:bg-navy-900 transition-colors duration-150"
            >
              <Avatar className="w-6 h-6 sm:w-7 sm:h-7">
                {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName} />}
                <AvatarFallback
                  className="text-white text-xs font-bold"
                  style={{ backgroundColor: userAvatarColor || "#EE5D50" }}
                >
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-bold text-secondaryGray-900 dark:text-white">
                {userName.split(" ")[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-secondaryGray-600 hidden sm:block" />
            </button>

            {avatarOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="fixed inset-0 z-40 cursor-default border-0 bg-transparent p-0"
                  onClick={() => setAvatarOpen(false)}
                />
                <div className="absolute right-0 top-12 z-50 w-[180px] sm:w-[200px] bg-white dark:bg-navy-800 rounded-[20px] card-shadow overflow-hidden py-2">
                  <div className="px-4 py-3 border-b border-secondaryGray-100 dark:border-white/10">
                    <p className="text-sm font-bold text-secondaryGray-900 dark:text-white">
                      {userName}
                    </p>
                    <p className="text-xs text-secondaryGray-600 font-normal truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setAvatarOpen(false);
                      globalThis.location.href = "/settings";
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-secondaryGray-900 dark:text-white hover:bg-secondaryGray-300 dark:hover:bg-navy-700 transition-colors duration-150"
                  >
                    <User className="w-4 h-4 text-secondaryGray-600" />
                    {t.topbar.profileSettings}
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors duration-150"
                  >
                    <LogOut className="w-4 h-4" />
                    {t.topbar.signOut}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
