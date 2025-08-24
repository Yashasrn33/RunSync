import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Haversine formula to calculate distance between two GPS coordinates in miles
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
}

// Matching algorithm function
function calculateMatchScore(userProfile: any, candidateProfile: any): number {
  let score = 0;
  let weights = 0;

  // 1. Pace compatibility (30% weight) - reduced to focus more on schedule and location
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
  } else {
    // Even if pace ranges don't overlap, give a small base score to ensure we show matches
    const paceDifference = Math.abs(
      ((userPaceRange[0] + userPaceRange[1]) / 2) - 
      ((candidatePaceRange[0] + candidatePaceRange[1]) / 2)
    );
    // Give a small score based on how close the pace averages are (max 0.12 out of 0.3)
    const paceScore = Math.max(0, Math.min(0.4, (2 - paceDifference) / 10));
    score += paceScore * paceWeight;
  }
  weights += paceWeight;

  // 2. Schedule compatibility (35% weight) - increased to emphasize when people can actually run together
  const scheduleWeight = 0.35;
  const userSchedule = userProfile.schedule || {};
  const candidateSchedule = candidateProfile.schedule || {};
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  let sharedTimeSlots = 0;
  let totalUserSlots = 0;
  let totalCandidateSlots = 0;
  
  days.forEach(day => {
    const userSlots = userSchedule[day] || [];
    const candidateSlots = candidateSchedule[day] || [];
    totalUserSlots += userSlots.length;
    totalCandidateSlots += candidateSlots.length;
    
    userSlots.forEach((slot: string) => {
      if (candidateSlots.includes(slot)) {
        sharedTimeSlots++;
      }
    });
  });
  
  let scheduleScore = 0;
  if (totalUserSlots > 0 && totalCandidateSlots > 0) {
    if (sharedTimeSlots > 0) {
      scheduleScore = sharedTimeSlots / totalUserSlots;
    } else {
      // Even if no shared time slots, give a small base score (0.1) to ensure matches are shown
      scheduleScore = 0.1;
    }
  } else {
    // If one user has no schedule preferences, give medium compatibility score
    scheduleScore = 0.5;
  }
  
  score += scheduleScore * scheduleWeight;
  weights += scheduleWeight;

  // 3. Location proximity (35% weight) - increased to emphasize geographic accessibility
  const locationWeight = 0.35;
  
  // Check if both users have GPS coordinates
  if (userProfile.latitude && userProfile.longitude && 
      candidateProfile.latitude && candidateProfile.longitude) {
    
    const distance = calculateDistance(
      userProfile.latitude, userProfile.longitude,
      candidateProfile.latitude, candidateProfile.longitude
    );
    
    // Calculate location score based on distance and user's radius preference
    const maxAcceptableDistance = Math.max(userProfile.radius, candidateProfile.radius, 10); // Minimum 10 miles
    
    let locationScore = 0;
    if (distance <= maxAcceptableDistance) {
      // Within acceptable radius - score based on how close they are
      locationScore = Math.max(0.1, 1 - (distance / maxAcceptableDistance));
    } else {
      // Outside radius but give partial score - ensure minimum 0.05 to always show matches
      const extendedRadius = maxAcceptableDistance * 2; // Extended to 2x instead of 1.5x
      if (distance <= extendedRadius) {
        locationScore = Math.max(0.05, 0.3 * (1 - (distance - maxAcceptableDistance) / (extendedRadius - maxAcceptableDistance)));
      } else {
        // Even very far users get a minimum score to ensure matches are shown
        locationScore = 0.05;
      }
    }
    
    score += locationScore * locationWeight;
  } else {
    // Fallback to city-based matching if GPS coordinates not available
    if (userProfile.city && candidateProfile.city) {
      const cityScore = userProfile.city.toLowerCase() === candidateProfile.city.toLowerCase() ? 0.8 : 0.3;
      score += cityScore * locationWeight;
    } else {
      // If no location data available, give medium score to not exclude matches
      score += 0.5 * locationWeight;
    }
  }
  weights += locationWeight;

  // Always return at least a small score to ensure matches are shown
  const finalScore = weights > 0 ? score / weights : 0.1;
  return Math.max(finalScore, 0.05); // Minimum 5% compatibility to always show top 3
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

    // Get all other users with complete preferences 
    // Always find potential matches regardless of existing connections
    const potentialMatches = await prisma.preference.findMany({
      where: {
        AND: [
          { isComplete: true },
          { userId: { not: currentUser.id } }
        ]
      },
      include: {
        user: true
      }
    });

    // Calculate match scores and sort by compatibility
    // Always show top 3 matches even if scores are low
    const scoredMatches = potentialMatches
      .map(profile => ({
        ...profile,
        matchScore: calculateMatchScore(currentUser.preferences, profile),
        isAlreadyMatched: excludedProfileIds.includes(profile.id) // Flag existing matches
      }))
      .sort((a, b) => {
        // Prioritize unmatched users first, but still show matched ones if needed
        if (a.isAlreadyMatched !== b.isAlreadyMatched) {
          return a.isAlreadyMatched ? 1 : -1; // Unmatched first
        }
        return b.matchScore - a.matchScore; // Then by best match score (highest first)
      })
      .slice(0, 3); // Always show exactly top 3 matches regardless of score quality

    return NextResponse.json(scoredMatches);
  } catch (error) {
    console.error("Error fetching potential matches:", error);
    return NextResponse.json({ message: "Failed to fetch matches" }, { status: 500 });
  }
}