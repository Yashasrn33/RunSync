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

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      include: { preferences: true }
    });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.preferences) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 });
    }

    const profile = {
      ...user.preferences,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl
      }
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ message: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Get session cookie to identify current user
    const sessionId = request.headers.get('cookie')?.split(';')
      .find(c => c.trim().startsWith('session='))
      ?.split('=')[1];

    if (!sessionId) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId }
    });
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const existingProfile = await prisma.preference.findUnique({
      where: { userId: user.id }
    });

    // Update user's profile image if provided
    if (data.profileImageUrl !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          profileImageUrl: data.profileImageUrl || null 
        }
      });
    }

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.preference.update({
        where: { userId: user.id },
        data: {
          name: data.name,
          goal: data.goal,
          socialUrl: data.socialUrl || null,
          paceMin: data.paceMin,
          paceMax: data.paceMax,
          address: data.address,
          city: data.city || "",
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          radius: data.radius,
          schedule: data.schedule,
          isComplete: true,
        },
        include: { user: true }
      });
    } else {
      // Create new profile
      profile = await prisma.preference.create({
        data: {
          userId: user.id,
          name: data.name,
          goal: data.goal,
          socialUrl: data.socialUrl || null,
          paceMin: data.paceMin,
          paceMax: data.paceMax,
          address: data.address,
          city: data.city || "",
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          radius: data.radius,
          schedule: data.schedule,
          isComplete: true,
        },
        include: { user: true }
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
  }
}