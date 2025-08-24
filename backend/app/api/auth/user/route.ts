import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Check for session cookie
    const sessionId = request.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];

    if (!sessionId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    // Find user by session ID (in production, you'd use proper session storage)
    const user = await prisma.user.findUnique({
      where: { id: sessionId }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl
    });
  } catch (error) {
    console.error("Error checking authentication:", error);
    return NextResponse.json({ message: "Authentication failed" }, { status: 401 });
  }
}
