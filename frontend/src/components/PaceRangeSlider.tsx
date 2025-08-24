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

  // Calculate the position of the range indicator
  const minPercent = ((min - 5) / (15 - 5)) * 100;
  const maxPercent = ((max - 5) / (15 - 5)) * 100;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between text-sm text-neutral mb-3">
        <span>Slower</span>
        <span className="font-medium text-secondary" data-testid="text-pace-range">
          {formatPace(min)} - {formatPace(max)} min/mi
        </span>
        <span>Faster</span>
      </div>
      
      <div className="relative mb-4">
        {/* Custom track background */}
        <div className="relative h-2 bg-gray-200 rounded-full">
          {/* Active range highlight */}
          <div 
            className="absolute h-2 bg-primary rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`
            }}
          />
          
          {/* Min thumb */}
          <div 
            className="absolute w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md -top-1.5 transform -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform"
            style={{ left: `${minPercent}%` }}
          />
          
          {/* Max thumb */}
          <div 
            className="absolute w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md -top-1.5 transform -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform"
            style={{ left: `${maxPercent}%` }}
          />
        </div>
        
        {/* Invisible slider for interaction */}
        <Slider
          min={5}
          max={15}
          step={0.25}
          value={[min, max]}
          onValueChange={handleRangeChange}
          className="absolute inset-0 opacity-0"
          data-testid="slider-pace-range"
        />
      </div>
      
      <div className="flex justify-between text-xs text-neutral">
        <span>5:00</span>
        <span>6:00</span>
        <span>7:00</span>
        <span>8:00</span>
        <span>9:00</span>
        <span>10:00</span>
        <span>11:00</span>
        <span>12:00</span>
        <span>13:00</span>
        <span>14:00</span>
        <span>15:00</span>
      </div>
    </div>
  );
}
