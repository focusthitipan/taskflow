"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Settings,
  BarChart3,
  Zap,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { useT } from "./i18n-provider";
import { cn } from "@/lib/utils";
import { useWorkspace } from "./workspace-context";

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  collapsed,
  isMobile,
  setMobileOpen,
}: Readonly<{
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  collapsed: boolean;
  isMobile: boolean;
  setMobileOpen: (open: boolean) => void;
}>) {
  return (
    <Link
      href={href}
      onClick={() => isMobile && setMobileOpen(false)}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-[10px] transition-all duration-150 relative group w-full",
        isActive
          ? "text-secondaryGray-900 dark:text-white"
          : "text-secondaryGray-600 hover:text-secondaryGray-900 dark:hover:text-white"
      )}
    >
      <Icon
        className={cn(
          "w-5 h-5 flex-shrink-0 transition-colors duration-150",
          isActive ? "text-brand-500 dark:text-white" : "text-secondaryGray-600"
        )}
      />
      {(!collapsed || isMobile) && (
        <span
          className={cn(
            "text-sm transition-all duration-150",
            isActive ? "font-bold" : "font-normal"
          )}
        >
          {label}
        </span>
      )}
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-9 rounded-[5px] bg-brand-500 dark:bg-brand-400 animate-[indicator-pop_200ms_ease_both]" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { collapsed, toggle, mobileOpen, setMobileOpen, isMobile } = useSidebar();
  const { t } = useT();
  const { name: workspaceName } = useWorkspace();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  const NAV_ITEMS = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/my-tasks", label: t.nav.myTasks, icon: CheckSquare },
    { href: "/team", label: t.nav.team, icon: Users },
    { href: "/graph", label: t.nav.dailyGraph, icon: BarChart3 },
  ];

  const ADMIN_ITEMS = [
    { href: "/users", label: t.nav.userManagement, icon: Shield },
  ];

  const BOTTOM_ITEMS = [
    { href: "/settings", label: t.nav.settings, icon: Settings },
  ];

  const checkActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const desktopWidth = collapsed ? "w-[72px]" : "w-[300px]";
  const sidebarWidth = isMobile ? "w-[285px]" : desktopWidth;

  const sidebarContent = (
    <div
      className={cn(
        "h-full bg-white dark:bg-navy-800 flex flex-col overflow-hidden",
        "shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)]",
        sidebarWidth
      )}
    >
      {/* Logo */}
      <div className="logo-enter flex items-center gap-3 px-5 pt-8 pb-6 flex-shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 gradient-brand"
        >
          <Zap className="w-5 h-5 text-white" />
        </div>
        {(!collapsed || isMobile) && (
          <span className="text-xl font-bold text-secondaryGray-900 dark:text-white">
            {workspaceName}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {NAV_ITEMS.map((item, i) => (
          <div key={item.href} className={cn("nav-item", `nav-item-${i + 1}`)}>
            <NavItem {...item} isActive={checkActive(item.href)} collapsed={collapsed} isMobile={isMobile} setMobileOpen={setMobileOpen} />
          </div>
        ))}

        {isAdmin && (
          <>
            {(!collapsed || isMobile) && (
              <p className="nav-item nav-item-5 text-[10px] font-bold text-secondaryGray-600 uppercase tracking-wider px-4 pt-4 pb-1">
                {t.nav.admin}
              </p>
            )}
            {ADMIN_ITEMS.map((item, i) => (
              <div key={item.href} className={cn("nav-item", `nav-item-${NAV_ITEMS.length + i + 2}`)}>
                <NavItem {...item} isActive={checkActive(item.href)} collapsed={collapsed} isMobile={isMobile} setMobileOpen={setMobileOpen} />
              </div>
            ))}
          </>
        )}
      </nav>

      {/* Bottom items */}
      <div className="px-3 pb-4 space-y-1 flex-shrink-0">
        {BOTTOM_ITEMS.map((item, i) => (
          <div key={item.href} className={cn("nav-item", `nav-item-${NAV_ITEMS.length + ADMIN_ITEMS.length + i + 2}`)}>
            <NavItem {...item} isActive={checkActive(item.href)} collapsed={collapsed} isMobile={isMobile} setMobileOpen={setMobileOpen} />
          </div>
        ))}

        {/* Collapse toggle — desktop only */}
        {!isMobile && (
          <button
            onClick={toggle}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-[10px] text-secondaryGray-600 hover:text-secondaryGray-900 dark:hover:text-white transition-colors duration-150"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-normal">{t.nav.collapse}</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  // Mobile: slide-in drawer with backdrop
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close sidebar"
          className={cn(
            "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 cursor-default border-0 p-0",
            mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setMobileOpen(false)}
        />

        {/* Drawer */}
        <div
          className={cn(
            "fixed left-0 top-0 h-full z-50 transition-transform duration-330 ease-sidebar",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop: fixed sidebar
  return (
    <div className="fixed left-0 top-0 h-full z-40 transition-all duration-300">
      {sidebarContent}
    </div>
  );
}
