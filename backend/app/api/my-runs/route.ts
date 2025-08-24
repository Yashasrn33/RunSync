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
      where: { id: sessionId }
    });

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get runs hosted by the user
    const hostedRuns = await prisma.run.findMany({
      where: { hostId: currentUser.id },
      include: {
        host: true,
        participants: {
          include: {
            user: true
          }
        }
      },
      orderBy: { startAt: 'asc' }
    });

    // Get runs the user has joined
    const joinedRunsData = await prisma.runParticipant.findMany({
      where: { 
        userId: currentUser.id,
        status: 'ACCEPTED'
      },
      include: {
        run: {
          include: {
            host: true,
            participants: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    const joinedRuns = joinedRunsData.map(p => p.run);

    // Function to get location name from coordinates (same as runs API)
    const getLocationName = (lat: number, lng: number) => {
      const locations = [
        { name: "Boston Common", lat: 42.3555, lng: -71.0640 },
        { name: "Cambridge Common", lat: 42.3751, lng: -71.1193 },
        { name: "Harvard Square", lat: 42.3736, lng: -71.1190 },
        { name: "MIT Campus", lat: 42.3590, lng: -71.0935 },
        { name: "Charles River Esplanade", lat: 42.3562, lng: -71.0805 },
        { name: "Fenway Park Area", lat: 42.3467, lng: -71.0972 },
        { name: "North End", lat: 42.3647, lng: -71.0542 },
        { name: "Back Bay", lat: 42.3505, lng: -71.0763 },
        { name: "South End", lat: 42.3396, lng: -71.0675 },
        { name: "Beacon Hill", lat: 42.3588, lng: -71.0707 },
        { name: "Jamaica Plain", lat: 42.3098, lng: -71.1203 },
        { name: "Somerville Center", lat: 42.3875, lng: -71.0994 },
        { name: "Fresh Pond", lat: 42.3888, lng: -71.1475 },
        { name: "Brookline Village", lat: 42.3324, lng: -71.1205 },
        { name: "Watertown Square", lat: 42.3648, lng: -71.1825 }
      ];
      
      let closest = locations[0];
      let minDistance = Math.abs(lat - closest.lat) + Math.abs(lng - closest.lng);
      
      for (const loc of locations) {
        const distance = Math.abs(lat - loc.lat) + Math.abs(lng - loc.lng);
        if (distance < minDistance) {
          minDistance = distance;
          closest = loc;
        }
      }
      
      return closest.name;
    };

    // Format the response
    const formatRun = (run: any, isHost: boolean) => {
      const locationName = getLocationName(run.lat, run.lng);
      
      return {
        id: run.id,
        title: isHost ? `My ${locationName} Run` : `${locationName} Run with ${run.host.firstName || 'Runner'}`,
        description: `${run.paceTarget ? `${run.paceTarget.toFixed(1)} min/mile` : 'Social'} run at ${locationName}`,
        date: run.startAt.toISOString().split('T')[0],
        time: run.startAt.toTimeString().slice(0, 5),
        location: locationName,
        distance: Math.round((3 + Math.random() * 7) * 10) / 10, // 3-10 miles
        pace: run.paceTarget ? `${run.paceTarget.toFixed(1)}-${(run.paceTarget + 0.5).toFixed(1)}` : '8:00-9:00',
        maxParticipants: run.maxPeople,
        currentParticipants: run.participants.length,
        hostName: `${run.host.firstName || ''} ${run.host.lastName || ''}`.trim(),
        difficulty: run.paceTarget && run.paceTarget < 7.5 ? 'Hard' : 
                   run.paceTarget && run.paceTarget > 9.5 ? 'Easy' : 'Moderate',
        isHost,
        status: isHost ? 'scheduled' as const : 'joined' as const,
        coordinates: { lat: run.lat, lng: run.lng }
      };
    };

    const myRuns = [
      ...hostedRuns.map(run => formatRun(run, true)),
      ...joinedRuns.map(run => formatRun(run, false))
    ];

    return NextResponse.json(myRuns);
  } catch (error) {
    console.error("Error fetching my runs:", error);
    return NextResponse.json({ message: "Failed to fetch my runs" }, { status: 500 });
  }
}
