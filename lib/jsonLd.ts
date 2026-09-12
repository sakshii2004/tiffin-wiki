/**
 * Safely serializes data for use inside an HTML `<script type="application/ld+json">` tag.
 *
 * Standard `JSON.stringify()` does not escape `<` or `>` or other HTML-breaking characters,
 * leaving `<script>` tags vulnerable to breakout XSS if user-controlled input contains `</script>`.
 *
 * This function escapes `<` to `\\u003c` and other special characters, ensuring the output
 * cannot close the script tag prematurely in an HTML parser, while remaining 100% valid JSON
 * for JSON-LD consumers and search engines.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
