import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Get session cookie to identify current user
    const sessionId = request.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];

    if (!sessionId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: sessionId },
      include: { preferences: true }
    });
    
    if (!currentUser?.preferences) {
      return NextResponse.json([]);
    }

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { requesterId: currentUser.preferences.id },
          { receiverId: currentUser.preferences.id }
        ]
      },
      include: {
        requester: {
          include: { user: true }
        },
        receiver: {
          include: { user: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({ message: "Failed to fetch matches" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { receiverId } = await request.json();
    
    // Get session cookie to identify current user
    const sessionId = request.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];

    if (!sessionId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: sessionId },
      include: { preferences: true }
    });
    
    if (!currentUser?.preferences) {
      return NextResponse.json({ message: "User profile not found" }, { status: 404 });
    }

    if (!receiverId) {
      return NextResponse.json({ message: "Receiver ID is required" }, { status: 400 });
    }

    // Check if match already exists
    const existingMatch = await prisma.match.findFirst({
      where: {
        OR: [
          { requesterId: currentUser.preferences.id, receiverId },
          { requesterId: receiverId, receiverId: currentUser.preferences.id }
        ]
      }
    });

    if (existingMatch) {
      return NextResponse.json({ message: "Match already exists" }, { status: 400 });
    }

    const match = await prisma.match.create({
      data: {
        requesterId: currentUser.preferences.id,
        receiverId,
        status: "PENDING"
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
    console.error("Error creating match:", error);
    return NextResponse.json({ message: "Failed to create match" }, { status: 500 });
  }
}
