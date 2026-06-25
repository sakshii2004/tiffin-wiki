/**
 * Joins class-name parts, dropping falsy values.
 *
 * Intentionally a plain join (no de-duplication or Tailwind merge) so the
 * rendered class string is byte-for-byte predictable. Replaces the ad-hoc
 * `` `${a} ${b}`.trim() `` pattern used across UI components.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ').trim();
}
