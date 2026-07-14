import type { ReactNode } from 'react';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'brand' | 'secondary';

const variants: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  brand: 'bg-brand-peridot/10 text-brand-peridot',
  secondary: 'bg-white border border-slate-200 text-slate-600',
};

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-base font-medium ${variants[variant]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
