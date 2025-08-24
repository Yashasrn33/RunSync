import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Matching algorithm function
function calculateMatchScore(userProfile: any, candidateProfile: any): number {
  let score = 0;
  let weights = 0;

  // 1. Pace compatibility (30% weight)
  const paceWeight = 0.3;
  const userPaceRange = [userProfile.paceMin, userProfile.paceMax];
  const candidatePaceRange = [candidateProfile.paceMin, candidateProfile.paceMax];
  
  // Check if pace ranges overlap
  const overlapStart = Math.max(userPaceRange[0], candidatePaceRange[0]);
  const overlapEnd = Math.min(userPaceRange[1], candidatePaceRange[1]);
  
  if (overlapStart <= overlapEnd) {
    // Calculate overlap percentage
    const userRange = userPaceRange[1] - userPaceRange[0];
    const candidateRange = candidatePaceRange[1] - candidatePaceRange[0];
    const overlapSize = overlapEnd - overlapStart;
    const avgRange = (userRange + candidateRange) / 2;
    const paceScore = Math.min(1, overlapSize / Math.max(0.5, avgRange));
    
    score += paceScore * paceWeight;
  }
  weights += paceWeight;

  // 2. Goal compatibility (25% weight)
  const goalWeight = 0.25;
  if (userProfile.goal === candidateProfile.goal) {
    score += 1 * goalWeight;
  } else {
    // Partial compatibility for related goals
    const compatibleGoals = {
      "FIVE_K": ["TEN_K", "HALF_MARATHON"],
      "TEN_K": ["FIVE_K", "HALF_MARATHON"],
      "HALF_MARATHON": ["TEN_K", "MARATHON"],
      "MARATHON": ["HALF_MARATHON"]
    };
    
    if (compatibleGoals[userProfile.goal]?.includes(candidateProfile.goal)) {
      score += 0.7 * goalWeight;
    } else {
      score += 0.3 * goalWeight; // Some base compatibility
    }
  }
  weights += goalWeight;

  // 3. Schedule compatibility (25% weight)
  const scheduleWeight = 0.25;
  const userSchedule = userProfile.schedule || {};
  const candidateSchedule = candidateProfile.schedule || {};
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  let sharedTimeSlots = 0;
  let totalUserSlots = 0;
  
  days.forEach(day => {
    const userSlots = userSchedule[day] || [];
    const candidateSlots = candidateSchedule[day] || [];
    totalUserSlots += userSlots.length;
    
    userSlots.forEach(slot => {
      if (candidateSlots.includes(slot)) {
        sharedTimeSlots++;
      }
    });
  });
  
  const scheduleScore = totalUserSlots > 0 ? sharedTimeSlots / totalUserSlots : 0;
  score += scheduleScore * scheduleWeight;
  weights += scheduleWeight;

  // 4. Location proximity (20% weight) - simplified for demo
  const locationWeight = 0.2;
  // In a real app, you'd calculate actual distance using coordinates
  // For now, simple string match
  if (userProfile.location === candidateProfile.location) {
    score += 1 * locationWeight;
  } else {
    // Check if they're in the same city/state
    const userLocationParts = userProfile.location.toLowerCase().split(',');
    const candidateLocationParts = candidateProfile.location.toLowerCase().split(',');
    
    let locationScore = 0;
    if (userLocationParts.length > 1 && candidateLocationParts.length > 1) {
      // Check state/region match
      if (userLocationParts[1]?.trim() === candidateLocationParts[1]?.trim()) {
        locationScore = 0.6;
      }
      // Check city match
      if (userLocationParts[0]?.trim() === candidateLocationParts[0]?.trim()) {
        locationScore = 0.9;
      }
    }
    score += locationScore * locationWeight;
  }
  weights += locationWeight;

  return weights > 0 ? score / weights : 0;
}

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

    if (!currentUser?.preferences || !currentUser.preferences.isComplete) {
      return NextResponse.json({ message: "User profile not complete" }, { status: 400 });
    }

    // Get all existing matches to exclude them
    const existingMatches = await prisma.match.findMany({
      where: {
        OR: [
          { requesterId: currentUser.preferences.id },
          { receiverId: currentUser.preferences.id }
        ]
      }
    });

    const excludedProfileIds = existingMatches.flatMap(match => [
      match.requesterId,
      match.receiverId
    ]);

    // Get all other users with complete preferences (excluding already matched)
    const potentialMatches = await prisma.preference.findMany({
      where: {
        AND: [
          { isComplete: true },
          { userId: { not: currentUser.id } },
          { id: { notIn: excludedProfileIds } }
        ]
      },
      include: {
        user: true
      }
    });

    // Calculate match scores and sort by compatibility
    const scoredMatches = potentialMatches
      .map(profile => ({
        ...profile,
        matchScore: calculateMatchScore(currentUser.preferences, profile)
      }))
      .filter(profile => profile.matchScore > 0.3) // Only show matches with >30% compatibility
      .sort((a, b) => b.matchScore - a.matchScore) // Sort by best matches first
      .slice(0, 10); // Limit to top 10 matches

    return NextResponse.json(scoredMatches);
  } catch (error) {
    console.error("Error fetching potential matches:", error);
    return NextResponse.json({ message: "Failed to fetch matches" }, { status: 500 });
  }
}