import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radiusKm = searchParams.get('radiusKm');

    // For now, return all runs. In production, you'd filter by location
    const runs = await prisma.run.findMany({
      include: {
        host: true,
        participants: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        startAt: 'asc'
      }
    });

    // Function to get location name from coordinates (simplified)
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
      
      // Find closest location (simplified distance calculation)
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

    const formattedRuns = runs.map(run => {
      const locationName = getLocationName(run.lat, run.lng);
      const runTitles = [
        `${locationName} Morning Run`,
        `${locationName} Evening Session`,
        `${locationName} Community Run`,
        `${locationName} Training`,
        `${locationName} Loop`,
        `${locationName} Social Run`
      ];
      
      const randomTitle = runTitles[Math.floor(Math.random() * runTitles.length)];
      
      return {
        id: run.id,
        title: randomTitle,
        description: `Join us for a ${run.paceTarget ? `${run.paceTarget.toFixed(1)} min/mile` : 'social'} run at ${locationName}`,
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
        coordinates: { lat: run.lat, lng: run.lng }
      };
    });

    return NextResponse.json(formattedRuns);
  } catch (error) {
    console.error("Error fetching runs:", error);
    return NextResponse.json({ message: "Failed to fetch runs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // TEMP: Using first user as host, replace with actual auth later
    const user = await prisma.user.findFirst();
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Create a date-time from the provided date and time
    const runDateTime = new Date(`${data.date}T${data.time}`);

    const run = await prisma.run.create({
      data: {
        hostId: user.id,
        startAt: runDateTime,
        lat: 0, // You'd parse location to get coordinates
        lng: 0,
        paceTarget: data.pace ? parseFloat(data.pace.split('-')[0]) : null,
        maxPeople: parseInt(data.maxParticipants) || 10
      },
      include: {
        host: true,
        participants: true
      }
    });

    return NextResponse.json({ 
      message: "Run created successfully",
      run: {
        id: run.id,
        title: data.title,
        date: data.date,
        time: data.time,
        location: data.location,
        hostName: `${run.host.firstName || ''} ${run.host.lastName || ''}`.trim()
      }
    });
  } catch (error) {
    console.error("Error creating run:", error);
    return NextResponse.json({ message: "Failed to create run" }, { status: 500 });
  }
}