"use client";

import { useSidebar } from "./sidebar-context";

export function MainContent({ children }: Readonly<{ children: React.ReactNode }>) {
  const { collapsed, isMobile } = useSidebar();
  const sidebarWidth = collapsed ? 72 : 300;

  return (
    <div
      className="transition-all duration-200 min-h-screen"
      style={{ marginLeft: isMobile ? 0 : `${sidebarWidth}px` }}
    >
      {children}
    </div>
  );
}
