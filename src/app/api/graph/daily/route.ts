import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function calculateProductivity(h: number, doneCount: number, businessHours: number): number {
  if (doneCount === 0 || h < 9 || h > 18) {
    return 0;
  }
  const t = h - 9;
  let curve: number;
  if (t <= 2) { curve = 0.4 + t * 0.3; }
  else if (t <= 4) { curve = 1 - (t - 2) * 0.35; }
  else if (t <= 7) { curve = 0.3 + (t - 4) * 0.23; }
  else { curve = 1 - (t - 7) * 0.5; }
  return Math.round((doneCount / Math.min(10, businessHours)) * 15 * Math.max(0, curve));
}

function calculateEnergy(h: number, actCount: number, totalActivity: number): number {
  if (totalActivity === 0) return 0;
  let energy = Math.round((actCount / Math.max(1, Math.ceil(totalActivity / 10))) * 40 - 20);
  if (h <= 6) energy -= 40;
  else if (h <= 8) energy += 10;
  else if (h <= 11) energy += 20;
  else if (h <= 17) energy += 10;
  else if (h <= 20) energy -= 5;
  else energy -= 35;
  return energy;
}

function calculateFocus(h: number, activeCount: number, businessHours: number): number {
  if (activeCount === 0 || h < 8 || h > 18) return 0;
  const t2 = h - 8;
  let focusCurve: number;
  if (t2 <= 3) { focusCurve = 0.3 + t2 * 0.23; }
  else if (t2 <= 5) { focusCurve = 1 - (t2 - 3) * 0.25; }
  else if (t2 <= 8) { focusCurve = 0.5 + (t2 - 5) * 0.17; }
  else { focusCurve = 1 - (t2 - 8) * 0.5; }
  return Math.round((activeCount / Math.min(10, businessHours)) * 2.5 * Math.max(0, focusCurve) * 10) / 10;
}

function normalizeRows(rows: Array<{ hour: string; productivity: number; energy: number; focus: number }>) {
  const maxProd = rows.reduce((m, r) => Math.max(m, r.productivity), 0);
  if (maxProd > 0 && maxProd < 100) {
    for (const r of rows) r.productivity = Math.round((r.productivity / maxProd) * 100);
  }
  const maxFocus = rows.reduce((m, r) => Math.max(m, r.focus), 0);
  if (maxFocus > 0 && maxFocus < 10) {
    for (const r of rows) r.focus = Math.round((r.focus / maxFocus) * 10 * 10) / 10;
  }
}

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  try {
    // Always calculate fresh from real data — no caching
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    // Fetch all relevant data in parallel
    const [activityLogs, comments, doneTasks, activeTasks] = await Promise.all([
      db.activityLog.findMany({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      }),
      db.comment.findMany({
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      }),
      db.task.findMany({
        where: {
          status: "done",
          updatedAt: { gte: dayStart, lte: dayEnd },
        },
      }),
      db.task.findMany({
        where: {
          progress: { gt: 0 },
          updatedAt: { gte: dayStart, lte: dayEnd },
        },
      }),
    ]);

    // Count activity per hour (0-23)
    const activityPerHour = new Array(24).fill(0);
    for (const log of activityLogs) {
      const h = log.createdAt.getUTCHours();
      activityPerHour[h] += 1;
    }
    for (const c of comments) {
      const h = c.createdAt.getUTCHours();
      activityPerHour[h] += 1;
    }

    const totalActivity = activityLogs.length + comments.length;
    const doneCount = doneTasks.length;
    const activeCount = activeTasks.length;

    const businessHours = 10;
    const rows = Array.from({ length: 24 }, (_, i) => {
      const h = i + 1;
      return {
        hour: `${String(h).padStart(2, "0")}:00`,
        productivity: Math.min(100, Math.max(0, calculateProductivity(h, doneCount, businessHours))),
        energy: Math.min(100, Math.max(-100, calculateEnergy(h, activityPerHour[i], totalActivity))),
        focus: Math.min(10, Math.max(0, calculateFocus(h, activeCount, businessHours))),
      };
    });

    normalizeRows(rows);

    return NextResponse.json({ data: rows, date, source: "live" });
  } catch (error) {
    console.error("GET /api/graph/daily error:", error);
    return NextResponse.json({ data: [], date });
  }
}
