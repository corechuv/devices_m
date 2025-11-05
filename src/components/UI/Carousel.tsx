import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./Carousel.module.scss";

/**
 * Production-ready Carousel (React + TSX, no external libs)
 * - Responsive: slidesPerView via breakpoints
 * - Infinite loop (clones)
 * - Pointer drag (mouse/touch)
 * - Keyboard & ARIA
 * - Autoplay with pause on hover/interaction/visibility change
 * - RTL aware, SVG arrows
 */

export type Breakpoint = {
  minWidth: number;       // px
  slidesPerView: number;
};

export type AutoplayOptions = {
  delay: number;          // ms; 0 or omit to disable
  pauseOnHover?: boolean; // default true
  pauseOnInteraction?: boolean; // default true
};

export type CarouselProps = {
  children: React.ReactNode;
  slidesPerView?: number;
  breakpoints?: Breakpoint[]; // mobile-first
  gap?: number;               // px
  loop?: boolean;
  autoplay?: AutoplayOptions;
  showArrows?: boolean;
  showDots?: boolean;
  draggable?: boolean;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  ariaLabel?: string;
  slideAriaLabel?: (realIndex: number, total: number) => string;
  align?: "start" | "center";
  className?: string;
  style?: React.CSSProperties;
};

function useIsomorphicLayoutEffect(
  fn: React.EffectCallback,
  deps: React.DependencyList
) {
  const useL = typeof window !== "undefined" ? useLayoutEffect : useEffect;
  return useL(fn as any, deps);
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export function Carousel({
  children,
  slidesPerView = 1,
  breakpoints = [],
  gap = 16,
  loop = true,
  autoplay,
  showArrows = true,
  showDots = true,
  draggable = true,
  initialIndex = 0,
  onIndexChange,
  ariaLabel = "Carousel",
  slideAriaLabel,
  align = "start",
  className,
  style,
}: CarouselProps) {
  const childArray = useMemo(
    () => React.Children.toArray(children).filter(Boolean),
    [children]
  );
  const count = childArray.length;

  const isRtl =
    typeof document !== "undefined" &&
    getComputedStyle(document.documentElement).direction === "rtl";

  // responsive slidesPerView
  const getSpv = useCallback(() => {
    if (typeof window === "undefined") return slidesPerView;
    const sorted = [...breakpoints].sort((a, b) => a.minWidth - b.minWidth);
    let spv = slidesPerView;
    for (const bp of sorted) {
      if (window.innerWidth >= bp.minWidth) spv = bp.slidesPerView;
    }
    return Math.max(1, spv);
  }, [breakpoints, slidesPerView]);

  const [spv, setSpv] = useState<number>(getSpv);
  const cloneCount = loop ? Math.min(spv, Math.max(1, Math.min(count, spv))) : 0;

  // slides with clones
  const slides = useMemo(() => {
    if (!loop || count === 0) return childArray;
    const head = childArray.slice(0, cloneCount);
    const tail = childArray.slice(-cloneCount);
    return [...tail, ...childArray, ...head];
  }, [childArray, cloneCount, count, loop]);

  const [positionIndex, setPositionIndex] = useState<number>(() =>
    loop ? initialIndex + cloneCount : clamp(initialIndex, 0, Math.max(0, count - 1))
  );
  const [transitionMs, setTransitionMs] = useState(350);
  const [dragging, setDragging] = useState(false);
  const [dragDeltaX, setDragDeltaX] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const slideWidthRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const pointerIdRef = useRef<number | null>(null);
  const interactedRef = useRef<boolean>(false);

  const realCount = count;
  const realIndex = useMemo(() => {
    if (!loop) return positionIndex;
    const i = (positionIndex - cloneCount) % realCount;
    return (i + realCount) % realCount;
  }, [positionIndex, loop, cloneCount, realCount]);

  // external callback
  useEffect(() => {
    onIndexChange?.(realIndex);
  }, [realIndex, onIndexChange]);

  // window resize -> recompute spv
  useEffect(() => {
    const onResize = () => setSpv(getSpv());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [getSpv]);

  // measure slide width precisely
  useIsomorphicLayoutEffect(() => {
    const update = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const vw = viewport.clientWidth;
      const width = (vw - gap * (spv - 1)) / spv;
      slideWidthRef.current = width;
    };

    update();

    let obs: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && viewportRef.current) {
      obs = new ResizeObserver(() => update());
      obs.observe(viewportRef.current);
    }
    return () => {
      obs?.disconnect();
    };
  }, [spv, gap]);

  // keep same real index when spv/clones change
  useEffect(() => {
    if (!loop) {
      setPositionIndex((i) => clamp(i, 0, Math.max(0, realCount - 1)));
    } else {
      setPositionIndex(() => realIndex + cloneCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spv, cloneCount, loop]);

  // translate in px
  const translateX = useMemo(() => {
    const w = slideWidthRef.current + gap;
    const alignOffset =
      align === "center"
        ? viewportRef.current
          ? (viewportRef.current.clientWidth - slideWidthRef.current) / 2
          : 0
        : 0;
    const base = -positionIndex * w + alignOffset;
    return base + (dragging ? dragDeltaX : 0);
  }, [positionIndex, gap, dragging, dragDeltaX, align]);

  const goTo = useCallback(
    (targetRealIndex: number, opts: { immediate?: boolean } = {}) => {
      if (!loop) {
        setTransitionMs(opts.immediate ? 0 : 350);
        setPositionIndex(clamp(targetRealIndex, 0, Math.max(0, realCount - 1)));
        return;
      }
      const target = targetRealIndex + cloneCount;
      setTransitionMs(opts.immediate ? 0 : 350);
      setPositionIndex(target);
    },
    [cloneCount, loop, realCount]
  );

  const next = useCallback(() => {
    interactedRef.current = true;
    setTransitionMs(350);
    setPositionIndex((i) => (!loop ? clamp(i + 1, 0, Math.max(0, realCount - 1)) : i + 1));
  }, [loop, realCount]);

  const prev = useCallback(() => {
    interactedRef.current = true;
    setTransitionMs(350);
    setPositionIndex((i) => (!loop ? clamp(i - 1, 0, Math.max(0, realCount - 1)) : i - 1));
  }, [loop, realCount]);

  // loop jump on transition end
  const handleTransitionEnd = useCallback(() => {
    if (!loop) return;
    const totalWithClones = realCount + cloneCount * 2;
    if (positionIndex >= totalWithClones - cloneCount) {
      setTransitionMs(0);
      setPositionIndex((i) => i - realCount);
    } else if (positionIndex < cloneCount) {
      setTransitionMs(0);
      setPositionIndex((i) => i + realCount);
    }
  }, [cloneCount, loop, positionIndex, realCount]);

  // pointer drag
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!draggable) return;
      if (pointerIdRef.current !== null) return;
      interactedRef.current = true;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      pointerIdRef.current = e.pointerId;
      setTransitionMs(0);
      setDragging(true);
      startXRef.current = e.clientX;
    },
    [draggable]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggable) return;
      if (pointerIdRef.current !== e.pointerId) return;
      const dx = e.clientX - startXRef.current;
      setDragDeltaX(dx);
    },
    [draggable]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (pointerIdRef.current !== e.pointerId) return;
      const dx = dragDeltaX;
      const threshold = (slideWidthRef.current || 1) * 0.2;
      setDragging(false);
      setDragDeltaX(0);
      pointerIdRef.current = null;

      if (Math.abs(dx) > threshold) {
        const dir = dx > 0 ? -1 : 1; // swipe left -> next
        const rtlDir = isRtl ? -dir : dir;
        rtlDir > 0 ? next() : prev();
      } else {
        setTransitionMs(200); // snap back
        setPositionIndex((i) => i);
      }
    },
    [dragDeltaX, isRtl, next, prev]
  );

  // keyboard
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        isRtl ? prev() : next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        isRtl ? next() : prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(realCount - 1);
      }
    },
    [goTo, isRtl, next, prev, realCount]
  );

  // autoplay
  useEffect(() => {
    if (!autoplay || autoplay.delay <= 0) return;
    if (isAutoplayPaused) return;

    const id = window.setInterval(() => {
      if (!autoplay.pauseOnInteraction || !interactedRef.current) {
        isRtl ? prev() : next();
      }
    }, autoplay.delay);

    return () => window.clearInterval(id);
  }, [autoplay, isAutoplayPaused, isRtl, next, prev]);

  // pause on hover
  useEffect(() => {
    if (!autoplay) return;
    const pauseOnHover = autoplay.pauseOnHover ?? true;
    if (!pauseOnHover) return;
    const root = rootRef.current;
    if (!root) return;

    const onEnter = () => setIsAutoplayPaused(true);
    const onLeave = () => setIsAutoplayPaused(false);
    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);
    return () => {
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
    };
  }, [autoplay]);

  // pause when tab hidden
  useEffect(() => {
    if (!autoplay) return;
    const onVisibility = () => setIsAutoplayPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [autoplay]);

  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  const styleVars: React.CSSProperties = {
    ...style,
    ["--rc-gap" as any]: `${gap}px`,
    ["--rc-spv" as any]: String(spv),
  };

  const ArrowLeft = (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
        fill="currentColor"
      />
    </svg>
  );
  const ArrowRight = (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"
        fill="currentColor"
      />
    </svg>
  );

  const atStart = !loop && positionIndex <= 0;
  const atEnd = !loop && positionIndex >= Math.max(0, realCount - 1);

  return (
    <div
      ref={rootRef}
      className={rootClass}
      style={styleVars}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {showArrows && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.left}`}
            aria-label="Предыдущий слайд"
            onClick={isRtl ? next : prev}
            disabled={atStart}
          >
            {isRtl ? ArrowRight : ArrowLeft}
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.right}`}
            aria-label="Следующий слайд"
            onClick={isRtl ? prev : next}
            disabled={atEnd}
          >
            {isRtl ? ArrowLeft : ArrowRight}
          </button>
        </>
      )}

      <div
        ref={viewportRef}
        className={`${styles.viewport}${dragging ? ` ${styles.dragging}` : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={(e) => {
          if (pointerIdRef.current !== null) onPointerUp(e as any);
        }}
      >
        <div
          ref={trackRef}
          className={styles.track}
          style={{
            transform: `translate3d(${translateX}px, 0, 0)`,
            transition: `transform ${transitionMs}ms ease`,
          }}
          onTransitionEnd={handleTransitionEnd}
          aria-live="polite"
        >
          {slides.map((node, i) => {
            const isClone =
              loop && (i < cloneCount || i >= realCount + cloneCount);
            const real = (i - cloneCount + realCount) % realCount;
            const label =
              slideAriaLabel?.(real, realCount) ??
              `Слайд ${real + 1} из ${realCount}`;
            return (
              <div
                key={i}
                className={styles.slide}
                role="group"
                aria-roledescription={isClone ? "slide (clone)" : "slide"}
                aria-label={label}
                aria-hidden={isClone ? undefined : real !== realIndex}
              >
                {node}
              </div>
            );
          })}
        </div>
      </div>

      {showDots && realCount > 1 && (
        <div className={styles.dots} role="tablist" aria-label="Пагинация карусели">
          {Array.from({ length: realCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={styles.dot}
              role="tab"
              aria-selected={i === realIndex}
              aria-current={i === realIndex}
              aria-label={`Перейти к слайду ${i + 1}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;
