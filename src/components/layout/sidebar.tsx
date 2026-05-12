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
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-tasks", label: "My Tasks", icon: CheckSquare },
  { href: "/team", label: "Team", icon: Users },
  { href: "/graph", label: "Daily Graph", icon: BarChart3 },
];

const ADMIN_ITEMS = [
  { href: "/users", label: "User Management", icon: Shield },
];

const BOTTOM_ITEMS = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { collapsed, toggle } = useSidebar();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const NavItem = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ElementType;
  }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-[10px] transition-all duration-150 relative group w-full",
          active
            ? "text-secondaryGray-900 dark:text-white"
            : "text-secondaryGray-600 hover:text-secondaryGray-900 dark:hover:text-white"
        )}
      >
        <Icon
          className={cn(
            "w-5 h-5 flex-shrink-0 transition-colors duration-150",
            active ? "text-brand-500 dark:text-white" : "text-secondaryGray-600"
          )}
        />
        {!collapsed && (
          <span
            className={cn(
              "text-sm transition-all duration-150",
              active ? "font-bold" : "font-normal"
            )}
          >
            {label}
          </span>
        )}
        {/* Active indicator bar */}
        {active && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-9 rounded-[5px] bg-brand-500 dark:bg-brand-400" />
        )}
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-white dark:bg-navy-800 z-40 flex flex-col transition-all duration-300 overflow-hidden",
        "shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)]",
        collapsed ? "w-[72px]" : "w-[300px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-6 flex-shrink-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 gradient-brand"
        >
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold text-secondaryGray-900 dark:text-white">
            TaskFlow
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        {isAdmin && (
          <>
            {!collapsed && (
              <p className="text-[10px] font-bold text-secondaryGray-600 uppercase tracking-wider px-4 pt-4 pb-1">
                Admin
              </p>
            )}
            {ADMIN_ITEMS.map((item) => (
              <NavItem key={item.href} {...item} />
            ))}
          </>
        )}
      </nav>

      {/* Bottom items */}
      <div className="px-3 pb-4 space-y-1 flex-shrink-0">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-[10px] text-secondaryGray-600 hover:text-secondaryGray-900 dark:hover:text-white transition-colors duration-150"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-normal">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
