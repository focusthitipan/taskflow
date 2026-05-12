"use client";

import { useState, useEffect, useRef } from "react";
import { Download, CalendarDays, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { DailyChart } from "@/components/graph/daily-chart";
import type { GraphDataPoint } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";

export default function GraphPage() {
  const [data, setData] = useState<GraphDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [zoom, setZoom] = useState(100);
  const [exporting, setExporting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const fetchData = async (date: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/graph/daily?date=${date}`);
      const json = await res.json();
      setData(json.data);
    } catch {
      toast.error("Failed to load graph data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      const element = chartRef.current;
      if (!element) return;

      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`daily-graph-${selectedDate}.pdf`);
      toast.success("PDF exported successfully");
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  const filteredData = zoom < 100
    ? data.filter((_, i) => i < Math.ceil(data.length * (zoom / 100)))
    : data;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              label: "Avg Productivity",
              value: `${Math.round(data.reduce((a, d) => a + d.productivity, 0) / data.length)}%`,
              color: "text-green-500",
            },
            {
              label: "Avg Energy",
              value: `${Math.round(data.reduce((a, d) => a + d.energy, 0) / data.length)}`,
              color: "text-orange-500",
            },
            {
              label: "Avg Focus",
              value: `${(data.reduce((a, d) => a + d.focus, 0) / data.length).toFixed(1)}/10`,
              color: "text-blue-500",
            },
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
      )}

      {/* Chart card */}
      <div className="bg-white dark:bg-navy-800 rounded-[20px] p-5 card-shadow">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-secondaryGray-900 dark:text-white">
              Daily Performance
            </h3>
            <p className="text-xs text-secondaryGray-600 font-normal mt-0.5">
              3-axis tracking: Productivity · Energy · Focus
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Date picker */}
            <div className="flex items-center gap-2 h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700">
              <CalendarDays className="w-4 h-4 text-secondaryGray-600 flex-shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-medium text-secondaryGray-900 dark:text-white"
              />
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-2 h-[44px] px-4 rounded-2xl border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700">
              <button
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="text-secondaryGray-700 dark:text-white hover:text-brand-500 transition-colors duration-150"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-secondaryGray-900 dark:text-white w-10 text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(100, zoom + 25))}
                className="text-secondaryGray-700 dark:text-white hover:text-brand-500 transition-colors duration-150"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Reset zoom */}
            {zoom !== 100 && (
              <button
                onClick={() => setZoom(100)}
                className="h-[44px] w-[44px] rounded-full flex items-center justify-center border border-secondaryGray-100 dark:border-white/10 bg-secondaryGray-300 dark:bg-navy-700 text-secondaryGray-700 dark:text-white hover:text-brand-500 transition-colors duration-150"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {/* Export PDF */}
            <button
              onClick={handleExport}
              disabled={exporting || loading}
              className="flex items-center gap-2 h-[44px] px-5 rounded-full text-sm font-bold text-white gradient-brand transition-all duration-250 ease disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              {exporting ? "Exporting..." : "Export PDF"}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-4">
          {[
            { label: "Productivity (0–100%)", color: "#01B574" },
            { label: "Energy (–100 to 100)", color: "#FFB547" },
            { label: "Focus (0–10)", color: "#3965FF" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-secondaryGray-600 font-normal">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div ref={chartRef}>
          {loading ? (
            <div className="h-[420px] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : (
            <DailyChart data={filteredData} id="daily-chart" />
          )}
        </div>
      </div>

      {/* Data table */}
      {!loading && data.length > 0 && (
        <div className="bg-white dark:bg-navy-800 rounded-[20px] p-5 card-shadow overflow-x-auto custom-scrollbar">
          <h3 className="text-base sm:text-lg font-bold text-secondaryGray-900 dark:text-white mb-4">
            Hourly Data
          </h3>
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-secondaryGray-100 dark:border-white/10">
                <th className="text-left pb-3 text-xs text-secondaryGray-600 font-normal uppercase">
                  Hour
                </th>
                <th className="text-right pb-3 text-xs text-green-500 font-normal uppercase">
                  Productivity
                </th>
                <th className="text-right pb-3 text-xs text-orange-500 font-normal uppercase">
                  Energy
                </th>
                <th className="text-right pb-3 text-xs text-blue-500 font-normal uppercase">
                  Focus
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((point) => (
                <tr
                  key={point.hour}
                  className="border-b border-secondaryGray-100/50 dark:border-white/5 last:border-0"
                >
                  <td className="py-2.5 text-sm font-bold text-secondaryGray-900 dark:text-white">
                    {point.hour}
                  </td>
                  <td className="py-2.5 text-right text-sm font-bold text-green-500">
                    {point.productivity}%
                  </td>
                  <td className="py-2.5 text-right text-sm font-bold text-orange-500">
                    {point.energy > 0 ? `+${point.energy}` : point.energy}
                  </td>
                  <td className="py-2.5 text-right text-sm font-bold text-blue-500">
                    {point.focus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
