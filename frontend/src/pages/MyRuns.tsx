import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define types for runs
type MyRunData = {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  distance?: number;
  pace?: string;
  maxParticipants: number;
  currentParticipants: number;
  hostName: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  isHost: boolean;
  status: 'scheduled' | 'joined' | 'completed';
};

export default function MyRuns() {
  const { toast } = useToast();

  // Mock data for now - replace with actual API
  const mockMyRuns: MyRunData[] = [
    {
      id: '1',
      title: 'My Morning Run',
      description: 'Casual morning run I organized',
      date: '2025-08-25',
      time: '07:00',
      location: 'Central Park, NYC',
      distance: 5,
      pace: '8:30-9:00',
      maxParticipants: 8,
      currentParticipants: 3,
      hostName: 'Me',
      difficulty: 'Moderate',
      isHost: true,
      status: 'scheduled'
    },
    {
      id: '2',
      title: 'Speed Training Session',
      description: 'Joined Sarah\'s training session',
      date: '2025-08-26',
      time: '18:30',
      location: 'Brooklyn Track Club',
      distance: 5,
      pace: '7:00-7:30',
      maxParticipants: 6,
      currentParticipants: 4,
      hostName: 'Sarah Chen',
      difficulty: 'Hard',
      isHost: false,
      status: 'joined'
    }
  ];

  const { data: myRuns = mockMyRuns, isLoading } = useQuery<MyRunData[]>({
    queryKey: ["/api/my-runs"],
    retry: false,
    initialData: mockMyRuns
  });

  const deleteRunMutation = useMutation({
    mutationFn: async (runId: string) => {
      await apiRequest("DELETE", `/api/runs/${runId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Run deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-runs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/runs"] });
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
        description: "Failed to delete run. Please try again.",
        variant: "destructive",
      });
    },
  });

  const leaveRunMutation = useMutation({
    mutationFn: async (runId: string) => {
      await apiRequest("POST", `/api/runs/${runId}/leave`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Left the run successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-runs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/runs"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to leave run. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteRun = (runId: string) => {
    if (confirm("Are you sure you want to delete this run?")) {
      deleteRunMutation.mutate(runId);
    }
  };

  const handleLeaveRun = (runId: string) => {
    if (confirm("Are you sure you want to leave this run?")) {
      leaveRunMutation.mutate(runId);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50';
      case 'Hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const scheduledRuns = myRuns.filter(run => run.isHost && run.status === 'scheduled');
  const joinedRuns = myRuns.filter(run => !run.isHost && run.status === 'joined');

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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-secondary mb-4">My Runs</h2>
      
      <Tabs defaultValue="scheduled" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="scheduled">My Scheduled ({scheduledRuns.length})</TabsTrigger>
          <TabsTrigger value="joined">Joined ({joinedRuns.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scheduled" className="space-y-4">
          {scheduledRuns.length > 0 ? (
            scheduledRuns.map((run) => (
              <Card key={run.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-secondary">{run.title}</CardTitle>
                      <p className="text-neutral text-sm mt-1">
                        <i className="fas fa-crown text-yellow-500 mr-1"></i>
                        You're hosting this run
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(run.difficulty)}`}>
                      {run.difficulty}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {run.description && (
                    <p className="text-neutral text-sm mb-3">{run.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-calendar text-primary"></i>
                      <span>{formatDate(run.date)} at {run.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-map-marker-alt text-primary"></i>
                      <span>{run.location}</span>
                    </div>
                    {run.distance && (
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-route text-primary"></i>
                        <span>{run.distance} miles</span>
                      </div>
                    )}
                    {run.pace && (
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-stopwatch text-primary"></i>
                        <span>{run.pace} min/mi</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-neutral">
                      <i className="fas fa-users mr-1"></i>
                      {run.currentParticipants}/{run.maxParticipants} participants
                    </div>
                    <Button
                      onClick={() => handleDeleteRun(run.id)}
                      disabled={deleteRunMutation.isPending}
                      variant="destructive"
                      size="sm"
                    >
                      <i className="fas fa-trash mr-2"></i>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-plus text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-secondary mb-2">No Scheduled Runs</h3>
              <p className="text-neutral text-sm">
                Go to the Runs tab to schedule your first run!
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="joined" className="space-y-4">
          {joinedRuns.length > 0 ? (
            joinedRuns.map((run) => (
              <Card key={run.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-secondary">{run.title}</CardTitle>
                      <p className="text-neutral text-sm mt-1">Hosted by {run.hostName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(run.difficulty)}`}>
                      {run.difficulty}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {run.description && (
                    <p className="text-neutral text-sm mb-3">{run.description}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-calendar text-primary"></i>
                      <span>{formatDate(run.date)} at {run.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-map-marker-alt text-primary"></i>
                      <span>{run.location}</span>
                    </div>
                    {run.distance && (
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-route text-primary"></i>
                        <span>{run.distance} miles</span>
                      </div>
                    )}
                    {run.pace && (
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-stopwatch text-primary"></i>
                        <span>{run.pace} min/mi</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-neutral">
                      <i className="fas fa-users mr-1"></i>
                      {run.currentParticipants}/{run.maxParticipants} participants
                    </div>
                    <Button
                      onClick={() => handleLeaveRun(run.id)}
                      disabled={leaveRunMutation.isPending}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Leave Run
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-running text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-secondary mb-2">No Joined Runs</h3>
              <p className="text-neutral text-sm">
                Go to the Runs tab to find and join runs in your area!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
