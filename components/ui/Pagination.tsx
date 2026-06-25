import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /**
   * Query string WITHOUT a `page` param and WITHOUT the leading `?`
   * (e.g. `city=pune&q=veg`). This component is solely responsible for setting
   * `page`, so callers must exclude it to avoid duplicated params.
   */
  baseUrl: string;
}

/** Builds a /search href, overwriting any existing page param via set(). */
function pageHref(base: string, page: number): string {
  const params = new URLSearchParams(base);
  params.set('page', String(page));
  return `/search?${params.toString()}`;
}

/** Returns up to 5 page numbers centred on the current page. */
function pageWindow(currentPage: number, totalPages: number): number[] {
  const maxButtons = 5;
  let start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(currentPage, totalPages);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  const arrowBase =
    'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-gray-300 px-3 text-sm font-medium';
  const numberBase =
    'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full px-3 text-sm font-medium';

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      {/* Previous */}
      {isFirst ? (
        <span
          aria-disabled="true"
          className={`${arrowBase} pointer-events-none text-gray-300`}
        >
          ‹ Prev
        </span>
      ) : (
        <Link href={pageHref(baseUrl, currentPage - 1)} className={`${arrowBase} text-body hover:bg-gray-50`} rel="prev">
          ‹ Prev
        </Link>
      )}

      {/* Page numbers */}
      {pages.map((p) =>
        p === currentPage ? (
          <span
            key={p}
            aria-current="page"
            className={`${numberBase} bg-brand-peridot text-white`}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(baseUrl, p)}
            className={`${numberBase} border border-gray-300 text-body hover:bg-gray-50`}
          >
            {p}
          </Link>
        ),
      )}

      {/* Next */}
      {isLast ? (
        <span
          aria-disabled="true"
          className={`${arrowBase} pointer-events-none text-gray-300`}
        >
          Next ›
        </span>
      ) : (
        <Link href={pageHref(baseUrl, currentPage + 1)} className={`${arrowBase} text-body hover:bg-gray-50`} rel="next">
          Next ›
        </Link>
      )}
    </nav>
  );
}
