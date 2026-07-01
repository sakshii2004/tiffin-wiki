'use client';

import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';

interface PolaroidProps {
  imageSrc: string;
  label: string;
  defaultRotate: string;
  defaultX: number;
  defaultY: number;
}

function Polaroid({ imageSrc, label, defaultRotate, defaultX, defaultY }: PolaroidProps) {
  const [position, setPosition] = useState({ x: defaultX, y: defaultY });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const elementStart = useRef({ x: 0, y: 0 });

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    elementStart.current = { x: position.x, y: position.y };
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStart.current = { x: touch.clientX, y: touch.clientY };
    elementStart.current = { x: position.x, y: position.y };
  }

  useEffect(() => {
    if (!isDragging) return;

    function onMouseMove(e: MouseEvent) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPosition({
        x: elementStart.current.x + dx,
        y: elementStart.current.y + dy,
      });
    }

    function onMouseUp() {
      setIsDragging(false);
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStart.current.x;
      const dy = touch.clientY - dragStart.current.y;
      setPosition({
        x: elementStart.current.x + dx,
        y: elementStart.current.y + dy,
      });
    }

    function onTouchEnd() {
      setIsDragging(false);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging]);

  return (
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`absolute w-[147px] md:w-[168px] p-2.5 pb-6 bg-white border border-[#e2e8f0] rounded cursor-grab select-none active:cursor-grabbing transition ${
        isDragging
          ? 'duration-75 shadow-[0_12px_24px_rgba(0,0,0,0.15)]'
          : isHovered
            ? 'duration-300 ease-out shadow-[0_8px_20px_rgba(0,0,0,0.12)]'
            : 'duration-300 ease-out shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
      }`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px) ${defaultRotate} ${
          isDragging
            ? 'scale(1.05)'
            : isHovered
              ? 'scale(1.025) rotate(1.5deg)'
              : ''
        }`,
        zIndex: isDragging ? 15 : isHovered ? 12 : 10,
        touchAction: 'none',
      }}
    >
      <div className="aspect-square w-full relative overflow-hidden rounded bg-slate-50 shadow-inner border border-black/5">
        <Image
          src={imageSrc}
          alt={label}
          fill
          sizes="(max-width: 768px) 147px, 168px"
          priority
          className="object-cover pointer-events-none"
        />
      </div>
      <p className="text-center font-medium text-[11px] text-[#475569] mt-2.5 font-mono select-none">
        {label}
      </p>
    </div>
  );
}

export function HeroPolaroids({ side }: { side: 'left' | 'right' }) {
  if (side === 'left') {
    return (
      <div className="absolute top-0 right-full -mr-12 xl:-mr-20 w-[180px] h-full pointer-events-none hidden lg:block overflow-visible">
        <div className="relative w-full h-full pointer-events-auto">
          <Polaroid
            imageSrc="/images/polaroid-1.png"
            label="Aunty's Special"
            defaultRotate="rotate(-15deg)"
            defaultX={-20}
            defaultY={20}
          />
          <Polaroid
            imageSrc="/images/polaroid-2.png"
            label="Pure Veg Meal"
            defaultRotate="rotate(7deg)"
            defaultX={20}
            defaultY={230}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-full -ml-12 xl:-ml-20 w-[180px] h-full pointer-events-none hidden lg:block overflow-visible">
      <div className="relative w-full h-full pointer-events-auto">
        <Polaroid
          imageSrc="/images/polaroid-3.png"
          label="Ghar ka Khana"
          defaultRotate="rotate(12deg)"
          defaultX={-20}
          defaultY={30}
        />
        <Polaroid
          imageSrc="/images/polaroid-4.png"
          label="Daily Dabba"
          defaultRotate="rotate(-8deg)"
          defaultX={10}
          defaultY={240}
        />
      </div>
    </div>
  );
}
