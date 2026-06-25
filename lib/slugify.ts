import slugifyLib from "slugify";
import { randomBytes } from "crypto";

/**
 * Generate a URL-safe slug from a tiffin service name and city.
 * Format: {name}-{city}-{4 hex chars}
 *
 * Example: "Amma's Kitchen" + "Mumbai" → "ammas-kitchen-mumbai-3f9a"
 */
export function generateSlug(name: string, city: string): string {
  const opts = { lower: true, strict: true, trim: true };
  const namePart = slugifyLib(name, opts);
  const cityPart = slugifyLib(city, opts);
  const suffix = randomBytes(2).toString("hex"); // 4 hex chars

  return `${namePart}-${cityPart}-${suffix}`;
}
