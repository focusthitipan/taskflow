"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface WorkspaceSettings {
  name: string;
  defaultPriority: "urgent" | "high" | "medium" | "low";
  workingDays: string[];
  businessHoursStart: string;
  businessHoursEnd: string;
  tags: string[];
}

interface WorkspaceContextValue extends WorkspaceSettings {
  refresh: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  name: "",
  defaultPriority: "medium",
  workingDays: [],
  businessHoursStart: "",
  businessHoursEnd: "",
  tags: [],
  refresh: async () => {},
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<WorkspaceSettings>({
    name: "",
    defaultPriority: "medium",
    workingDays: [],
    businessHoursStart: "",
    businessHoursEnd: "",
    tags: [],
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/workspace");
      const data = await res.json();
      if (data.workspace) {
        setSettings({
          name: data.workspace.name || "",
          defaultPriority: data.workspace.defaultPriority || "medium",
          workingDays: data.workspace.workingDays || [],
          businessHoursStart: data.workspace.businessHoursStart || "",
          businessHoursEnd: data.workspace.businessHoursEnd || "",
          tags: data.workspace.tags || [],
        });
      }
    } catch {
      // keep current settings on error
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    document.title = settings.name
      ? `${settings.name} — TaskFlow`
      : "TaskFlow — Team Task Management";
  }, [settings.name]);

  return (
    <WorkspaceContext.Provider value={{ ...settings, refresh }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
