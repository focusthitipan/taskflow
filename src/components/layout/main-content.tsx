"use client";

import { useSidebar } from "./sidebar-context";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const sidebarWidth = collapsed ? 72 : 300;

  return (
    <div
      className="transition-all duration-200 min-h-screen"
      style={{ marginLeft: `${sidebarWidth}px` }}
    >
      {children}
    </div>
  );
}
