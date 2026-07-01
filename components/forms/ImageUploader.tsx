'use client';

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { UploadCloud, Loader2, Image as ImageIcon, X } from 'lucide-react';

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
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const counter = useRef(0);

  // Keep the latest callback in a ref so the emit effect does not depend on its
  // identity (the parent recreates it each render), which would otherwise loop.
  const onUploadCompleteRef = useRef(onUploadComplete);
  
  useEffect(() => {
    onUploadCompleteRef.current = onUploadComplete;
  }, [onUploadComplete]);

  // Emit the completed-upload keys AFTER render commits.
  useEffect(() => {
    const keys = files
      .filter((f) => f.status === 'done' && f.key)
      .map((f) => f.key!) as string[];
    onUploadCompleteRef.current(keys);
  }, [files]);

  const updateFile = useCallback((id: string, patch: Partial<TrackedFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
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

      if (!presignRes.ok) {
        updateFile(id, {
          status: 'error',
          error:
            presignRes.status === 501
              ? 'Uploads are not available yet.'
              : `Upload failed (HTTP ${presignRes.status}).`,
        });
        return;
      }

      let data: { presignedUrl?: string; key?: string };
      try {
        data = await presignRes.json();
      } catch {
        updateFile(id, { status: 'error', error: 'Unexpected response.' });
        return;
      }

      if (!data.presignedUrl || !data.key) {
        updateFile(id, { status: 'error', error: 'Upload not available yet.' });
        return;
      }

      updateFile(id, { status: 'uploading' });

      const putRes = await fetch(data.presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!putRes.ok) {
        updateFile(id, { status: 'error', error: 'Could not upload file.' });
        return;
      }

      updateFile(id, { status: 'done', key: data.key });
    } catch {
      updateFile(id, { status: 'error', error: 'Network error.' });
    }
  }

  function processFiles(selected: File[]) {
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

    // Kick off uploads for valid files
    for (const tracked of newTracked) {
      if (tracked.status === 'validating') {
        const file = toProcess.find((f) => f.name === tracked.name);
        if (file) uploadOne(tracked.id, file);
      }
    }

    if (inputRef.current) inputRef.current.value = '';
  }

  function handleSelect(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length === 0) return;
    processFiles(selected);
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 md:p-8 cursor-pointer select-none transition-all duration-300 ${
          isDragActive
            ? 'border-[#6aa337] bg-[#eef5e6]/30 scale-[1.01]'
            : 'border-slate-200 bg-white hover:border-[#6aa337]/50 hover:bg-slate-50/50'
        } ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelect}
          disabled={files.length >= maxFiles}
          className="hidden"
        />

        <UploadCloud className={`w-10 h-10 mb-3 transition-colors duration-300 ${isDragActive ? 'text-[#6aa337]' : 'text-slate-400'}`} />
        <p className="text-sm font-semibold text-slate-800 text-center">
          {isDragActive ? 'Drop your files here' : 'Drag & drop listing photos here, or click to upload'}
        </p>
        <p className="text-[11px] text-slate-400 mt-1 text-center">
          Up to {maxFiles} images (max {maxSizeMB}MB each)
        </p>
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col gap-2 mt-1">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2.5 text-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate text-slate-700 font-medium">{file.name}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {file.status === 'validating' && (
                  <span className="text-slate-400 flex items-center gap-1.5 text-xs font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Checking…
                  </span>
                )}
                {file.status === 'uploading' && (
                  <span className="text-slate-400 flex items-center gap-1.5 text-xs font-semibold" role="status">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading…
                  </span>
                )}
                {file.status === 'done' && (
                  <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                    ✓ Ready
                  </span>
                )}
                {file.status === 'error' && (
                  <span role="alert" className="text-red-600 text-xs font-semibold max-w-[150px] truncate" title={file.error}>
                    {file.error}
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="p-1 rounded-full text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-all focus:outline-none focus:ring-1 focus:ring-[#6aa337]"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
