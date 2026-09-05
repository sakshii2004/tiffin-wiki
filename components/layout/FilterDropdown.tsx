'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { FOCUS_RING } from '@/components/ui/styles';

interface FilterDropdownProps {
  label: string;
  activeLabel?: ReactNode;
  isActive: boolean;
  activeColor?: 'green' | 'orange' | 'dark';
  activeLabelClassName?: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  icon?: ReactNode;
}

export function FilterDropdown({
  label,
  activeLabel,
  isActive,
  activeColor = 'green',
  activeLabelClassName,
  children,
  icon,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const activeColorClasses = {
    green: 'border-[#6aa337] text-[#6aa337] bg-[#6aa337]/5 hover:bg-[#6aa337]/10 hover:shadow-[0_2px_6px_rgba(106,163,55,0.08)]',
    orange: 'border-[#b85c38] text-[#b85c38] bg-[#b85c38]/5 hover:bg-[#b85c38]/10 hover:shadow-[0_2px_6px_rgba(184,92,56,0.08)]',
    dark: 'border-[#0f172a] text-[#0f172a] bg-slate-100 hover:bg-slate-200 hover:shadow-[0_2px_6px_rgba(15,23,42,0.08)]',
  };

  return (
    <div className="relative inline-block text-left w-auto lg:w-full shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex min-h-[34px] items-center justify-between gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none bg-white cursor-pointer w-full whitespace-nowrap',
          FOCUS_RING,
          isActive
            ? activeColorClasses[activeColor]
            : 'border-slate-200 text-[#0f172a] hover:border-slate-400 hover:bg-slate-50 hover:shadow-[0_2px_6px_rgba(0,0,0,0.04)]'
        )}
      >
        <span className={cn('flex-1 text-left min-w-0 pr-1 flex items-center gap-1.5', isActive && activeLabelClassName)}>
          {icon && <span className={cn('shrink-0', isActive ? 'text-current' : 'text-slate-400')}>{icon}</span>}
          {isActive && activeLabel ? activeLabel : label}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'transition-transform duration-200 shrink-0 text-slate-500',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <>
          {/* Mobile Bottom-Sheet Modal (< lg) */}
          <div className="lg:hidden fixed inset-0 z-[9999] flex flex-col justify-end bg-black/60 backdrop-blur-xs p-0 animate-in fade-in duration-150">
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />
            <div className="relative z-10 w-full max-h-[80vh] flex flex-col rounded-t-3xl bg-white p-5 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <span className="font-bold text-base text-slate-800 flex items-center gap-2">
                  {icon}
                  {label}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 pb-2">
                {typeof children === 'function' ? children(() => setIsOpen(false)) : children}
              </div>
            </div>
          </div>

          {/* Desktop Absolute Popover (lg:) */}
          <div className="hidden lg:block absolute left-0 mt-2 z-50 min-w-[220px] max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-lg focus:outline-none text-sm animate-in fade-in-50 slide-in-from-top-1 duration-150">
            {typeof children === 'function' ? children(() => setIsOpen(false)) : children}
          </div>
        </>
      )}
    </div>
  );
}
