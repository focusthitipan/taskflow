import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  const role = (session.user as { role?: string }).role;

  try {
    const comment = await db.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Only admin or the comment author can delete
    if (role !== "admin" && comment.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.comment.delete({ where: { id: commentId, taskId: id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks/:id/comments/:commentId error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
