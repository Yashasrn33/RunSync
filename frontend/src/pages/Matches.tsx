import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Define types based on Prisma schema
type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
};

type Profile = {
  id: string;
  userId: string;
  name: string;
  goal: string;
  socialUrl?: string;
  paceMin: number;
  paceMax: number;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius: number;
  schedule: Record<string, string[]>;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  matchScore?: number;
  isAlreadyMatched?: boolean; // New flag for already matched users
};

type Match = {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  updatedAt: string;
  requester: Profile;
  receiver: Profile;
};

export default function Matches() {
  const { toast } = useToast();

  // Get current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Get user profile to watch for changes
  const { data: userProfile } = useQuery<any>({
    queryKey: ["/api/profile"],
    retry: false,
  });

  // Get auto-generated matches based on preferences - refresh when profile changes
  const { data: potentialMatches, isLoading: isLoadingPotential, error: discoverError } = useQuery<Profile[]>({
    queryKey: ["discover", userProfile?.updatedAt || "initial"],
    queryFn: () => apiRequest("GET", "/api/discover").then(res => res.json()),
    retry: false,
    enabled: !!currentUser, // Only run when user is authenticated
  });



  // Get existing matches
  const { data: matches, isLoading: isLoadingMatches } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
    retry: false,
  });

  const sendMatchMutation = useMutation({
    mutationFn: async (receiverId: string) => {
      await apiRequest("POST", "/api/matches", { receiverId });
    },
    onSuccess: () => {
      toast({
        title: "Match request sent!",
        description: "You'll be notified if they're interested too.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/discover"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send match request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMatchMutation = useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: string }) => {
      await apiRequest("PATCH", `/api/matches/${matchId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      toast({
        title: "Success",
        description: "Match updated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update match. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      await apiRequest("DELETE", `/api/matches/${matchId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/discover"] });
      toast({
        title: "Success",
        description: "Match removed successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove match. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMatch = (receiverId: string) => {
    sendMatchMutation.mutate(receiverId);
  };

  const handleAcceptMatch = (matchId: string) => {
    updateMatchMutation.mutate({ matchId, status: "accepted" });
  };

  const handleDeclineMatch = (matchId: string) => {
    updateMatchMutation.mutate({ matchId, status: "declined" });
  };

  const handleDeleteMatch = (matchId: string) => {
    deleteMatchMutation.mutate(matchId);
  };

  // Refresh suggested matches when profile is updated
  useEffect(() => {
    if (userProfile?.updatedAt) {
      queryClient.invalidateQueries({ queryKey: ["/api/discover"] });
    }
  }, [userProfile?.updatedAt]);

  const formatSchedule = (schedule: Record<string, string[]>) => {
    const days = Object.entries(schedule)
      .filter(([_, times]) => times.length > 0)
      .map(([day, times]) => `${day.slice(0, 3)} ${times.join(", ")}`)
      .slice(0, 2)
      .join(", ");
    return days || "No shared schedule";
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return "bg-green-100 text-green-800";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const isLoading = isLoadingPotential || isLoadingMatches;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const confirmedMatches = matches?.filter(match => match.status === "ACCEPTED") || [];
  
  // Separate sent and received pending requests
  // Note: requesterId/receiverId are Preference IDs, so we need to check the user IDs
  const sentRequests = matches?.filter(match => 
    match.status === "PENDING" && match.requester.userId === currentUser?.id
  ) || [];
  
  const receivedRequests = matches?.filter(match => 
    match.status === "PENDING" && match.receiver.userId === currentUser?.id
  ) || [];
  
  const suggestedMatches = potentialMatches?.slice(0, 5) || [];

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold text-secondary">Runner Matches</h2>
      
      {/* Confirmed Matches */}
      {confirmedMatches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral uppercase tracking-wide">
            Confirmed Matches ({confirmedMatches.length})
          </h3>
          
          {confirmedMatches.map((match) => {
            const otherProfile = match.requester.user?.id !== match.receiver.user?.id 
              ? (match.requester.userId !== undefined ? match.receiver : match.requester)
              : match.receiver;

            return (
              <Card key={match.id} className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {otherProfile.user?.profileImageUrl ? (
                        <img 
                          src={otherProfile.user.profileImageUrl}
                          alt={`Profile picture of ${otherProfile.name}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <i className="fas fa-user text-gray-400"></i>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-secondary">{otherProfile.name}</h4>
                        <p className="text-sm text-neutral">{otherProfile.goal}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800">
                        <i className="fas fa-check mr-1"></i>
                        Matched
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMatch(match.id)}
                        disabled={deleteMatchMutation.isPending}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Remove match"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-neutral space-y-1">
                    <div className="flex items-center justify-between">
                      <span>
                        <i className="fas fa-stopwatch text-primary text-xs mr-1"></i>
                        Pace: <span className="text-secondary font-medium">
                          {otherProfile.paceMin.toFixed(1)}-{otherProfile.paceMax.toFixed(1)} min/mi
                        </span>
                      </span>
                      <span>
                        <i className="fas fa-map-marker-alt text-primary text-xs mr-1"></i>
                        <span className="text-secondary font-medium">
                          {otherProfile.city}
                        </span>
                      </span>
                    </div>
                    <div>
                      <i className="fas fa-calendar text-primary text-xs mr-1"></i>
                      Schedule: <span className="text-secondary font-medium">
                        {formatSchedule(otherProfile.schedule as Record<string, string[]>)}
                      </span>
                    </div>
                    {otherProfile.address && (
                      <div>
                        <i className="fas fa-home text-primary text-xs mr-1"></i>
                        <span className="text-xs text-neutral">
                          Runs near: <span className="text-secondary font-medium">
                            {otherProfile.address}
                          </span>
                        </span>
                      </div>
                    )}
                    <div>
                      <i className="fas fa-route text-primary text-xs mr-1"></i>
                      <span className="text-xs text-neutral">
                        Willing to travel: <span className="text-secondary font-medium">
                          {otherProfile.radius} miles
                        </span>
                      </span>
                    </div>
                    {otherProfile.socialUrl && (
                      <div>
                        <i className="fas fa-link text-primary text-xs mr-1"></i>
                        <a 
                          href={otherProfile.socialUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs"
                        >
                          Connect online
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral uppercase tracking-wide">
            Sent Requests ({sentRequests.length})
          </h3>
          <p className="text-xs text-neutral">
            Waiting for their response
          </p>
          
          {sentRequests.map((match) => {
            const otherProfile = match.receiver;

            return (
              <Card key={match.id} className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {otherProfile.user?.profileImageUrl ? (
                        <img 
                          src={otherProfile.user.profileImageUrl}
                          alt={`Profile picture of ${otherProfile.name}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <i className="fas fa-user text-gray-400"></i>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-secondary">{otherProfile.name}</h4>
                        <p className="text-sm text-neutral">{otherProfile.goal}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        <i className="fas fa-paper-plane mr-1"></i>
                        Sent
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMatch(match.id)}
                        disabled={deleteMatchMutation.isPending}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Cancel request"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-neutral space-y-1">
                    <div className="flex items-center justify-between">
                      <span>
                        <i className="fas fa-stopwatch text-primary text-xs mr-1"></i>
                        Pace: <span className="text-secondary font-medium">
                          {otherProfile.paceMin.toFixed(1)}-{otherProfile.paceMax.toFixed(1)} min/mi
                        </span>
                      </span>
                      <span>
                        <i className="fas fa-map-marker-alt text-primary text-xs mr-1"></i>
                        <span className="text-secondary font-medium">
                          {otherProfile.city}
                        </span>
                      </span>
                    </div>
                    <div>
                      <i className="fas fa-calendar text-primary text-xs mr-1"></i>
                      Schedule: <span className="text-secondary font-medium">
                        {formatSchedule(otherProfile.schedule as Record<string, string[]>)}
                      </span>
                    </div>
                    {otherProfile.address && (
                      <div>
                        <i className="fas fa-home text-primary text-xs mr-1"></i>
                        <span className="text-xs text-neutral">
                          Runs near: <span className="text-secondary font-medium">
                            {otherProfile.address}
                          </span>
                        </span>
                      </div>
                    )}
                    <div>
                      <i className="fas fa-route text-primary text-xs mr-1"></i>
                      <span className="text-xs text-neutral">
                        Willing to travel: <span className="text-secondary font-medium">
                          {otherProfile.radius} miles
                        </span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Received Requests */}
      {receivedRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral uppercase tracking-wide">
            Received Requests ({receivedRequests.length})
          </h3>
          <p className="text-xs text-neutral">
            Respond to match requests from other runners
          </p>
          
          {receivedRequests.map((match) => {
            const otherProfile = match.requester;

            return (
              <Card key={match.id} className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {otherProfile.user?.profileImageUrl ? (
                        <img 
                          src={otherProfile.user.profileImageUrl}
                          alt={`Profile picture of ${otherProfile.name}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <i className="fas fa-user text-gray-400"></i>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-secondary">{otherProfile.name}</h4>
                        <p className="text-sm text-neutral">{otherProfile.goal}</p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <i className="fas fa-clock mr-1"></i>
                      Pending
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-neutral mb-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>
                        <i className="fas fa-stopwatch text-primary text-xs mr-1"></i>
                        Pace: <span className="text-secondary font-medium">
                          {otherProfile.paceMin.toFixed(1)}-{otherProfile.paceMax.toFixed(1)} min/mi
                        </span>
                      </span>
                      <span>
                        <i className="fas fa-map-marker-alt text-primary text-xs mr-1"></i>
                        <span className="text-secondary font-medium">
                          {otherProfile.city}
                        </span>
                      </span>
                    </div>
                    <div>
                      <i className="fas fa-calendar text-primary text-xs mr-1"></i>
                      Schedule: <span className="text-secondary font-medium">
                        {formatSchedule(otherProfile.schedule as Record<string, string[]>)}
                      </span>
                    </div>
                    {otherProfile.address && (
                      <div>
                        <i className="fas fa-home text-primary text-xs mr-1"></i>
                        <span className="text-xs text-neutral">
                          Runs near: <span className="text-secondary font-medium">
                            {otherProfile.address}
                          </span>
                        </span>
                      </div>
                    )}
                    <div>
                      <i className="fas fa-route text-primary text-xs mr-1"></i>
                      <span className="text-xs text-neutral">
                        Willing to travel: <span className="text-secondary font-medium">
                          {otherProfile.radius} miles
                        </span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      className="flex-1 bg-accent hover:bg-accent/90 text-white"
                      onClick={() => handleAcceptMatch(match.id)}
                      disabled={updateMatchMutation.isPending}
                    >
                      <i className="fas fa-check mr-2"></i>Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-neutral border-0"
                      onClick={() => handleDeclineMatch(match.id)}
                      disabled={updateMatchMutation.isPending}
                    >
                      <i className="fas fa-times mr-2"></i>Decline
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Suggested Matches */}
      {suggestedMatches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral uppercase tracking-wide">
            Top Compatible Runners ({suggestedMatches.length})
          </h3>
          <p className="text-xs text-neutral">
            Top potential running partners - we always show the best 3 available matches
          </p>
          
          {suggestedMatches.map((profile) => (
            <Card key={profile.id} className={`border hover:shadow-md transition-shadow ${
              profile.isAlreadyMatched ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {profile.user?.profileImageUrl ? (
                      <img 
                        src={profile.user.profileImageUrl}
                        alt={`Profile picture of ${profile.name}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <i className="fas fa-user text-gray-400"></i>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-secondary">{profile.name}</h4>
                      <p className="text-sm text-neutral">{profile.goal}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {profile.matchScore && (
                      <Badge className={getMatchScoreColor(profile.matchScore)}>
                        {Math.round(profile.matchScore * 100)}% match
                      </Badge>
                    )}
                    {profile.isAlreadyMatched && (
                      <Badge variant="outline" className="text-blue-600 border-blue-300">
                        <i className="fas fa-handshake mr-1 text-xs"></i>
                        Connected
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-neutral mb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>
                      <i className="fas fa-stopwatch text-primary text-xs mr-1"></i>
                      Pace: <span className="text-secondary font-medium">
                        {profile.paceMin.toFixed(1)}-{profile.paceMax.toFixed(1)} min/mi
                      </span>
                    </span>
                    <span>
                      <i className="fas fa-map-marker-alt text-primary text-xs mr-1"></i>
                      <span className="text-secondary font-medium">
                        {profile.city || profile.address}
                      </span>
                    </span>
                  </div>
                  <div>
                    <i className="fas fa-calendar text-primary text-xs mr-1"></i>
                    Schedule: <span className="text-secondary font-medium">
                      {formatSchedule(profile.schedule as Record<string, string[]>)}
                    </span>
                  </div>
                  {profile.address && (
                    <div>
                      <i className="fas fa-home text-primary text-xs mr-1"></i>
                      <span className="text-xs text-neutral">
                        Runs near: <span className="text-secondary font-medium">
                          {profile.address}
                        </span>
                      </span>
                    </div>
                  )}
                  <div>
                    <i className="fas fa-route text-primary text-xs mr-1"></i>
                    <span className="text-xs text-neutral">
                      Willing to travel: <span className="text-secondary font-medium">
                        {profile.radius} miles
                      </span>
                    </span>
                  </div>
                  {profile.socialUrl && (
                    <div>
                      <i className="fas fa-link text-primary text-xs mr-1"></i>
                      <a 
                        href={profile.socialUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-xs"
                      >
                        Connect online
                      </a>
                    </div>
                  )}
                </div>
                
                {profile.isAlreadyMatched ? (
                  <div className="text-center py-2">
                    <p className="text-sm text-blue-600">
                      <i className="fas fa-check-circle mr-1"></i>
                      You're already connected with this runner
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleSendMatch(profile.id)}
                    disabled={sendMatchMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                  >
                    <i className="fas fa-running mr-2"></i>
                    Send Match Request
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {confirmedMatches.length === 0 && sentRequests.length === 0 && receivedRequests.length === 0 && suggestedMatches.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-users text-gray-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-secondary mb-2">No Matches Yet</h3>
          <p className="text-neutral text-sm">
            Complete your profile to get matched with compatible runners!
          </p>
        </div>
      )}
    </div>
  );
}