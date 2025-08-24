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

interface MatchCardProps {
  profile: ProfileWithUser;
}

export function MatchCard({ profile }: MatchCardProps) {
  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSharedSchedule = () => {
    const schedule = profile.schedule as Record<string, string[]>;
    const availableSlots: string[] = [];
    
    Object.entries(schedule).forEach(([day, times]) => {
      times.forEach(time => {
        availableSlots.push(`${day.slice(0, 3)} ${time}`);
      });
    });
    
    return availableSlots.slice(0, 3); // Show first 3 slots
  };

  const sharedSchedule = getSharedSchedule();

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200 p-6 relative z-10" data-testid={`match-card-${profile.id}`}>
      <div className="text-center mb-4">
        {profile.user?.profileImageUrl ? (
          <img 
            src={profile.user.profileImageUrl}
            alt={`Profile picture of ${profile.name}`}
            className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-user text-gray-400 text-2xl"></i>
          </div>
        )}
        <h3 className="text-xl font-bold text-secondary" data-testid={`text-card-name-${profile.id}`}>
          {profile.name}
        </h3>
        <p className="text-neutral" data-testid={`text-card-location-${profile.id}`}>
          {profile.location}
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral">Goal</span>
          <span className="text-sm font-medium text-secondary" data-testid={`text-card-goal-${profile.id}`}>
            {profile.goal}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral">Pace</span>
          <span className="text-sm font-medium text-secondary" data-testid={`text-card-pace-${profile.id}`}>
            {formatPace(profile.paceMin)}-{formatPace(profile.paceMax)} min/mi
          </span>
        </div>
        
        <div>
          <span className="text-sm text-neutral block mb-2">Availability</span>
          <div className="flex flex-wrap gap-2">
            {sharedSchedule.map((slot, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-primary text-white text-xs rounded-full"
                data-testid={`schedule-slot-${index}`}
              >
                {slot}
              </span>
            ))}
          </div>
        </div>
        
        {profile.instagram && (
          <div className="flex items-center space-x-2 pt-2">
            <i className="fab fa-instagram text-pink-500"></i>
            <span className="text-sm text-neutral" data-testid={`text-card-instagram-${profile.id}`}>
              {profile.instagram}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
