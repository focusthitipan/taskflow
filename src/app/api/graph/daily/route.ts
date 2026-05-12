import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateGraphData } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

  try {
    // Try fetching from DB first
    const dbData = await db.graphData.findMany({
      where: { date },
      orderBy: { hour: "asc" },
    });

    if (dbData.length > 0) {
      const data = dbData.map((d) => ({
        hour: d.hour,
        productivity: d.productivity,
        energy: d.energy,
        focus: d.focus,
      }));
      return NextResponse.json({ data, date });
    }

    // Generate + save if not in DB
    const generated = generateGraphData(date);

    await db.graphData.createMany({
      data: generated.map((d) => ({ date, ...d })),
      skipDuplicates: true,
    });

    return NextResponse.json({ data: generated, date });
  } catch (error) {
    console.error("GET /api/graph/daily error:", error);
    // Fallback to mock data
    const data = generateGraphData(date);
    return NextResponse.json({ data, date });
  }
}
