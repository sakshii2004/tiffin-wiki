import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { FOCUS_RING_OFFSET } from '@/components/ui/styles';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center rounded-full font-semibold transition-all ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

// The focus ring lives per-variant so non-peridot variants (e.g. whatsapp) can
// match their own color. All peridot variants reuse FOCUS_RING_OFFSET.
const variants: Record<Variant, string> = {
  primary: `bg-brand-peridot text-white shadow-[var(--shadow-soft)] hover:opacity-90 hover:shadow-[var(--shadow-soft-lg)] ${FOCUS_RING_OFFSET}`,
  secondary: `border border-brand-peridot text-body bg-white hover:bg-brand-peridot/10 ${FOCUS_RING_OFFSET}`,
  ghost: `text-body hover:opacity-70 bg-transparent ${FOCUS_RING_OFFSET}`,
  danger: `bg-brand-maroon text-white shadow-[var(--shadow-soft)] hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-maroon focus-visible:ring-offset-2`,
  whatsapp:
    'bg-green-600 text-white shadow-[var(--shadow-soft)] hover:opacity-90 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2',
  dark: `bg-[#0f172a] text-white shadow-[var(--shadow-soft)] hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b85c38] focus-visible:ring-offset-2`,
};

// All sizes keep a 44x44px minimum touch target via min-h / min-w + padding.
const sizes: Record<Size, string> = {
  sm: 'min-h-[44px] min-w-[44px] px-3 py-2 text-sm',
  md: 'min-h-[44px] min-w-[44px] px-4 py-2 text-sm',
  lg: 'min-h-[48px] min-w-[48px] px-6 py-3 text-base',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className = '', children, href, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href !== undefined) {
    return (
      <Link
        href={href}
        className={classes}
        {...(rest as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>)}
    >
      {children}
    </button>
  );
}
