'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

interface AdminSearchInputProps {
  initialSearch?: string;
}

export function AdminSearchInput({ initialSearch = '' }: AdminSearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newQuery.trim()) {
        params.set('q', newQuery.trim());
      } else {
        params.delete('q');
      }
      router.push(`/admin${params.toString() ? '?' + params.toString() : ''}`);
    });
  };

  const handleClear = () => {
    setQuery('');
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q');
      router.push(`/admin${params.toString() ? '?' + params.toString() : ''}`);
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch(query);
      }}
      className="relative w-full max-w-md"
    >
      <div className="relative flex items-center font-mono">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          {isPending ? (
            <Loader2 size={16} className="animate-spin text-emerald-400" />
          ) : (
            <Search size={16} className="text-slate-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search entries by name, city, area..."
          className="w-full rounded-xl border border-emerald-500/20 bg-slate-900/90 py-2.5 pl-9 pr-9 text-xs text-white placeholder:text-slate-500 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-emerald-400 transition-colors"
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </form>
  );
}
