"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MemberCard } from "@/components/team/member-card";
import { WorkloadOverview } from "@/components/team/workload-overview";
import { ActivityFeed } from "@/components/team/activity-feed";
import type { TeamMember, ActivityLog } from "@/types";

export default function TeamPage() {
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
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Team Members", value: members.length, color: "text-brand-500" },
          { label: "Online Now", value: onlineCount, color: "text-green-500" },
          { label: "Total Tasks", value: totalTasks, color: "text-secondaryGray-900 dark:text-white" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-navy-800 rounded-[20px] p-5 card-shadow"
          >
            <p className="text-sm text-secondaryGray-600 font-normal">{stat.label}</p>
            <p className={`text-[34px] font-bold leading-none mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Member cards */}
      <div>
        <h2 className="text-2xl font-bold text-secondaryGray-900 dark:text-white mb-4">
          Team Members
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
        <h3 className="text-xl font-bold text-secondaryGray-900 dark:text-white mb-5">
          Task Distribution
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
            <Bar dataKey="total" fill="#A3AED0" name="Total Tasks" radius={[8, 8, 0, 0]} />
            <Bar dataKey="completed" fill="#422AFB" name="Completed" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondaryGray-600" />
            <span className="text-xs text-secondaryGray-600 font-normal">Total Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-brand-500" />
            <span className="text-xs text-secondaryGray-600 font-normal">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
