import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-cream py-6 mt-auto">
      <div className="container mx-auto flex flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Tiffin Wiki. All rights reserved.
        </p>

        <nav aria-label="Footer navigation">
          <ul className="flex gap-5 text-sm text-gray-500">
            <li>
              <Link href="/about" className="hover:text-body transition-colors">
                About
              </Link>
            </li>
            <li>
              <Link href="/add" className="hover:text-body transition-colors">
                Add listing
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-body transition-colors">
                Privacy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
