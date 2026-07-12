'use client';

import Image from 'next/image';
import { toTitleCase } from '@/lib/titleCase';

interface ListingPreviewCardProps {
  title: string;
  price: number;
  city: string;
  meals: string;
  container: string;
  imageSrc: string;
  vegChoice: 'veg' | 'mixed';
  className?: string;
}

export function ListingPreviewCard({
  title,
  price,
  city,
  meals,
  container,
  imageSrc,
  vegChoice,
  className = '',
}: ListingPreviewCardProps) {
  return (
    <div
      className={`relative bg-white/95 backdrop-blur-sm rounded-[22px] border border-slate-200/50 shadow-[0_15px_30px_rgba(0,0,0,0.03)] p-3 flex flex-row items-center gap-3.5 select-none w-full max-w-[340px] h-[155px] cursor-default ${className}`}
    >
      {/* Veg Tag Badge */}
      <span
        className={`absolute top-3 right-3 z-10 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold text-white uppercase tracking-wider shadow-sm ${
          vegChoice === 'veg' ? 'bg-emerald-600' : 'bg-amber-600'
        }`}
      >
        {vegChoice === 'veg' ? 'Veg Only' : 'Veg & Non-Veg'}
      </span>

      {/* Card Image (Left Side) */}
      <div className="relative h-28 w-28 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="112px"
          className="object-cover"
          priority
        />
      </div>

      {/* Card Details (Right Side) */}
      <div className="flex flex-col justify-between h-28 py-1 min-w-0 flex-1">
        <div className="flex flex-col gap-0.5 min-w-0 pr-12">
          <h4 className="font-bold text-slate-800 text-sm leading-tight truncate" title={title}>
            {title}
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold truncate">{toTitleCase(city)}</p>
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          {/* Price */}
          <span className="text-[#6aa337] font-extrabold text-sm whitespace-nowrap">
            ₹{price}/meal
          </span>

          {/* Visual Attributes */}
          <div className="flex flex-wrap gap-1">
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-500 bg-slate-100 truncate max-w-[70px]">
              {meals}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold text-[#6aa337] bg-[#eef5e6] truncate max-w-[70px]">
              {container}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
