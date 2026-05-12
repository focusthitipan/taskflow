"use client";

import { useT } from "@/components/layout/i18n-provider";
import type { TeamMember } from "@/types";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  readonly member: TeamMember;
}

export function MemberCard({ member }: MemberCardProps) {
  const { t } = useT();

  const ROLE_CONFIG = {
    admin: { label: t.team.admin, bg: "bg-brand-100 dark:bg-brand-900/40", text: "text-brand-500" },
    member: { label: t.team.member, bg: "bg-secondaryGray-300 dark:bg-navy-700", text: "text-secondaryGray-700 dark:text-secondaryGray-600" },
    viewer: { label: t.team.viewer, bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-500" },
  };

  const roleConfig = ROLE_CONFIG[member.role];
  const completionRate =
    member.taskCount > 0
      ? Math.round((member.completedTaskCount / member.taskCount) * 100)
      : 0;

  return (
    <div className="bg-white dark:bg-navy-800 rounded-[20px] p-5 card-shadow">
      <div className="flex items-start justify-between mb-4">
        {/* Avatar */}
        <div className="relative">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden border-4 border-white dark:border-navy-800"
          >
            {member.avatarUrl ? (
              <img src={member.avatarUrl} alt={`${member.firstName} ${member.lastName}`} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-lg font-bold"
                style={{ backgroundColor: member.avatarColor || "#EE5D50" }}
              >
                {member.firstName[0]}
                {member.lastName[0]}
              </div>
            )}
          </div>
        </div>

        {/* Role badge */}
        <span
          className={cn(
            "text-xs font-bold px-2 py-1 rounded-[10px]",
            roleConfig.bg,
            roleConfig.text
          )}
        >
          {roleConfig.label}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-secondaryGray-900 dark:text-white leading-none mb-1">
          {member.firstName} {member.lastName}
        </h3>
        <p className="text-xs text-secondaryGray-600 font-normal">{member.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 rounded-[10px] bg-secondaryGray-300 dark:bg-navy-700">
          <p className="text-xl font-bold text-secondaryGray-900 dark:text-white leading-none">
            {member.taskCount}
          </p>
          <p className="text-[10px] text-secondaryGray-600 font-normal mt-1">{t.team.totalTasksLabel}</p>
        </div>
        <div className="text-center p-3 rounded-[10px] bg-green-100 dark:bg-green-500/20">
          <p className="text-xl font-bold text-green-500 leading-none">
            {member.completedTaskCount}
          </p>
          <p className="text-[10px] text-secondaryGray-600 font-normal mt-1">{t.team.completedLabel}</p>
        </div>
      </div>

      {/* Completion rate */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-secondaryGray-600 font-normal">{t.team.completionRate}</span>
          <span className="text-xs font-bold text-secondaryGray-900 dark:text-white">
            {completionRate}%
          </span>
        </div>
        <div className="h-2 rounded-[20px] bg-blue-50 dark:bg-white/10">
          <div
            className="h-full rounded-[20px] bg-brand-500 transition-all duration-250"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
