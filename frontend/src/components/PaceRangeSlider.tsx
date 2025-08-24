import { Slider } from "@/components/ui/slider";

interface PaceRangeSliderProps {
  min: number;
  max: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

export function PaceRangeSlider({ min, max, onMinChange, onMaxChange }: PaceRangeSliderProps) {
  const formatPace = (pace: number) => {
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRangeChange = (values: number[]) => {
    const [newMin, newMax] = values;
    onMinChange(newMin);
    onMaxChange(newMax);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between text-sm text-neutral mb-2">
        <span>Slower</span>
        <span className="font-medium text-secondary" data-testid="text-pace-range">
          {formatPace(min)} - {formatPace(max)} min/mi
        </span>
        <span>Faster</span>
      </div>
      
      <div className="relative">
        <Slider
          min={5}
          max={15}
          step={0.25}
          value={[min, max]}
          onValueChange={handleRangeChange}
          className="w-full"
          data-testid="slider-pace-range"
        />
      </div>
      
      <div className="flex justify-between text-xs text-neutral mt-2">
        <span>5:00</span>
        <span>15:00</span>
      </div>
    </div>
  );
}
