import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    // Check if run exists
    const run = await prisma.run.findUnique({
      where: { id }
    });

    if (!run) {
      return NextResponse.json({ message: "Run not found" }, { status: 404 });
    }

    // Find and remove the participant
    const participant = await prisma.runParticipant.findUnique({
      where: {
        runId_userId: {
          runId: id,
          userId: currentUser.id
        }
      }
    });

    if (!participant) {
      return NextResponse.json({ message: "You are not a participant in this run" }, { status: 400 });
    }

    // Remove participant
    await prisma.runParticipant.delete({
      where: {
        runId_userId: {
          runId: id,
          userId: currentUser.id
        }
      }
    });

    return NextResponse.json({ 
      message: "Successfully left the run"
    });
  } catch (error) {
    console.error("Error leaving run:", error);
    return NextResponse.json({ message: "Failed to leave run" }, { status: 500 });
  }
}
