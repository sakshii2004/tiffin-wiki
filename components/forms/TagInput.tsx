'use client';

import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { FOCUS_RING } from '@/components/ui/styles';
import { Map } from 'lucide-react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  label: string;
  name: string;
  error?: string;
  lowercase?: boolean;
  placeholder?: string;
  icon?: ReactNode;
  noun?: string;
}

export function TagInput({
  value,
  onChange,
  maxTags = 10,
  label,
  name,
  error,
  lowercase = false,
  placeholder,
  icon = <Map size={18} />,
  noun = 'items',
}: TagInputProps) {
  const [draft, setDraft] = useState('');
  const [announce, setAnnounce] = useState('');
  const errorId = `${name}-error`;

  function addTag() {
    const trimmed = lowercase ? draft.trim().toLowerCase() : draft.trim();
    if (!trimmed) return;
    if (value.length >= maxTags) return;
    if (value.includes(trimmed)) {
      setDraft('');
      return;
    }
    onChange([...value, trimmed]);
    setAnnounce(`Added ${trimmed}`);
    setDraft('');
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
    setAnnounce(`Removed ${tag}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      addTag();
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      event.preventDefault();
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <div className="flex items-center justify-between mb-1.5">
        <legend className="text-sm font-semibold text-slate-700">{label}</legend>
        <span className="text-xs text-brand-peridot font-medium mr-1">{value.length}/{maxTags} added </span>
      </div>

      <div
        className={`flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors focus-within:border-brand-peridot focus-within:ring-2 focus-within:ring-brand-peridot/20 ${
          error ? 'border-red-500' : 'border-slate-200'
        }`}
      >
        <span className="text-[#94a3b8] shrink-0 mr-1">
          {icon}
        </span>
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5e6] text-[#2d5c10] border border-[#b6d98a]/30 font-medium px-2.5 py-0.5 text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className={`rounded-full px-0.5 text-gray-500 hover:text-red-600 transition-colors focus-visible:outline-none ${FOCUS_RING}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          name={name}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={value.length >= maxTags}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="min-h-[28px] min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-0 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:ring-0 focus-visible:outline-none disabled:cursor-not-allowed"
          placeholder={value.length >= maxTags ? 'Maximum reached' : (placeholder ?? 'Type and press Enter or Space...')}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        {error ? (
          <p id={errorId} role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : (
          <span />
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </fieldset>
  );
}
