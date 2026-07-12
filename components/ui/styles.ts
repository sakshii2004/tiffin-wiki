/**
 * Shared Tailwind class fragments for UI primitives.
 *
 * These constants capture strings that were previously duplicated verbatim
 * across components. Values are intentionally identical to the originals so
 * refactors produce no visual change.
 */

/** Standard focus ring (no offset). */
export const FOCUS_RING =
  'focus:outline-none focus:border-brand-peridot focus:ring-2 focus:ring-inset focus:ring-brand-peridot/20 focus-visible:outline-none focus-visible:border-brand-peridot focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-peridot/20 transition-all';

/** Focus ring with offset — used by filled/button-like elements. */
export const FOCUS_RING_OFFSET = `${FOCUS_RING} focus-visible:ring-offset-2`;

/**
 * Base styles for text-like form fields (input, select).
 * Border *color* is intentionally excluded so callers add
 * `border-gray-300` / `border-red-500` as needed.
 */
export const FIELD_BASE = `min-h-[44px] rounded-xl border px-3 py-2 text-base text-body ${FOCUS_RING}`;

/** Base styles for textareas (same as FIELD_BASE without the min-height). */
export const TEXTAREA_BASE = `rounded-xl border px-3 py-2 text-base text-body ${FOCUS_RING}`;
