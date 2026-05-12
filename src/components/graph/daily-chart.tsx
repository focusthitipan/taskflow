"use client";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { GraphDataPoint } from "@/types";

interface DailyChartProps {
  data: GraphDataPoint[];
  id?: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-navy-800 rounded-[10px] p-3 shadow-card-shadow">
      <p className="text-xs font-bold text-white mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-secondaryGray-600">{entry.name}:</span>
          <span className="text-xs font-bold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function DailyChart({ data, id }: DailyChartProps) {
  return (
    <div id={id} className="w-full h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(163,174,208,0.15)"
            vertical={false}
          />
          <XAxis
            dataKey="hour"
            tick={{ fill: "#A3AED0", fontSize: 11, fontFamily: "DM Sans" }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          {/* Left axis: Productivity (0-100) */}
          <YAxis
            yAxisId="productivity"
            orientation="left"
            domain={[0, 100]}
            tick={{ fill: "#01B574", fontSize: 11, fontFamily: "DM Sans" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />
          {/* Right axis: Energy (-100 to 100) */}
          <YAxis
            yAxisId="energy"
            orientation="right"
            domain={[-100, 100]}
            tick={{ fill: "#FFB547", fontSize: 11, fontFamily: "DM Sans" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          {/* Second right axis: Focus (0-10) */}
          <YAxis
            yAxisId="focus"
            orientation="right"
            domain={[0, 10]}
            tick={{ fill: "#3965FF", fontSize: 11, fontFamily: "DM Sans" }}
            axisLine={false}
            tickLine={false}
            width={30}
            dx={35}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontFamily: "DM Sans", fontSize: 12, color: "#A3AED0" }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            yAxisId="productivity"
            type="monotone"
            dataKey="productivity"
            name="Productivity (0-100)"
            stroke="#01B574"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#01B574" }}
          />
          <Line
            yAxisId="energy"
            type="monotone"
            dataKey="energy"
            name="Energy (-100 to 100)"
            stroke="#FFB547"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#FFB547" }}
          />
          <Line
            yAxisId="focus"
            type="monotone"
            dataKey="focus"
            name="Focus (0-10)"
            stroke="#3965FF"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#3965FF" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
