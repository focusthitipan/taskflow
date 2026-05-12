"use client";

import type { ActivityLog } from "@/types";
import { formatDistanceToNow } from "date-fns";

const ACTION_COLORS: Record<string, string> = {
  completed: "bg-green-500",
  updated: "bg-brand-500",
  created: "bg-blue-500",
  started: "bg-orange-500",
  "commented on": "bg-secondaryGray-600",
};

interface ActivityFeedProps {
  activity: ActivityLog[];
}

export function ActivityFeed({ activity }: ActivityFeedProps) {
  return (
    <div className="bg-white dark:bg-navy-800 rounded-[20px] p-5 card-shadow">
      <h3 className="text-xl font-bold text-secondaryGray-900 dark:text-white mb-5">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activity.map((log, idx) => (
          <div key={log.id} className="flex items-start gap-3 relative">
            {/* Timeline line */}
            {idx < activity.length - 1 && (
              <div className="absolute left-4 top-8 w-0.5 h-full bg-secondaryGray-100 dark:bg-white/10" />
            )}

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 relative z-10"
              style={{ backgroundColor: log.user?.avatarColor || "#422AFB" }}
            >
              {log.user?.firstName?.[0]}
              {log.user?.lastName?.[0]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-4">
              <div className="flex items-start gap-2 flex-wrap">
                <span className="text-sm font-bold text-secondaryGray-900 dark:text-white">
                  {log.user?.firstName} {log.user?.lastName}
                </span>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${ACTION_COLORS[log.action] || "bg-secondaryGray-600"}`}
                  />
                  <span className="text-sm text-secondaryGray-600 font-normal">{log.action}</span>
                </div>
                {log.targetTitle && (
                  <span className="text-sm font-medium text-secondaryGray-900 dark:text-white truncate">
                    &ldquo;{log.targetTitle}&rdquo;
                  </span>
                )}
              </div>
              <p className="text-[10px] text-secondaryGray-600 font-normal mt-1">
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}

        {activity.length === 0 && (
          <p className="text-sm text-secondaryGray-600 font-normal text-center py-8">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
}
