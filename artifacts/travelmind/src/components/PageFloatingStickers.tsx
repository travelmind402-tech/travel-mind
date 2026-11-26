import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { STICKERS } from "./stickerConfig";

type StickerById = Record<string, (typeof STICKERS)[number]>;
const STICKER_MAP: StickerById = Object.fromEntries(STICKERS.map((s) => [s.id, s]));

export type FloatingFieldVariant =
  | "landing"
  | "auth"
  | "plan"
  | "dashboard"
  | "notfound";

interface Placement {
  key: string;
  stickerId: string;
  top: string;
  left?: string;
  right?: string;
  /** Desktop width in px (scaled down smoothly on smaller viewports via CSS) */
  width: number;
  rotate: number;
  floatY: number;
  floatRot: number;
  floatDur: number;
  floatDelay: number;
  depth: number;
  opacity?: number;
  hide?: "tablet" | "mobile";
}

const PLACEMENTS: Record<FloatingFieldVariant, Placement[]> = {
  // 18 arbitrary, asymmetric placements spanning the entire post-hero Landing page
  landing: [
    // Band 1 — beside "All your travel ideas, everywhere." (open right side & upper-left margin)
    { key: "l-01", stickerId: "sunflower", top: "2.2%", left: "1.5%", width: 108, rotate: -13, floatY: 6.5, floatRot: 0.7, floatDur: 7.4, floatDelay: -1.2, depth: 0.72, hide: "tablet" },
    { key: "l-02", stickerId: "newsbird", top: "3.1%", right: "14%", width: 132, rotate: -8, floatY: 7.5, floatRot: -0.8, floatDur: 6.8, floatDelay: -3.4, depth: 0.88, hide: "mobile" },
    { key: "l-03", stickerId: "orange-starburst", top: "6.4%", right: "3.5%", width: 88, rotate: 11, floatY: 4.5, floatRot: 0.8, floatDur: 6.1, floatDelay: -4.8, depth: 0.52 },
    { key: "l-04", stickerId: "butterflies", top: "9.8%", right: "28%", width: 72, rotate: 6, floatY: 5, floatRot: -0.6, floatDur: 7.9, floatDelay: -2.1, depth: 0.58, hide: "tablet" },

    // Band 2 — flanking "TravelMind sorts it." & 7 sticker-job cards
    { key: "l-05", stickerId: "lightbulb", top: "16.5%", left: "1.2%", width: 96, rotate: -15, floatY: 5.5, floatRot: -0.8, floatDur: 6.4, floatDelay: -5.1, depth: 0.62, hide: "tablet" },
    { key: "l-06", stickerId: "megaphone", top: "21.8%", right: "1.4%", width: 118, rotate: 13, floatY: 7, floatRot: 0.7, floatDur: 7.2, floatDelay: -1.9, depth: 0.82, hide: "tablet" },
    { key: "l-07", stickerId: "cassette", top: "28.4%", left: "2.4%", width: 114, rotate: -9, floatY: 6.5, floatRot: 0.6, floatDur: 8.1, floatDelay: -4.2, depth: 0.76, hide: "tablet" },

    // Band 3 — flanking "Three steps from scatter to sorted."
    { key: "l-08", stickerId: "redstar-painted", top: "35.2%", right: "2.8%", width: 92, rotate: -14, floatY: 5, floatRot: 0.9, floatDur: 5.9, floatDelay: -0.8, depth: 0.54, hide: "mobile" },
    { key: "l-09", stickerId: "swallow", top: "40.6%", left: "1.8%", width: 120, rotate: 7, floatY: 7.5, floatRot: -0.9, floatDur: 6.7, floatDelay: -3.7, depth: 0.86, hide: "tablet" },

    // Band 4 — Travel Philosophy scroll-reveal statement open breathing space
    { key: "l-10", stickerId: "camera", top: "47.8%", right: "2.5%", width: 126, rotate: -6, floatY: 8, floatRot: -0.6, floatDur: 7.7, floatDelay: -5.5, depth: 0.92, hide: "mobile" },
    { key: "l-11", stickerId: "redstar-enamel", top: "52.4%", left: "4.5%", width: 66, rotate: 14, floatY: 4.5, floatRot: -0.8, floatDur: 6.2, floatDelay: -2.6, depth: 0.46 },

    // Band 5 — Specialized Intelligence ("TravelMind Offers All") & 7 Agent Cards
    { key: "l-12", stickerId: "envelope", top: "59.5%", right: "1.6%", width: 118, rotate: 10, floatY: 7, floatRot: 0.7, floatDur: 8.3, floatDelay: -1.4, depth: 0.84, hide: "tablet" },
    { key: "l-13", stickerId: "spacecat", top: "66.2%", left: "1.2%", width: 112, rotate: -11, floatY: 7, floatRot: -0.7, floatDur: 7.1, floatDelay: -4.6, depth: 0.78, hide: "tablet" },
    { key: "l-14", stickerId: "speech", top: "73.4%", right: "2.2%", width: 100, rotate: 9, floatY: 5.5, floatRot: 0.8, floatDur: 6.5, floatDelay: -3.1, depth: 0.64, hide: "tablet" },
    { key: "l-15", stickerId: "statue", top: "79.8%", left: "1.6%", width: 118, rotate: 6, floatY: 7.5, floatRot: 0.5, floatDur: 8.0, floatDelay: -6.0, depth: 0.9, hide: "tablet" },

    // Band 6 — Architecture of Rest statement & approach to Footer
    { key: "l-16", stickerId: "calico", top: "86.4%", right: "2.6%", width: 104, rotate: -5, floatY: 6, floatRot: -0.6, floatDur: 7.5, floatDelay: -2.3, depth: 0.74, hide: "mobile" },
    { key: "l-17", stickerId: "starburst", top: "90.8%", left: "5.2%", width: 78, rotate: -12, floatY: 4.5, floatRot: 0.8, floatDur: 5.8, floatDelay: -3.9, depth: 0.48, hide: "mobile" },
    { key: "l-18", stickerId: "butterflies", top: "93.2%", right: "11%", width: 64, rotate: 8, floatY: 4.5, floatRot: -0.7, floatDur: 6.9, floatDelay: -1.1, depth: 0.52, hide: "tablet" },
  ],

  // 7 arbitrary cutouts floating gently around the Auth form area
  auth: [
    { key: "a-01", stickerId: "sunflower", top: "6%", left: "4%", width: 92, rotate: -12, floatY: 5.5, floatRot: 0.7, floatDur: 7.3, floatDelay: -1.4, depth: 0.65, hide: "mobile" },
    { key: "a-02", stickerId: "butterflies", top: "12%", right: "5%", width: 68, rotate: 9, floatY: 4.5, floatRot: -0.6, floatDur: 6.2, floatDelay: -3.2, depth: 0.48 },
    { key: "a-03", stickerId: "redstar-painted", top: "42%", left: "2.5%", width: 74, rotate: -15, floatY: 5, floatRot: 0.8, floatDur: 6.8, floatDelay: -4.7, depth: 0.54, hide: "tablet" },
    { key: "a-04", stickerId: "camera", top: "48%", right: "3%", width: 102, rotate: 7, floatY: 6.5, floatRot: -0.6, floatDur: 7.9, floatDelay: -2.1, depth: 0.8, hide: "tablet" },
    { key: "a-05", stickerId: "cassette", top: "78%", left: "5%", width: 94, rotate: -8, floatY: 6, floatRot: 0.7, floatDur: 7.1, floatDelay: -5.3, depth: 0.7, hide: "mobile" },
    { key: "a-06", stickerId: "spacecat", top: "82%", right: "6%", width: 88, rotate: -10, floatY: 6, floatRot: -0.8, floatDur: 6.5, floatDelay: -0.9, depth: 0.72, hide: "mobile" },
    { key: "a-07", stickerId: "redstar-enamel", top: "26%", right: "11%", width: 52, rotate: 14, floatY: 4, floatRot: -0.7, floatDur: 5.7, floatDelay: -2.8, depth: 0.44, hide: "tablet" },
  ],

  // 10 arbitrary cutouts scattered down the 4-step Onboarding trip wizard
  plan: [
    { key: "p-01", stickerId: "newsbird", top: "4%", left: "2%", width: 112, rotate: -11, floatY: 7, floatRot: -0.8, floatDur: 6.9, floatDelay: -1.1, depth: 0.84, hide: "tablet" },
    { key: "p-02", stickerId: "starburst", top: "7%", right: "3%", width: 82, rotate: 10, floatY: 4.5, floatRot: 0.8, floatDur: 5.9, floatDelay: -3.5, depth: 0.5, hide: "mobile" },
    { key: "p-03", stickerId: "sunflower", top: "24%", right: "1.8%", width: 104, rotate: -7, floatY: 6.5, floatRot: 0.7, floatDur: 7.6, floatDelay: -2.2, depth: 0.72, hide: "tablet" },
    { key: "p-04", stickerId: "lightbulb", top: "31%", left: "1.6%", width: 88, rotate: -14, floatY: 5, floatRot: -0.7, floatDur: 6.3, floatDelay: -4.6, depth: 0.56, hide: "tablet" },
    { key: "p-05", stickerId: "butterflies", top: "51%", right: "2.5%", width: 68, rotate: 6, floatY: 4.5, floatRot: -0.6, floatDur: 7.2, floatDelay: -1.8, depth: 0.48, hide: "tablet" },
    { key: "p-06", stickerId: "swallow", top: "57%", left: "1.8%", width: 112, rotate: -6, floatY: 7, floatRot: -0.9, floatDur: 6.6, floatDelay: -5.2, depth: 0.86, hide: "tablet" },
    { key: "p-07", stickerId: "camera", top: "74%", right: "2%", width: 114, rotate: 5, floatY: 7.5, floatRot: -0.6, floatDur: 7.8, floatDelay: -3.0, depth: 0.9, hide: "tablet" },
    { key: "p-08", stickerId: "cassette", top: "80%", left: "2.2%", width: 104, rotate: -9, floatY: 6.5, floatRot: 0.8, floatDur: 7.0, floatDelay: -4.1, depth: 0.74, hide: "tablet" },
    { key: "p-09", stickerId: "redstar-enamel", top: "91%", right: "5%", width: 60, rotate: -14, floatY: 4, floatRot: 0.7, floatDur: 5.6, floatDelay: -2.5, depth: 0.45, hide: "mobile" },
    { key: "p-10", stickerId: "calico", top: "90%", left: "4%", width: 92, rotate: 6, floatY: 5.5, floatRot: -0.5, floatDur: 8.0, floatDelay: -6.1, depth: 0.68, hide: "mobile" },
  ],

  // 10 subtle cutouts along outer edges of scrollable Dashboard & Agent Briefing pages
  dashboard: [
    { key: "d-01", stickerId: "starburst", top: "4%", right: "2.5%", width: 72, rotate: 11, floatY: 4.5, floatRot: 0.7, floatDur: 6.4, floatDelay: -1.3, depth: 0.48, opacity: 0.85, hide: "tablet" },
    { key: "d-02", stickerId: "newsbird", top: "11%", left: "1.5%", width: 92, rotate: -12, floatY: 6, floatRot: -0.8, floatDur: 7.2, floatDelay: -3.8, depth: 0.74, opacity: 0.85, hide: "tablet" },
    { key: "d-03", stickerId: "butterflies", top: "24%", right: "1.8%", width: 62, rotate: 7, floatY: 4, floatRot: -0.6, floatDur: 6.8, floatDelay: -2.4, depth: 0.45, opacity: 0.85, hide: "tablet" },
    { key: "d-04", stickerId: "sunflower", top: "36%", left: "1.4%", width: 88, rotate: -8, floatY: 5.5, floatRot: 0.6, floatDur: 7.8, floatDelay: -5.0, depth: 0.68, opacity: 0.85, hide: "tablet" },
    { key: "d-05", stickerId: "redstar-painted", top: "49%", right: "2.2%", width: 74, rotate: -13, floatY: 4.5, floatRot: 0.8, floatDur: 6.0, floatDelay: -0.9, depth: 0.52, opacity: 0.85, hide: "tablet" },
    { key: "d-06", stickerId: "envelope", top: "61%", left: "1.6%", width: 92, rotate: 9, floatY: 6, floatRot: 0.7, floatDur: 8.1, floatDelay: -4.2, depth: 0.78, opacity: 0.85, hide: "tablet" },
    { key: "d-07", stickerId: "spacecat", top: "73%", right: "1.8%", width: 88, rotate: -9, floatY: 6, floatRot: -0.7, floatDur: 7.4, floatDelay: -2.9, depth: 0.72, opacity: 0.85, hide: "tablet" },
    { key: "d-08", stickerId: "camera", top: "83%", left: "1.8%", width: 94, rotate: 5, floatY: 6.5, floatRot: -0.5, floatDur: 7.6, floatDelay: -5.7, depth: 0.82, opacity: 0.85, hide: "tablet" },
    { key: "d-09", stickerId: "calico", top: "91%", right: "2.4%", width: 84, rotate: -5, floatY: 5.5, floatRot: -0.6, floatDur: 7.9, floatDelay: -1.7, depth: 0.66, opacity: 0.85, hide: "tablet" },
    { key: "d-10", stickerId: "redstar-enamel", top: "94%", left: "3%", width: 54, rotate: 14, floatY: 4, floatRot: -0.7, floatDur: 5.8, floatDelay: -3.3, depth: 0.44, opacity: 0.85, hide: "tablet" },
  ],

  // 6 arbitrary cutouts around the 404 screen
  notfound: [
    { key: "n-01", stickerId: "newsbird", top: "9%", left: "7%", width: 116, rotate: -12, floatY: 7, floatRot: -0.8, floatDur: 6.8, floatDelay: -1.5, depth: 0.8 },
    { key: "n-02", stickerId: "sunflower", top: "12%", right: "8%", width: 108, rotate: 9, floatY: 6.5, floatRot: 0.7, floatDur: 7.4, floatDelay: -3.2, depth: 0.74 },
    { key: "n-03", stickerId: "butterflies", top: "48%", left: "5%", width: 72, rotate: -6, floatY: 4.5, floatRot: 0.6, floatDur: 6.2, floatDelay: -4.6, depth: 0.48, hide: "mobile" },
    { key: "n-04", stickerId: "spacecat", top: "52%", right: "6%", width: 106, rotate: -9, floatY: 6.5, floatRot: -0.7, floatDur: 7.1, floatDelay: -2.0, depth: 0.76, hide: "mobile" },
    { key: "n-05", stickerId: "camera", top: "79%", left: "11%", width: 118, rotate: 5, floatY: 7.5, floatRot: -0.6, floatDur: 7.8, floatDelay: -5.4, depth: 0.86 },
    { key: "n-06", stickerId: "redstar-painted", top: "81%", right: "12%", width: 84, rotate: -14, floatY: 5, floatRot: 0.8, floatDur: 5.9, floatDelay: -0.8, depth: 0.54 },
  ],
};

// Map alias "orange-starburst" cleanly if used
const ID_ALIAS: Record<string, string> = {
  "orange-starburst": "starburst",
};

const MAX_SCROLL_NUDGE_PX = 20;

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

interface PageFloatingStickersProps {
  variant: FloatingFieldVariant;
  /** Optional custom scrollable container ref (e.g. Dashboard <main>). Defaults to window. */
  scrollContainerRef?: RefObject<HTMLElement | null>;
}

export function PageFloatingStickers({
  variant,
  scrollContainerRef,
}: PageFloatingStickersProps) {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const items = PLACEMENTS[variant];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const field = fieldRef.current;
    if (!field) return;

    const scrollTarget: Window | HTMLElement = scrollContainerRef?.current ?? window;
    const readScrollY = () =>
      scrollTarget === window
        ? window.scrollY
        : (scrollTarget as HTMLElement).scrollTop;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    field.style.setProperty("--pf-scroll-offset", "0px");

    let isReduced = reducedMotionQuery.matches;
    let isInView = true;
    let rafId = 0;
    let lastScrollY = readScrollY();
    let lastFrameTime = 0;
    let targetOffset = 0;
    let currentOffset = 0;

    const resetToRest = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      targetOffset = 0;
      currentOffset = 0;
      lastFrameTime = 0;
      field.style.setProperty("--pf-scroll-offset", "0px");
    };

    const tick = (now: number) => {
      rafId = 0;
      if (isReduced || !isInView) {
        resetToRest();
        return;
      }

      const dt = lastFrameTime ? Math.min(48, now - lastFrameTime) : 16.667;
      lastFrameTime = now;
      const frameScale = dt / 16.667;

      targetOffset *= Math.pow(0.84, frameScale);
      const alpha = 1 - Math.pow(1 - 0.095, frameScale);
      currentOffset += (targetOffset - currentOffset) * alpha;

      if (Math.abs(currentOffset) < 0.03 && Math.abs(targetOffset) < 0.03) {
        resetToRest();
        return;
      }

      field.style.setProperty("--pf-scroll-offset", `${currentOffset.toFixed(2)}px`);
      rafId = window.requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      const nextY = readScrollY();
      const dy = nextY - lastScrollY;
      lastScrollY = nextY;

      if (isReduced || !isInView || dy === 0) return;

      targetOffset = clamp(targetOffset - dy * 0.3, -MAX_SCROLL_NUDGE_PX, MAX_SCROLL_NUDGE_PX);

      if (!rafId) {
        lastFrameTime = 0;
        rafId = window.requestAnimationFrame(tick);
      }
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((entry) => entry.isIntersecting);
          isInView = visible;
          field.dataset.inview = visible ? "true" : "false";
          if (!visible) {
            resetToRest();
          } else {
            lastScrollY = readScrollY();
          }
        },
        { rootMargin: "160px 0px" },
      );
      observer.observe(field);
    } else {
      field.dataset.inview = "true";
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReduced = e.matches;
      if (isReduced) {
        resetToRest();
      } else {
        lastScrollY = readScrollY();
      }
    };

    scrollTarget.addEventListener("scroll", handleScroll, { passive: true });
    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", handleMotionChange);
    }

    return () => {
      scrollTarget.removeEventListener("scroll", handleScroll);
      if (typeof reducedMotionQuery.removeEventListener === "function") {
        reducedMotionQuery.removeEventListener("change", handleMotionChange);
      }
      if (observer) {
        observer.disconnect();
      }
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [scrollContainerRef]);

  return (
    <div
      ref={fieldRef}
      aria-hidden="true"
      data-inview="true"
      className="pf-field"
    >
      {items.map((item) => {
        const resolvedId = ID_ALIAS[item.stickerId] ?? item.stickerId;
        const sticker = STICKER_MAP[resolvedId];
        if (!sticker) return null;

        return (
          <div
            key={item.key}
            data-hide={item.hide}
            className="pf-sticker"
            style={
              {
                top: item.top,
                left: item.left,
                right: item.right,
                opacity: item.opacity ?? 0.94,
                "--pf-w": `${item.width}px`,
                transform: `rotate(${item.rotate}deg)`,
              } as CSSProperties
            }
          >
            <div
              className="pf-sticker-scroll"
              style={{ "--depth": item.depth } as CSSProperties}
            >
              <img
                src={sticker.src}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                className="pf-sticker-img"
                style={
                  {
                    "--float-y": `${item.floatY}px`,
                    "--float-rot": `${item.floatRot}deg`,
                    "--float-dur": `${item.floatDur}s`,
                    "--float-delay": `${item.floatDelay}s`,
                  } as CSSProperties
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
