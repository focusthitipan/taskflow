import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    // Build per-hour data
    const rows: Array<{
      hour: string;
      productivity: number;
      energy: number;
      focus: number;
    }> = [];

    // Business hours: 8-18 (indices 8-17)
    const businessHours = 10; // 8..17 = 10 hours

    for (let h = 1; h <= 24; h++) {
      const hourLabel = `${String(h).padStart(2, "0")}:00`;
      const hourIndex = h - 1;

      // ── Productivity (0–100) ──
      // Distribute done tasks across business hours with a productivity curve
      let productivity = 0;
      if (doneCount > 0 && h >= 9 && h <= 18) {
        // Productivity curve: ramp up 9→11, dip 12→13, ramp 14→16, fall 17→18
        const t = h - 9; // 0..9 within business hours
        let curve: number;
        if (t <= 2) curve = 0.4 + t * 0.3;       // 9-11: 0.4→1.0
        else if (t <= 4) curve = 1.0 - (t - 2) * 0.35; // 12-13: 1.0→0.3
        else if (t <= 7) curve = 0.3 + (t - 4) * 0.23; // 14-16: 0.3→1.0
        else curve = 1.0 - (t - 7) * 0.5;              // 17-18: 1.0→0.5

        curve = Math.max(0, curve);
        productivity = Math.round((doneCount / Math.min(10, businessHours)) * 15 * curve);
      }
      // Small base for non-business hours
      if (h < 7 || h > 20) productivity = Math.max(0, productivity - 10);

      // ── Energy (-100 to 100) ──
        // Activity count per hour, normalized — only if there is real activity
        let energy = 0;
        const actCount = activityPerHour[hourIndex];
        if (totalActivity > 0) {
          energy = Math.round((actCount / Math.max(1, Math.ceil(totalActivity / 10))) * 40 - 20);
          // Time-of-day modulation only when there's real activity
          if (h <= 6) energy -= 40;
          else if (h <= 8) energy += 10;
          else if (h <= 11) energy += 20;
          else if (h <= 17) energy += 10;
          else if (h <= 20) energy -= 5;
          else energy -= 35;
        }

      // ── Focus (0–10) ──
      // Active tasks, distributed across business hours
      let focus = 0;
      if (activeCount > 0 && h >= 8 && h <= 18) {
        const t2 = h - 8; // 0..10
        let focusCurve: number;
        if (t2 <= 3) focusCurve = 0.3 + t2 * 0.23;        // 8-11: ramp up
        else if (t2 <= 5) focusCurve = 1.0 - (t2 - 3) * 0.25; // 12-13: dip
        else if (t2 <= 8) focusCurve = 0.5 + (t2 - 5) * 0.17; // 14-17: ramp up
        else focusCurve = 1.0 - (t2 - 8) * 0.5;            // 18: fall

        focusCurve = Math.max(0, focusCurve);
        focus = Math.round((activeCount / Math.min(10, businessHours)) * 2.5 * focusCurve * 10) / 10;
      }

      rows.push({
        hour: hourLabel,
        productivity: Math.min(100, Math.max(0, productivity)),
        energy: Math.min(100, Math.max(-100, energy)),
        focus: Math.min(10, Math.max(0, focus)),
      });
    }

    // Normalize productivity to max=100 for the day
    const maxProd = rows.reduce((m, r) => Math.max(m, r.productivity), 0);
    if (maxProd > 0 && maxProd < 100) {
      for (const r of rows) {
        r.productivity = Math.round((r.productivity / maxProd) * 100);
      }
    }

    // Normalize focus to max=10 for the day
    const maxFocus = rows.reduce((m, r) => Math.max(m, r.focus), 0);
    if (maxFocus > 0 && maxFocus < 10) {
      for (const r of rows) {
        r.focus = Math.round((r.focus / maxFocus) * 10 * 10) / 10;
      }
    }

    return NextResponse.json({ data: rows, date, source: "live" });
  } catch (error) {
    console.error("GET /api/graph/daily error:", error);
    return NextResponse.json({ data: [], date });
  }
}
