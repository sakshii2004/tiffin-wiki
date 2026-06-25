'use client';

import { useState, type KeyboardEvent } from 'react';
import { FOCUS_RING } from '@/components/ui/styles';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  label: string;
  name: string;
  error?: string;
}

export function TagInput({
  value,
  onChange,
  maxTags = 10,
  label,
  name,
  error,
}: TagInputProps) {
  const [draft, setDraft] = useState('');
  const [announce, setAnnounce] = useState('');
  const errorId = `${name}-error`;

  function addTag() {
    const trimmed = draft.trim();
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
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag();
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      event.preventDefault();
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <fieldset className="flex flex-col gap-2 border-0 p-0">
      <legend className="text-sm font-medium text-body">{label}</legend>

      <div
        className={`flex flex-wrap items-center gap-2 rounded-md border px-2 py-2 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-brand-peridot/20 px-2.5 py-1 text-sm text-body"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className={`rounded-full px-1 text-gray-600 hover:text-body ${FOCUS_RING}`}
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
          className="min-h-[36px] min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 text-base text-body focus-visible:outline-none disabled:cursor-not-allowed"
          placeholder={value.length >= maxTags ? 'Maximum reached' : 'Type and press Enter'}
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
        <span className="text-sm text-gray-500">
          {value.length}/{maxTags} areas added
        </span>
      </div>

      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
    </fieldset>
  );
}
