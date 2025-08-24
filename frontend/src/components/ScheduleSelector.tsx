import { Button } from "@/components/ui/button";

interface ScheduleSelectorProps {
  value: Record<string, string[]>;
  onChange: (schedule: Record<string, string[]>) => void;
}

const DAYS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

const TIMES = ["AM", "Lunch", "PM"];

export function ScheduleSelector({ value, onChange }: ScheduleSelectorProps) {
  const toggleTime = (day: string, time: string) => {
    const daySchedule = value[day] || [];
    const isSelected = daySchedule.includes(time);
    
    const newSchedule = { ...value };
    
    if (isSelected) {
      newSchedule[day] = daySchedule.filter(t => t !== time);
      if (newSchedule[day].length === 0) {
        delete newSchedule[day];
      }
    } else {
      newSchedule[day] = [...daySchedule, time];
    }
    
    onChange(newSchedule);
  };

  const isTimeSelected = (day: string, time: string) => {
    return (value[day] || []).includes(time);
  };

  return (
    <div className="space-y-3">
      {DAYS.map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between">
          <div className="w-12 text-sm font-medium text-secondary">
            {label}
          </div>
          <div className="flex space-x-2">
            {TIMES.map((time) => (
              <Button
                key={time}
                type="button"
                variant="outline"
                size="sm"
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  isTimeSelected(key, time)
                    ? "bg-primary text-white border-primary hover:bg-primary/90"
                    : "border-gray-300 text-neutral hover:bg-gray-50"
                }`}
                onClick={() => toggleTime(key, time)}
                data-testid={`schedule-${key}-${time.toLowerCase()}`}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
