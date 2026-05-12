"use client";

import type { TeamMember } from "@/types";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface WorkloadOverviewProps {
  members: TeamMember[];
}

export function WorkloadOverview({ members }: WorkloadOverviewProps) {
  return (
    <div className="bg-white dark:bg-navy-800 rounded-[20px] p-5 card-shadow">
      <h3 className="text-xl font-bold text-secondaryGray-900 dark:text-white mb-5">
        Team Workload
      </h3>
      <div className="space-y-4">
        {members.map((member) => {
          const isOverloaded = member.workloadPercent > 85;

          return (
            <div key={member.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: member.avatarColor || "#422AFB" }}
                  >
                    {member.firstName[0]}
                    {member.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-secondaryGray-900 dark:text-white leading-none">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-xs text-secondaryGray-600 font-normal mt-0.5">
                      {member.taskCount} tasks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isOverloaded && (
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-bold",
                      isOverloaded ? "text-orange-500" : "text-secondaryGray-900 dark:text-white"
                    )}
                  >
                    {member.workloadPercent}%
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-[20px] bg-blue-50 dark:bg-white/10">
                <div
                  className={cn(
                    "h-full rounded-[20px] transition-all duration-250",
                    isOverloaded ? "bg-orange-500" : "bg-brand-500"
                  )}
                  style={{ width: `${member.workloadPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
