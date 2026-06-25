'use client';

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';

interface ImageUploaderProps {
  maxFiles: number;
  maxSizeMB: number;
  context: 'listing' | 'review';
  onUploadComplete: (keys: string[]) => void;
  label?: string;
}

type FileStatus = 'validating' | 'uploading' | 'done' | 'error';

interface TrackedFile {
  id: string;
  name: string;
  status: FileStatus;
  key?: string;
  error?: string;
}

export function ImageUploader({
  maxFiles,
  maxSizeMB,
  context,
  onUploadComplete,
  label = 'Upload images',
}: ImageUploaderProps) {
  const [files, setFiles] = useState<TrackedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const counter = useRef(0);

  // Keep the latest callback in a ref so the emit effect does not depend on its
  // identity (the parent recreates it each render), which would otherwise loop.
  const onUploadCompleteRef = useRef(onUploadComplete);
  // Sync the ref AFTER commit — writing a ref during render is illegal in React.
  // Declared before the emit effect so it runs first on each commit.
  useEffect(() => {
    onUploadCompleteRef.current = onUploadComplete;
  }, [onUploadComplete]);

  // Emit the completed-upload keys AFTER render commits. Calling the parent's
  // setState during a setFiles updater (render phase) is illegal in React.
  useEffect(() => {
    const keys = files
      .filter((f) => f.status === 'done' && f.key)
      .map((f) => f.key!) as string[];
    onUploadCompleteRef.current(keys);
  }, [files]);

  const updateFile = useCallback((id: string, patch: Partial<TrackedFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  async function uploadOne(id: string, file: File) {
    try {
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          context,
        }),
      });

      // The presign endpoint is a stub until Stage 5 (returns 501 / non-JSON).
      // Fail gracefully with a visible per-file error instead of throwing.
      if (!presignRes.ok) {
        updateFile(id, {
          status: 'error',
          error:
            presignRes.status === 501
              ? 'Uploads are not available yet. Please try again later.'
              : `Upload failed (HTTP ${presignRes.status}).`,
        });
        return;
      }

      let data: { presignedUrl?: string; key?: string };
      try {
        data = await presignRes.json();
      } catch {
        updateFile(id, { status: 'error', error: 'Unexpected server response.' });
        return;
      }

      if (!data.presignedUrl || !data.key) {
        updateFile(id, { status: 'error', error: 'Upload is not available yet.' });
        return;
      }

      updateFile(id, { status: 'uploading' });

      const putRes = await fetch(data.presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!putRes.ok) {
        updateFile(id, { status: 'error', error: 'Could not upload the file.' });
        return;
      }

      updateFile(id, { status: 'done', key: data.key });
    } catch {
      updateFile(id, { status: 'error', error: 'Network error during upload.' });
    }
  }

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;

    const remainingSlots = maxFiles - files.length;
    const toProcess = selected.slice(0, Math.max(0, remainingSlots));

    const newTracked: TrackedFile[] = [];

    for (const file of toProcess) {
      counter.current += 1;
      const id = `file-${counter.current}`;

      if (!file.type.startsWith('image/')) {
        newTracked.push({ id, name: file.name, status: 'error', error: 'Not an image file.' });
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        newTracked.push({
          id,
          name: file.name,
          status: 'error',
          error: `File exceeds ${maxSizeMB}MB.`,
        });
        continue;
      }

      newTracked.push({ id, name: file.name, status: 'validating' });
    }

    setFiles((prev) => [...prev, ...newTracked]);

    // Kick off uploads for the valid files.
    for (const tracked of newTracked) {
      if (tracked.status === 'validating') {
        const file = toProcess.find((f) => f.name === tracked.name);
        if (file) uploadOne(tracked.id, file);
      }
    }

    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-body">{label}</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelect}
          disabled={files.length >= maxFiles}
          className="text-sm text-body file:mr-3 file:min-h-[44px] file:rounded-full file:border-0 file:bg-brand-peridot file:px-5 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
        />
        <span className="text-xs text-gray-500">
          Up to {maxFiles} images, max {maxSizeMB}MB each.
        </span>
      </label>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2 text-sm"
            >
              <span className="truncate text-body">{file.name}</span>
              {file.status === 'validating' && <span className="text-gray-500">Checking…</span>}
              {file.status === 'uploading' && (
                <span className="text-gray-500" role="status">
                  Uploading…
                </span>
              )}
              {file.status === 'done' && <span className="text-green-600">Uploaded</span>}
              {file.status === 'error' && (
                <span role="alert" className="text-right text-red-600">
                  {file.error}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
