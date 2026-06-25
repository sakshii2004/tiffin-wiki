/**
 * Barrel module for the star-rating components.
 *
 * `StarRatingDisplay` is a Server Component (read-only); `StarRatingInteractive`
 * is a Client Component (`'use client'`). A single module cannot be both, so the
 * two implementations live in separate files and are re-exported here for a
 * single, convenient import path. This barrel itself carries no `'use client'`
 * directive.
 */
export { StarRatingDisplay } from './StarRatingDisplay';
export { StarRatingInteractive } from './StarRatingInteractive';
