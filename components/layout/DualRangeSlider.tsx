'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/cn';

interface DualRangeSliderProps {
  min: number;
  max: number;
  minVal: number;
  maxVal: number;
  setMinVal: (val: number) => void;
  setMaxVal: (val: number) => void;
  step?: number;
}

export function DualRangeSlider({
  min,
  max,
  minVal,
  maxVal,
  setMinVal,
  setMaxVal,
  step = 1,
}: DualRangeSliderProps) {
  const [minPercent, setMinPercent] = useState(0);
  const [maxPercent, setMaxPercent] = useState(100);
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);

  useEffect(() => {
    const minP = Math.round(((minVal - min) / (max - min)) * 100);
    setMinPercent(minP);
  }, [minVal, min, max]);

  useEffect(() => {
    const maxP = Math.round(((maxVal - min) / (max - min)) * 100);
    setMaxPercent(maxP);
  }, [maxVal, min, max]);

  return (
    <div className="w-full px-2 py-4 flex flex-col gap-4">
      {/* Visual Sliders */}
      <div className="relative w-full h-2 flex items-center">
        {/* Track background */}
        <div className="absolute inset-0 h-1.5 rounded-full bg-slate-100 w-full" />
        
        {/* Highlighted active track range */}
        <div
          className="absolute h-1.5 rounded-full bg-[#6aa337]"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min Input Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={(e) => {
            const value = Math.min(Number(e.target.value), maxVal - step);
            setMinVal(value);
          }}
          onMouseDown={() => setActiveThumb('min')}
          onTouchStart={() => setActiveThumb('min')}
          className={cn(
            'absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer outline-none',
            // Webkit Thumb styling
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#6aa337] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
            // Moz Thumb styling
            '[&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#6aa337] [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110',
            activeThumb === 'min' ? 'z-30' : 'z-20'
          )}
        />

        {/* Max Input Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={(e) => {
            const value = Math.max(Number(e.target.value), minVal + step);
            setMaxVal(value);
          }}
          onMouseDown={() => setActiveThumb('max')}
          onTouchStart={() => setActiveThumb('max')}
          className={cn(
            'absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none cursor-pointer outline-none',
            // Webkit Thumb styling
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#6aa337] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
            // Moz Thumb styling
            '[&::-moz-range-thumb]:w-4.5 [&::-moz-range-thumb]:h-4.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#6aa337] [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110',
            activeThumb === 'max' ? 'z-30' : 'z-20'
          )}
        />
      </div>

      {/* Label and input boxes below for accessibility/readability */}
      <div className="flex items-center justify-between gap-4 text-xs font-semibold text-[#0f172a]">
        <div className="flex flex-col gap-1 w-20">
          <span className="text-[10px] text-slate-500 font-medium">MIN</span>
          <div className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center">
            ₹{minVal}
          </div>
        </div>
        <div className="h-px bg-slate-200 flex-1 mt-4" />
        <div className="flex flex-col gap-1 w-20">
          <span className="text-[10px] text-slate-500 font-medium">MAX</span>
          <div className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center">
            ₹{maxVal}
          </div>
        </div>
      </div>
    </div>
  );
}
