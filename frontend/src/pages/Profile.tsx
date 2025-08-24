import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// Define types based on Prisma schema
type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
};

type ProfileWithUser = {
  id: string;
  userId: string;
  name: string;
  goal: string;
  instagram?: string;
  strava?: string;
  paceMin: number;
  paceMax: number;
  location: string;
  radius: number;
  schedule: Record<string, string[]>;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
};

const insertProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  goal: z.string().min(1, "Goal is required"),
  instagram: z.string().optional(),
  strava: z.string().optional(),
  paceMin: z.number(),
  paceMax: z.number(),
  location: z.string().min(1, "Location is required"),
  radius: z.number(),
  schedule: z.record(z.array(z.string())),
});
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PaceRangeSlider } from "@/components/PaceRangeSlider";
import { ScheduleSelector } from "@/components/ScheduleSelector";
import { Slider } from "@/components/ui/slider";

const profileFormSchema = insertProfileSchema.extend({
  paceMin: z.number().min(5).max(15),
  paceMax: z.number().min(5).max(15),
  radius: z.number().min(1).max(50),
}).refine(data => data.paceMax >= data.paceMin, {
  message: "Maximum pace must be greater than or equal to minimum pace",
  path: ["paceMax"],
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const RUNNING_GOALS = [
  "Train for Marathon",
  "Improve 5K Time", 
  "Stay Fit & Healthy",
  "Weight Loss",
  "Social Running",
  "Half Marathon Training",
  "10K Training",
];

export default function Profile() {
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery<ProfileWithUser>({
    queryKey: ["/api/profile"],
    retry: false,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      goal: "",
      instagram: "",
      strava: "",
      paceMin: 8,
      paceMax: 10,
      location: "",
      radius: 10,
      schedule: {},
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      await apiRequest("POST", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your profile has been saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
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
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || "",
        goal: profile.goal || "",
        instagram: profile.instagram || "",
        strava: profile.strava || "",
        paceMin: profile.paceMin || 8,
        paceMax: profile.paceMax || 10,
        location: profile.location || "",
        radius: profile.radius || 10,
        schedule: (profile.schedule as Record<string, string[]>) || {},
      });
    }
  }, [profile, form]);

  const onSubmit = (data: ProfileFormData) => {
    mutation.mutate(data);
  };

  const calculateCompletionPercentage = () => {
    const values = form.getValues();
    const requiredFields = ["name", "goal", "location"];
    const completedRequired = requiredFields.filter(field => values[field as keyof ProfileFormData]).length;
    const hasSchedule = Object.keys(values.schedule || {}).length > 0;
    
    let percentage = (completedRequired / requiredFields.length) * 80;
    if (hasSchedule) percentage += 20;
    
    return Math.min(percentage, 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-xs font-medium text-neutral mb-2">
          <span>Profile Setup</span>
          <span data-testid="text-completion-percentage">{Math.round(completionPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-secondary mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your name" 
                        {...field} 
                        data-testid="input-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Running Goal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-goal">
                          <SelectValue placeholder="Select your primary goal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RUNNING_GOALS.map((goal) => (
                          <SelectItem key={goal} value={goal}>
                            {goal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium text-secondary">Social Links (Optional)</Label>
                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Instagram profile" 
                          {...field} 
                          value={field.value || ""}
                          data-testid="input-instagram"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="strava"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          placeholder="Strava profile" 
                          {...field} 
                          value={field.value || ""}
                          data-testid="input-strava"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Pace Range Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-secondary mb-4">Pace Range</h3>
            
            <FormField
              control={form.control}
              name="paceMin"
              render={({ field: fieldMin }) => (
                <FormField
                  control={form.control}
                  name="paceMax"
                  render={({ field: fieldMax }) => (
                    <FormItem>
                      <FormLabel>Comfortable Running Pace</FormLabel>
                      <FormControl>
                        <PaceRangeSlider
                          min={fieldMin.value}
                          max={fieldMax.value}
                          onMinChange={fieldMin.onChange}
                          onMaxChange={fieldMax.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            />
          </div>

          {/* Location Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-secondary mb-4">Location & Distance</h3>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input 
                          placeholder="Enter city, address, or ZIP code" 
                          {...field} 
                          data-testid="input-location"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              async (position) => {
                                try {
                                  // Use reverse geocoding to get location name
                                  const { latitude, longitude } = position.coords;
                                  const response = await fetch(
                                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                                  );
                                  const data = await response.json();
                                  const location = `${data.city || data.locality}, ${data.principalSubdivision}`;
                                  field.onChange(location);
                                  toast({
                                    title: "Location detected",
                                    description: `Set to ${location}`,
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Error",
                                    description: "Could not detect location",
                                    variant: "destructive",
                                  });
                                }
                              },
                              (error) => {
                                toast({
                                  title: "Location access denied",
                                  description: "Please enter your location manually",
                                  variant: "destructive",
                                });
                              }
                            );
                          } else {
                            toast({
                              title: "Geolocation not supported",
                              description: "Please enter your location manually",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="shrink-0"
                      >
                        <i className="fas fa-location-arrow mr-2"></i>
                        Auto-detect
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="radius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Search Radius</FormLabel>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-neutral">Search radius</span>
                        <span className="font-medium text-secondary" data-testid="text-radius">
                          {field.value} miles
                        </span>
                      </div>
                      <FormControl>
                        <Slider
                          min={1}
                          max={50}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                          className="w-full"
                          data-testid="slider-radius"
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-neutral mt-1">
                        <span>1 mi</span>
                        <span>50 mi</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-secondary mb-4">Weekly Schedule</h3>
            <p className="text-sm text-neutral mb-4">Select when you're available to run</p>
            
            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ScheduleSelector
                      value={(field.value as Record<string, string[]>) || {}}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Save Button */}
          <Button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            disabled={mutation.isPending}
            data-testid="button-save-profile"
          >
            {mutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
