import React, { useEffect, useMemo, useRef, useState } from "react";
import cls from "./BeautyCarousel.module.scss";

type ButtonVariant = "primary" | "ghost" | "outline";

type SlideButton = {
  label: string;
  variant?: ButtonVariant;
  onClick?: () => void;
  href?: string;
};

type Slide = {
  id: string;
  img: string;
  title?: string;
  subtitle?: string;
  buttons: SlideButton[];
  imgAlt?: string;
};

export interface BeautyCarouselProps {
  className?: string;
  /** ms between auto switches */
  interval?: number;
  /** optional: provide your own slides (defaults to 3 demo slides) */
  slides?: Slide[];
}

function cx(...names: Array<string | undefined | false>) {
  return names.filter(Boolean).join(" ");
}

const defaultSlides: Slide[] = [
  {
    id: "s1",
    img: "/g.png",
    imgAlt: "Model with perfect hairstyle",
    title: "Soprano Titanium",
    subtitle: "Diode Laser",
    buttons: [
      { label: "More", variant: "ghost" },
      { label: "Catalog", variant: "primary" },
    ],
  },
  {
    id: "s2",
    img: "/b_1.png",
    imgAlt: "Beauty Studio",
    title: "Beauty Studio",
    subtitle: "Your beauty is your confidence",
    buttons: [
      { label: "Book now", variant: "primary" },
    ],
  },
  {
    id: "s3",
    img: "/nisv_s.png",
    imgAlt: "Consultation on the NiSV certificate",
    title: "NiSV",
    subtitle: "Consultation on the NiSV certificate",
    buttons: [
      { label: "Book now", variant: "primary" },
      { label: "More", variant: "ghost" },
    ],
  },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function BeautyCarousel({
  className,
  interval = 4500,
  slides,
}: BeautyCarouselProps) {
  const items = useMemo(() => slides ?? defaultSlides, [slides]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<number | null>(null);

  const next = () => setIndex((i) => (i + 1) % items.length);
  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);

  // autoplay
  useEffect(() => {
    if (paused || prefersReducedMotion()) return;
    timerRef.current && window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(next, Math.max(1800, interval));
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [index, paused, interval, items.length]);

  // keyboard arrows for accessibility
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  return (
    <section
      className={cx(cls.wrapper, className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
      aria-roledescription="carousel"
      aria-label="Beauty salon hero carousel"
      tabIndex={0}
    >
      {/* track */}
      <div
        className={cls.track}
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {items.map((s) => (
          <div className={cls.slide} key={s.id} aria-roledescription="slide">
            <div className={cls.media}>
              <img src={s.img} alt={s.imgAlt ?? s.title ?? "Slide"} className={cls.ap} />
              <div className={cls.vignette} />
            </div>

            <div className={cls.content}>
              {s.title && <h3 className={cls.title}>{s.title}</h3>}
              {s.subtitle && <p className={cls.subtitle}>{s.subtitle}</p>}

              <div className={cls.buttons}>
                {s.buttons.map((b, idx) => {
                  const variant = b.variant ?? "ghost";
                  const classFor =
                    variant === "primary"
                      ? cx(cls.btn, cls.btnPrimary, cls.btn__primary) // alias for your snippet
                      : variant === "outline"
                      ? cx(cls.btn, cls.btnOutline)
                      : cx(cls.btn);

                  const common = {
                    className: classFor,
                    "data-variant": variant,
                  };

                  return b.href ? (
                    <a key={idx} href={b.href} {...common}>
                      {b.label}
                    </a>
                  ) : (
                    <button key={idx} type="button" onClick={b.onClick} {...common}>
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* prev / next */}
      <button className={cx(cls.ctrl, cls.prev)} aria-label="Previous" onClick={prev}>
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M12.5 4l-5 6 5 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <button className={cx(cls.ctrl, cls.next)} aria-label="Next" onClick={next}>
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M7.5 4l5 6-5 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* dots */}
      <div className={cls.dots} role="tablist" aria-label="Slides">
        {items.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to slide ${i + 1}`}
            className={cx(cls.dot, i === index && cls.dotActive)}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      {/* screenreader-only index */}
      <span className={cls.srOnly}>
        Slide {index + 1} of {items.length}
      </span>
    </section>
  );
}
