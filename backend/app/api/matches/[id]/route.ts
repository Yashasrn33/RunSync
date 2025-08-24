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
