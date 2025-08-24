import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // TEMP: Using first user, replace with actual auth later
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if run exists
    const run = await prisma.run.findUnique({
      where: { id },
      include: { participants: true }
    });

    if (!run) {
      return NextResponse.json({ message: "Run not found" }, { status: 404 });
    }

    // Check if user already joined
    const existingParticipant = await prisma.runParticipant.findUnique({
      where: {
        runId_userId: {
          runId: id,
          userId: user.id
        }
      }
    });

    if (existingParticipant) {
      return NextResponse.json({ message: "Already joined this run" }, { status: 400 });
    }

    // Check if run is full
    if (run.participants.length >= run.maxPeople) {
      return NextResponse.json({ message: "Run is full" }, { status: 400 });
    }

    // Add participant
    const participant = await prisma.runParticipant.create({
      data: {
        runId: id,
        userId: user.id,
        status: "ACCEPTED"
      }
    });

    return NextResponse.json({ 
      message: "Successfully joined the run",
      participant 
    });
  } catch (error) {
    console.error("Error joining run:", error);
    return NextResponse.json({ message: "Failed to join run" }, { status: 500 });
  }
}
