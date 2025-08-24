import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json();
    const { id } = params;

    if (!["accepted", "declined"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const match = await prisma.match.update({
      where: { id },
      data: { 
        status: status.toUpperCase() as "ACCEPTED" | "DECLINED"
      },
      include: {
        requester: {
          include: { user: true }
        },
        receiver: {
          include: { user: true }
        }
      }
    });

    return NextResponse.json(match);
  } catch (error) {
    console.error("Error updating match:", error);
    return NextResponse.json({ message: "Failed to update match" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Check if the match exists and get current user from session
    const sessionId = request.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];

    if (!sessionId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        requester: { include: { user: true } },
        receiver: { include: { user: true } }
      }
    });

    if (!match) {
      return NextResponse.json({ message: "Match not found" }, { status: 404 });
    }

    // Only allow the requester or receiver to delete the match
    // Check against the user IDs since sessionId is a User ID, but match uses Preference IDs
    if (match.requester.userId !== sessionId && match.receiver.userId !== sessionId) {
      return NextResponse.json({ message: "Not authorized to delete this match" }, { status: 403 });
    }

    await prisma.match.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Match deleted successfully" });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json({ message: "Failed to delete match" }, { status: 500 });
  }
}
