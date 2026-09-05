'use client';

import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageType {
  id: string;
  publicUrl: string;
  altText: string | null;
}

interface PhotosCarouselProps {
  images: ImageType[];
  listingName: string;
}

export function PhotosCarousel({ images, listingName }: PhotosCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    
    // Show left arrow if scrolled away from start
    setShowLeft(el.scrollLeft > 2);
    // Show right arrow if there is remaining space to scroll
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check on initial load
    checkScroll();

    // Listen to scroll and window resize
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    // Also check on image load/render changes
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      observer.disconnect();
    };
  }, [images]);

  // Lock scroll when image viewer is open
  useEffect(() => {
    if (activeIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeIndex]);

  // Keyboard navigation for image viewer
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, images.length]);

  const scroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.8; // scroll 80% of container width
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 relative group/carousel">
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-body">Photos</h2>
      </div>

      <div className="relative w-full overflow-hidden rounded-2xl">
        {/* Scrollable container */}
        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto pb-1 snap-x snap-mandatory no-scrollbar scroll-smooth"
        >
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View enlarged photo ${index + 1} of ${images.length}`}
              className="relative h-48 w-64 shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-50 shadow-sm cursor-zoom-in group/item p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b85c38]"
            >
              <Image
                src={image.publicUrl}
                alt={image.altText ?? listingName}
                width={320}
                height={240}
                className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-105 pointer-events-none"
                priority
              />
            </button>
          ))}
        </div>

        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className={`absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-slate-800 shadow-md border border-slate-200/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10 duration-200 cursor-pointer
            ${showLeft ? 'opacity-90 hover:opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} className="stroke-[2.5]" />
        </button>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white text-slate-800 shadow-md border border-slate-200/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10 duration-200 cursor-pointer
            ${showRight ? 'opacity-90 hover:opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          aria-label="Scroll right"
        >
          <ChevronRight size={20} className="stroke-[2.5]" />
        </button>
      </div>

      {/* Dimmed Lightbox Image Viewer Modal */}
      {mounted && activeIndex !== null && createPortal(
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex flex-col items-center justify-center transition-all duration-300 p-4"
          onClick={() => setActiveIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged photo preview"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute top-4 right-4 text-white bg-black/40 hover:bg-white/20 p-2.5 rounded-full transition-all cursor-pointer z-20 border border-white/20 active:scale-95"
            aria-label="Close photo viewer"
          >
            <X size={26} />
          </button>

          {/* Main Image container */}
          <div
            className="relative flex items-center justify-center max-w-[95vw] max-h-[82vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[activeIndex].publicUrl}
              alt={images[activeIndex].altText ?? listingName}
              className="max-w-[95vw] max-h-[80vh] object-contain rounded-xl shadow-2xl select-none"
            />
          </div>

          {/* Image indicator count (e.g. 1 / 3) */}
          <div className="mt-3 text-sm font-semibold text-white/80 bg-black/40 px-3 py-1 rounded-full border border-white/10 select-none">
            {activeIndex + 1} / {images.length}
          </div>

          {/* Modal Left Arrow navigation */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 sm:bg-white/10 hover:bg-white/25 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer z-10 border border-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} className="stroke-[2.5]" />
            </button>
          )}

          {/* Modal Right Arrow navigation */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 sm:bg-white/10 hover:bg-white/25 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer z-10 border border-white/20"
              aria-label="Next image"
            >
              <ChevronRight size={24} className="stroke-[2.5]" />
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
