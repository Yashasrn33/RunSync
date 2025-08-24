import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // Get session cookie to identify current user
    const sessionId = request.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];

    if (!sessionId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: sessionId }
    });

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if run exists and user is the host
    const run = await prisma.run.findUnique({
      where: { id }
    });

    if (!run) {
      return NextResponse.json({ message: "Run not found" }, { status: 404 });
    }

    if (run.hostId !== currentUser.id) {
      return NextResponse.json({ message: "Not authorized to delete this run" }, { status: 403 });
    }

    // Delete all participants first
    await prisma.runParticipant.deleteMany({
      where: { runId: id }
    });

    // Delete the run
    await prisma.run.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Run deleted successfully" });
  } catch (error) {
    console.error("Error deleting run:", error);
    return NextResponse.json({ message: "Failed to delete run" }, { status: 500 });
  }
}
