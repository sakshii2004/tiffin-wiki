import en from '@/messages/en.json';

// Single source of truth for English copy until next-intl is wired (Section 15).
// `as const`-style typing comes for free from the JSON import under
// "resolveJsonModule" (already enabled by the project's tsconfig).
export const t = en;
