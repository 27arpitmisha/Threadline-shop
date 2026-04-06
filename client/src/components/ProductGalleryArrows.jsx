function ChevronLeft({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
}

function ChevronRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}

const btnClass =
  "absolute top-1/2 z-[2] flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-sm transition hover:border-accent/40 hover:bg-black/65 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60";

/**
 * Prev/next controls for cycling product images. Use inside a `relative` container.
 * @param {{ onPrev: () => void; onNext: () => void; stopPropagation?: boolean }} props
 */
export function ProductGalleryArrows({ onPrev, onNext, stopPropagation = false }) {
  function wrap(handler) {
    return (e) => {
      if (stopPropagation) {
        e.preventDefault();
        e.stopPropagation();
      }
      handler();
    };
  }

  return (
    <>
      <button
        type="button"
        aria-label="Previous image"
        onClick={wrap(onPrev)}
        className={`${btnClass} left-2 sm:left-3`}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next image"
        onClick={wrap(onNext)}
        className={`${btnClass} right-2 sm:right-3`}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </>
  );
}
