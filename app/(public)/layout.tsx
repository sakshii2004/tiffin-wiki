/**
 * Passthrough layout for the public route group.
 *
 * Chrome (SiteHeader / SiteFooter / the <main id="main-content"> landmark) is
 * rendered PER PAGE rather than here, because the search and tiffin-detail pages
 * need a header whose <SearchBar> is pre-filled with page-specific data (the
 * active city / query, or the listing's city) that a shared layout cannot
 * access. Each public page therefore owns its own header/main/footer.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
