import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;
  try {
    await db.comment.delete({
      where: { id: commentId, taskId: id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks/:id/comments/:commentId error:", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}
