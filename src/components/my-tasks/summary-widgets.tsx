"use client";

import { AlertCircle, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { useT } from "@/components/layout/i18n-provider";
import type { Task } from "@/types";
import { differenceInDays, parseISO } from "date-fns";

interface SummaryWidgetsProps {
  tasks: Task[];
}

export function SummaryWidgets({ tasks }: SummaryWidgetsProps) {
  const { t } = useT();
  const now = new Date();

  const overdue = tasks.filter(
    (t) => t.dueDate && t.status !== "done" && differenceInDays(parseISO(t.dueDate), now) < 0
  ).length;

  const dueToday = tasks.filter(
    (t) => t.dueDate && t.status !== "done" && differenceInDays(parseISO(t.dueDate), now) === 0
  ).length;

  const onTrack = tasks.filter(
    (t) =>
      t.dueDate &&
      t.status !== "done" &&
      differenceInDays(parseISO(t.dueDate), now) > 0 &&
      differenceInDays(parseISO(t.dueDate), now) <= 7
  ).length;

  const completed = tasks.filter((t) => t.status === "done").length;

  const widgets = [
    {
      label: t.myTasks.overdue,
      value: overdue,
      icon: AlertCircle,
      bg: "bg-red-100 dark:bg-red-500/20",
      iconColor: "text-red-500",
      valueColor: "text-red-500",
    },
    {
      label: t.myTasks.dueToday,
      value: dueToday,
      icon: Clock,
      bg: "bg-orange-100 dark:bg-orange-500/20",
      iconColor: "text-orange-500",
      valueColor: "text-orange-500",
    },
    {
      label: t.myTasks.onTrack,
      value: onTrack,
      icon: TrendingUp,
      bg: "bg-brand-100 dark:bg-brand-900/40",
      iconColor: "text-brand-500",
      valueColor: "text-brand-500",
    },
    {
      label: t.myTasks.completed,
      value: completed,
      icon: CheckCircle2,
      bg: "bg-green-100 dark:bg-green-500/20",
      iconColor: "text-green-500",
      valueColor: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {widgets.map((w) => {
        const Icon = w.icon;
        return (
          <div
            key={w.label}
            className="bg-white dark:bg-navy-800 rounded-[20px] p-5 card-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-secondaryGray-600 font-normal">{w.label}</p>
              <div className={`w-10 h-10 rounded-full ${w.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${w.iconColor}`} />
              </div>
            </div>
            <p className={`text-[24px] sm:text-[34px] font-bold leading-none ${w.valueColor}`}>{w.value}</p>
          </div>
        );
      })}
    </div>
  );
}
