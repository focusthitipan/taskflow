import { db } from "@/lib/db";

type NotifPrefKey = "notifTaskAssigned" | "notifTaskDue" | "notifCommentMention" | "notifTeamActivity";

interface NotifPayload {
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
}

async function getEnabledUserIds(userIds: string[], prefKey: NotifPrefKey): Promise<string[]> {
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
  });

  return users
    .filter((u) => u[prefKey] === true)
    .map((u) => u.id);
}

export async function notifyUsers(
  userIds: string[],
  prefKey: NotifPrefKey,
  payload: NotifPayload
) {
  if (userIds.length === 0) return;

  const allowedIds = await getEnabledUserIds(userIds, prefKey);
  if (allowedIds.length === 0) return;

  await db.notification.createMany({
    data: allowedIds.map((userId) => ({
      userId,
      title: payload.title,
      message: payload.message,
      type: payload.type || "info",
    })),
  });
}

export async function notifyOne(
  userId: string,
  payload: NotifPayload,
  prefKey?: NotifPrefKey
) {
  // If a preference key is given, respect the user's notification setting
  if (prefKey) {
    const allowedIds = await getEnabledUserIds([userId], prefKey);
    if (allowedIds.length === 0) return;
  }

  await db.notification.create({
    data: {
      userId,
      title: payload.title,
      message: payload.message,
      type: payload.type || "info",
    },
  });
}
