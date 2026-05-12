import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Store notification preferences in a simple in-memory store
// In production, this would be in the database
const prefsStore = new Map<string, Record<string, boolean>>();

const DEFAULT_PREFS = {
  taskAssigned: true,
  taskDue: true,
  commentMention: true,
  teamActivity: false,
};

function getPrefs(userId: string) {
  if (!prefsStore.has(userId)) {
    prefsStore.set(userId, { ...DEFAULT_PREFS });
  }
  return prefsStore.get(userId)!;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    return NextResponse.json({ preferences: getPrefs(userId) });
  } catch (error) {
    console.error("GET /api/settings/notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notification preferences" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const body = await request.json();
    prefsStore.set(userId, { ...DEFAULT_PREFS, ...body });
    return NextResponse.json({ preferences: getPrefs(userId) });
  } catch (error) {
    console.error("PUT /api/settings/notifications error:", error);
    return NextResponse.json({ error: "Failed to update notification preferences" }, { status: 500 });
  }
}
