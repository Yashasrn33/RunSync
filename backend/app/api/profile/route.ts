import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // TEMP: Using first user, replace with actual auth later
    const user = await prisma.user.findFirst({
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
    
    // TEMP: Using first user, replace with actual auth later
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const existingProfile = await prisma.preference.findUnique({
      where: { userId: user.id }
    });

    let profile;
    if (existingProfile) {
      profile = await prisma.preference.update({
        where: { userId: user.id },
        data: {
          name: data.name,
          goal: data.goal,
          instagram: data.instagram,
          strava: data.strava,
          paceMin: data.paceMin,
          paceMax: data.paceMax,
          location: data.location,
          radius: data.radius,
          schedule: data.schedule,
          isComplete: true
        },
        include: {
          user: true
        }
      });
    } else {
      profile = await prisma.preference.create({
        data: {
          userId: user.id,
          name: data.name,
          goal: data.goal,
          instagram: data.instagram,
          strava: data.strava,
          paceMin: data.paceMin,
          paceMax: data.paceMax,
          location: data.location,
          radius: data.radius,
          schedule: data.schedule,
          isComplete: true
        },
        include: {
          user: true
        }
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json({ message: "Failed to save profile" }, { status: 500 });
  }
}
