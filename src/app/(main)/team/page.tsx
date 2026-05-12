"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MemberCard } from "@/components/team/member-card";
import { WorkloadOverview } from "@/components/team/workload-overview";
import { ActivityFeed } from "@/components/team/activity-feed";
import { useT } from "@/components/layout/i18n-provider";
import type { TeamMember, ActivityLog } from "@/types";

export default function TeamPage() {
  const { t } = useT();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/team/members").then((r) => r.json()),
      fetch("/api/team/activity").then((r) => r.json()),
    ])
      .then(([membersData, activityData]) => {
        setMembers(membersData.members);
        setActivity(activityData.activity);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = members.map((m) => ({
    name: m.firstName,
    total: m.taskCount,
    completed: m.completedTaskCount,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  const onlineCount = members.filter((m) => m.isOnline).length;
  const totalTasks = members.reduce((acc, m) => acc + m.taskCount, 0);
  const totalCompleted = members.reduce((acc, m) => acc + m.completedTaskCount, 0);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: t.team.teamMembers, value: members.length, color: "text-brand-500" },
          { label: t.team.onlineNow, value: onlineCount, color: "text-green-500" },
          { label: t.team.totalTasks, value: totalTasks, color: "text-secondaryGray-900 dark:text-white" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-navy-800 rounded-[20px] p-5 card-shadow"
          >
            <p className="text-sm text-secondaryGray-600 font-normal">{stat.label}</p>
            <p className={`text-[24px] sm:text-[34px] font-bold leading-none mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Member cards */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-secondaryGray-900 dark:text-white mb-4">
          {t.team.teamMembers}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>

      {/* Workload + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <WorkloadOverview members={members} />
        <ActivityFeed activity={activity} />
      </div>

      {/* Team Performance Chart */}
      <div className="bg-white dark:bg-navy-800 rounded-[20px] p-5 card-shadow">
        <h3 className="text-lg sm:text-xl font-bold text-secondaryGray-900 dark:text-white mb-5">
          {t.team.taskDistribution}
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(163,174,208,0.2)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "#A3AED0", fontSize: 12, fontFamily: "DM Sans" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#A3AED0", fontSize: 12, fontFamily: "DM Sans" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111c44",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontFamily: "DM Sans",
                fontSize: 12,
              }}
            />
            <Bar dataKey="total" fill="#A3AED0" name={t.team.totalTasksLabel} radius={[8, 8, 0, 0]} />
            <Bar dataKey="completed" fill="#422AFB" name={t.team.completedLabel} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondaryGray-600" />
            <span className="text-xs text-secondaryGray-600 font-normal">{t.team.totalTasksLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-500" />
            <span className="text-xs text-secondaryGray-600 font-normal">{t.team.completedLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
