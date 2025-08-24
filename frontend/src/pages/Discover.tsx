import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define types for runs
type RunData = {
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
};

export default function Discover() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRun, setNewRun] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    distance: '',
    pace: '',
    maxParticipants: '10',
    difficulty: 'Moderate' as 'Easy' | 'Moderate' | 'Hard'
  });

  // Mock data for now - replace with actual API
  const mockRuns: RunData[] = [
    {
      id: '1',
      title: 'Morning Central Park Loop',
      description: 'Casual morning run around the reservoir',
      date: '2025-08-25',
      time: '07:00',
      location: 'Central Park, NYC',
      distance: 6.2,
      pace: '8:30-9:00',
      maxParticipants: 8,
      currentParticipants: 4,
      hostName: 'Sarah Chen',
      difficulty: 'Moderate'
    },
    {
      id: '2',
      title: 'Speed Training Session',
      description: 'Interval training at the track',
      date: '2025-08-26',
      time: '18:30',
      location: 'Brooklyn Track Club',
      distance: 5,
      pace: '7:00-7:30',
      maxParticipants: 6,
      currentParticipants: 2,
      hostName: 'Mike Johnson',
      difficulty: 'Hard'
    },
    {
      id: '3',
      title: 'Easy Sunday Long Run',
      description: 'Relaxed pace for building endurance',
      date: '2025-08-27',
      time: '08:00',
      location: 'Prospect Park',
      distance: 12,
      pace: '9:00-9:30',
      maxParticipants: 12,
      currentParticipants: 7,
      hostName: 'Emma Rodriguez',
      difficulty: 'Easy'
    }
  ];

  const { data: runs = mockRuns, isLoading } = useQuery<RunData[]>({
    queryKey: ["/api/runs"],
    retry: false,
    initialData: mockRuns
  });

  const createRunMutation = useMutation({
    mutationFn: async (runData: any) => {
      await apiRequest("POST", "/api/runs", runData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Run scheduled successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/runs"] });
      setIsDialogOpen(false);
      setNewRun({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        distance: '',
        pace: '',
        maxParticipants: '10',
        difficulty: 'Moderate'
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
        description: "Failed to schedule run. Please try again.",
        variant: "destructive",
      });
    },
  });

  const joinRunMutation = useMutation({
    mutationFn: async (runId: string) => {
      await apiRequest("POST", `/api/runs/${runId}/join`, {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Successfully joined the run!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/runs"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to join run. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateRun = (e: React.FormEvent) => {
    e.preventDefault();
    createRunMutation.mutate(newRun);
  };

  const handleJoinRun = (runId: string) => {
    joinRunMutation.mutate(runId);
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
    <div className="p-4 space-y-6">
      {/* Header with Create Run Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-secondary">Scheduled Runs</h2>
          <p className="text-neutral text-sm">Join runs near your location</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-white">
              <i className="fas fa-plus mr-2"></i>Schedule Run
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule a New Run</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateRun} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Run Title</Label>
                <Input
                  id="title"
                  value={newRun.title}
                  onChange={(e) => setNewRun({ ...newRun, title: e.target.value })}
                  placeholder="e.g., Morning Park Run"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={newRun.description}
                  onChange={(e) => setNewRun({ ...newRun, description: e.target.value })}
                  placeholder="Describe the run..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newRun.date}
                    onChange={(e) => setNewRun({ ...newRun, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newRun.time}
                    onChange={(e) => setNewRun({ ...newRun, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newRun.location}
                  onChange={(e) => setNewRun({ ...newRun, location: e.target.value })}
                  placeholder="e.g., Central Park, NYC"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (miles)</Label>
                  <Input
                    id="distance"
                    type="number"
                    step="0.1"
                    value={newRun.distance}
                    onChange={(e) => setNewRun({ ...newRun, distance: e.target.value })}
                    placeholder="5.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pace">Target Pace</Label>
                  <Input
                    id="pace"
                    value={newRun.pace}
                    onChange={(e) => setNewRun({ ...newRun, pace: e.target.value })}
                    placeholder="8:00-8:30"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={newRun.difficulty}
                    onValueChange={(value: 'Easy' | 'Moderate' | 'Hard') => 
                      setNewRun({ ...newRun, difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={newRun.maxParticipants}
                    onChange={(e) => setNewRun({ ...newRun, maxParticipants: e.target.value })}
                    min="2"
                    max="50"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90"
                disabled={createRunMutation.isPending}
              >
                {createRunMutation.isPending ? "Scheduling..." : "Schedule Run"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Runs List */}
      <div className="space-y-4">
        {runs.map((run) => (
          <Card key={run.id} className="border border-gray-200 hover:shadow-md transition-shadow">
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
                  {run.currentParticipants}/{run.maxParticipants} joined
                </div>
                <Button
                  onClick={() => handleJoinRun(run.id)}
                  disabled={run.currentParticipants >= run.maxParticipants || joinRunMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {run.currentParticipants >= run.maxParticipants ? "Full" : "Join Run"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {runs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-running text-gray-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-semibold text-secondary mb-2">No Scheduled Runs</h3>
          <p className="text-neutral text-sm">
            Be the first to schedule a run in your area!
          </p>
        </div>
      )}
    </div>
  );
}