'use client';

import { usePathname } from 'next/navigation';

export function SharedDotGrid() {
  const pathname = usePathname();
  
  // Exclude the homepage, which handles its own local dot grid and spacing constraints.
  if (pathname === '/') return null;

  return (
    <>
      {/* Background Dot Grid */}
      <div 
        className="fixed inset-0 pointer-events-none z-[-2]" 
        style={{
          backgroundImage: 'radial-gradient(rgba(106, 163, 55, 0.3) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Overlaid Green Gradient */}
      <div 
        className="fixed top-0 left-0 right-0 pointer-events-none z-[-1] bg-gradient-to-b from-[#6aa337]/15 to-transparent h-[500px]"
      />
    </>
  );
}
