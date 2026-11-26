import { useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { ArrowDown } from "lucide-react";

/**
 * All existing PNG assets in /artifacts/travelmind/public/assets/aistudio.
 * Swap or append PNG paths in this single array to update the tunnel cards.
 */
export const cardImages: string[] = [
  "/assets/aistudio/image_023f72af.png",
  "/assets/aistudio/image_1b8d6268.png",
  "/assets/aistudio/image_4eab9a73.png",
  "/assets/aistudio/image_6c85416c.png",
  "/assets/aistudio/image_79080a9a.png",
  "/assets/aistudio/image_8d05b2f7.png",
  "/assets/aistudio/image_9793eea3.png",
  "/assets/aistudio/image_b2616dd1.png",
  "/assets/aistudio/image_c52e4d36.png",
];

interface CardSlotPreset {
  width: number;
  xVw: number;
  yVh: number;
  rotZ: number;
  rotX: number;
  rotY: number;
  startZ: number;
  endZ: number;
  startP: number;
  endP: number;
  exitDirX: number;
  exitDirY: number;
}

interface TunnelCardSpec extends CardSlotPreset {
  id: string;
  src: string;
  label: string;
}

const BASE_CARD_SLOTS: CardSlotPreset[] = [
  // Card 0 — upper-left foreground sweep
  {
    width: 242,
    xVw: -24,
    yVh: -16,
    rotZ: -7,
    rotX: 4,
    rotY: 7,
    startZ: -1680,
    endZ: 820,
    startP: 0.09,
    endP: 0.61,
    exitDirX: -0.92,
    exitDirY: -0.58,
  },
  // Card 1 — near-center right, overlaps headline mid-flight (faster foreground parallax)
  {
    width: 286,
    xVw: 7,
    yVh: -6,
    rotZ: 6,
    rotX: -3,
    rotY: -5,
    startZ: -1780,
    endZ: 845,
    startP: 0.13,
    endP: 0.64,
    exitDirX: 0.74,
    exitDirY: -0.66,
  },
  // Card 2 — lower-right flank (slower midground parallax)
  {
    width: 212,
    xVw: 26,
    yVh: 15,
    rotZ: -8,
    rotX: 5,
    rotY: -8,
    startZ: -1580,
    endZ: 790,
    startP: 0.16,
    endP: 0.68,
    exitDirX: 0.96,
    exitDirY: 0.56,
  },
  // Card 3 — lower-left near center, overlaps headline bottom-left
  {
    width: 196,
    xVw: -9,
    yVh: 14,
    rotZ: 9,
    rotX: -5,
    rotY: 6,
    startZ: -1660,
    endZ: 815,
    startP: 0.21,
    endP: 0.71,
    exitDirX: -0.78,
    exitDirY: 0.72,
  },
  // Card 4 — upper-right large card (fast foreground parallax)
  {
    width: 274,
    xVw: 22,
    yVh: -19,
    rotZ: -5,
    rotX: 3,
    rotY: -6,
    startZ: -1840,
    endZ: 855,
    startP: 0.25,
    endP: 0.73,
    exitDirX: 0.88,
    exitDirY: -0.76,
  },
  // Card 5 — lower-left outer flank
  {
    width: 228,
    xVw: -27,
    yVh: 17,
    rotZ: 7,
    rotX: -4,
    rotY: 8,
    startZ: -1640,
    endZ: 810,
    startP: 0.29,
    endP: 0.75,
    exitDirX: -0.96,
    exitDirY: 0.62,
  },
  // Card 6 — upper-center large card, passes right across headline
  {
    width: 296,
    xVw: -4,
    yVh: -12,
    rotZ: -6,
    rotX: 4,
    rotY: 4,
    startZ: -1860,
    endZ: 860,
    startP: 0.33,
    endP: 0.77,
    exitDirX: -0.62,
    exitDirY: -0.84,
  },
  // Card 7 — bottom-right accent card
  {
    width: 204,
    xVw: 16,
    yVh: 22,
    rotZ: 10,
    rotX: -6,
    rotY: -7,
    startZ: -1600,
    endZ: 800,
    startP: 0.37,
    endP: 0.79,
    exitDirX: 0.82,
    exitDirY: 0.82,
  },
  // Card 8 — final card overlapping headline center-low, clears cleanly by p = 0.81
  {
    width: 256,
    xVw: 5,
    yVh: 7,
    rotZ: -9,
    rotX: 5,
    rotY: -4,
    startZ: -1760,
    endZ: 840,
    startP: 0.40,
    endP: 0.81,
    exitDirX: 0.76,
    exitDirY: 0.68,
  },
];

function formatCardLabel(src: string): string {
  const filename = src.split("/").pop() ?? "";
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .toUpperCase();
}

function buildTunnelCards(images: string[]): TunnelCardSpec[] {
  if (images.length === 0) return [];
  const totalCount = Math.max(9, images.length);
  const cards: TunnelCardSpec[] = [];

  for (let i = 0; i < totalCount; i++) {
    const src = images[i % images.length];
    const label = formatCardLabel(src);

    if (i < BASE_CARD_SLOTS.length && totalCount === BASE_CARD_SLOTS.length) {
      cards.push({
        ...BASE_CARD_SLOTS[i],
        id: `tunnel-card-${i}`,
        src,
        label,
      });
    } else {
      const preset = BASE_CARD_SLOTS[i % BASE_CARD_SLOTS.length];
      const tIndex = totalCount > 1 ? i / (totalCount - 1) : 0;
      const angle = i * 2.399963229728653; // Golden angle distribution
      const radiusX = i % 3 === 1 ? 8 : 24;
      const radiusY = i % 3 === 1 ? 10 : 19;
      const xVw = i < BASE_CARD_SLOTS.length ? preset.xVw : Math.cos(angle) * radiusX;
      const yVh = i < BASE_CARD_SLOTS.length ? preset.yVh : Math.sin(angle) * radiusY;
      const startP = 0.09 + tIndex * 0.31;
      const duration = 0.41 + (i % 3) * 0.04;
      const endP = Math.min(0.81, startP + duration);
      const len = Math.hypot(xVw, yVh) || 1;

      cards.push({
        id: `tunnel-card-${i}`,
        src,
        label,
        width: 190 + ((i * 37) % 105),
        xVw,
        yVh,
        rotZ: ((i % 2 === 0 ? -1 : 1) * (4 + ((i * 3) % 7))),
        rotX: ((i % 2 === 0 ? 1 : -1) * (3 + (i % 4))),
        rotY: ((i % 3 === 0 ? 1 : -1) * (4 + (i % 5))),
        startZ: -1620 - ((i * 60) % 240),
        endZ: 800 + ((i * 17) % 60),
        startP,
        endP,
        exitDirX: xVw / len || (i % 2 === 0 ? -0.8 : 0.8),
        exitDirY: yVh / len || (i % 2 === 0 ? -0.6 : 0.6),
      });
    }
  }

  return cards;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export interface PerspectiveTunnelHeroProps {
  revealTargetRef?: RefObject<HTMLDivElement | null>;
}

export function PerspectiveTunnelHero({ revealTargetRef }: PerspectiveTunnelHeroProps = {}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const ringsRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLDivElement | null>(null);
  const scrollCueRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const cards = useMemo(() => buildTunnelCards(cardImages), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mq.matches);
    handleChange();
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const revealEl = revealTargetRef?.current;

    if (prefersReducedMotion) {
      if (revealEl) {
        revealEl.style.opacity = "";
        revealEl.style.transform = "";
        revealEl.style.pointerEvents = "";
      }
      return;
    }

    if (typeof window === "undefined") return;
    const trackEl = trackRef.current;
    if (!trackEl) return;

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let endScrollY = 1;
    let targetP = 0;
    let displayedP = 0;
    let rafId = 0;
    let lastTimestamp = 0;

    const measure = () => {
      vw = window.innerWidth || 1280;
      vh = window.innerHeight || 800;
      const rect = trackEl.getBoundingClientRect();
      const trackBottomDocY = rect.bottom + window.scrollY;
      endScrollY = Math.max(1, trackBottomDocY - vh);
      targetP = clamp01(window.scrollY / endScrollY);
    };

    const applyFrame = (p: number) => {
      // 1. Existing Headline: p 0-0.15 dim (~15%) -> 100%, clean solo beat 0.81-0.84, fade out 0.84-0.93
      const headlineEl = headlineRef.current;
      if (headlineEl) {
        const fadeIn = smoothstep(0.0, 0.15, p);
        const fadeOut = smoothstep(0.84, 0.93, p);
        const headlineOpacity = (0.15 + 0.85 * fadeIn) * (1 - fadeOut);
        const headlineScale = 0.965 + 0.035 * fadeIn + 0.035 * fadeOut;
        const headlineShiftY = -18 * fadeOut;

        headlineEl.style.opacity = headlineOpacity.toFixed(4);
        headlineEl.style.transform = `translate3d(0, ${headlineShiftY.toFixed(2)}px, 0) scale(${headlineScale.toFixed(4)})`;
      }

      // 2. Faint concentric rings behind headline
      const ringsEl = ringsRef.current;
      if (ringsEl) {
        const ringsIn = smoothstep(0.0, 0.18, p);
        const ringsOut = smoothstep(0.82, 0.92, p);
        const ringsOpacity = (0.35 + 0.65 * ringsIn) * (1 - ringsOut);
        const ringsScale = 0.92 + 0.22 * p;

        ringsEl.style.opacity = ringsOpacity.toFixed(4);
        ringsEl.style.transform = `translate3d(0, 0, 0) scale(${ringsScale.toFixed(4)})`;
      }

      // 3. Existing subtle scroll cue fades out as soon as scrolling begins
      const cueEl = scrollCueRef.current;
      if (cueEl) {
        const cueOpacity = 1 - smoothstep(0.02, 0.12, p);
        cueEl.style.opacity = cueOpacity.toFixed(4);
      }

      // 4. 3D Tunnel Cards: p 0.10-0.70 flight, p 0.60-0.81 exit past camera edges
      const spreadScale = vw < 640 ? 0.72 : vw < 1024 ? 0.88 : 1.0;

      for (let i = 0; i < cards.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const card = cards[i];

        if (p <= card.startP || p >= card.endP) {
          el.style.opacity = "0";
          const restZ = p <= card.startP ? card.startZ : card.endZ;
          el.style.transform = `translate3d(0px, 0px, ${restZ}px)`;
          continue;
        }

        const localT = clamp01((p - card.startP) / (card.endP - card.startP));
        const zEase = Math.pow(localT, 1.12);
        const z = card.startZ + (card.endZ - card.startZ) * zEase;

        const posFactor = 0.22 + localT * 1.16;
        const exitPush = smoothstep(0.66, 1.0, localT);

        const tx =
          card.xVw * (vw / 100) * spreadScale * posFactor +
          card.exitDirX * vw * 0.28 * exitPush;
        const ty =
          card.yVh * (vh / 100) * spreadScale * posFactor +
          card.exitDirY * vh * 0.24 * exitPush;

        const rz = card.rotZ + (localT - 0.5) * (card.rotZ >= 0 ? 5 : -5);
        const rx = card.rotX * (1 - localT * 0.35);
        const ry = card.rotY * (1 - localT * 0.35);

        const enterAlpha = smoothstep(0.0, 0.20, localT);
        const exitAlpha = 1 - smoothstep(0.70, 0.98, localT);
        const opacity = enterAlpha * exitAlpha;

        el.style.opacity = opacity.toFixed(4);
        el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, ${z.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
      }

      // 5. Existing Home Page Content Reveal: p 0.89-1.00 fade & slide in smoothly
      const targetRevealEl = revealTargetRef?.current;
      if (targetRevealEl) {
        const reveal = smoothstep(0.89, 0.995, p);
        targetRevealEl.style.opacity = reveal.toFixed(4);

        if (reveal >= 0.999) {
          targetRevealEl.style.transform = "";
          targetRevealEl.style.pointerEvents = "auto";
        } else {
          const slideY = (1 - reveal) * 42;
          targetRevealEl.style.transform = `translate3d(0, ${slideY.toFixed(1)}px, 0)`;
          targetRevealEl.style.pointerEvents = reveal > 0.2 ? "auto" : "none";
        }
      }
    };

    const tick = (now: number) => {
      rafId = 0;
      const dt = lastTimestamp ? Math.min(64, Math.max(4, now - lastTimestamp)) : 16.667;
      lastTimestamp = now;

      // Inertial lerp (~0.10 per 60Hz frame, normalized across refresh rates)
      const alpha = 1 - Math.pow(1 - 0.1, dt / 16.667);
      const diff = targetP - displayedP;

      if (Math.abs(diff) < 0.00025) {
        displayedP = targetP;
        applyFrame(displayedP);
        lastTimestamp = 0;
        return;
      }

      displayedP += diff * alpha;
      applyFrame(displayedP);
      rafId = window.requestAnimationFrame(tick);
    };

    const schedule = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handleScroll = () => {
      targetP = clamp01(window.scrollY / endScrollY);
      schedule();
    };

    const handleResize = () => {
      measure();
      applyFrame(displayedP);
      schedule();
    };

    measure();
    displayedP = targetP;
    applyFrame(displayedP);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("load", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("load", handleResize);
      if (rafId) window.cancelAnimationFrame(rafId);
      if (revealEl) {
        revealEl.style.opacity = "";
        revealEl.style.transform = "";
        revealEl.style.pointerEvents = "";
      }
    };
  }, [cards, prefersReducedMotion, revealTargetRef]);

  // Respect prefers-reduced-motion: skip animation and show the page exactly as it currently looks
  if (prefersReducedMotion) {
    return (
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 overflow-hidden bg-transparent">
        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          <blockquote className="font-display uppercase text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-wide text-[#163E48]">
            Every journey starts in the mind.
          </blockquote>
          <p className="font-note text-sm sm:text-base font-bold text-[#2A5C69] tracking-widest">
            - TravelMind
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={trackRef}
      aria-label="TravelMind visual intro"
      className="tunnel-intro-track bg-transparent"
    >
      <div className="tunnel-intro-stage bg-transparent">
        {/* Barely visible concentric ring outlines centered behind the headline */}
        <div ref={ringsRef} aria-hidden="true" className="tunnel-rings">
          <span className="tunnel-ring tunnel-ring-1" />
          <span className="tunnel-ring tunnel-ring-2" />
          <span className="tunnel-ring tunnel-ring-3" />
          <span className="tunnel-ring tunnel-ring-4" />
        </div>

        {/* Reused existing Center Headline Block (exact font, color, and size) */}
        <div
          ref={headlineRef}
          style={{ opacity: 0.15 }}
          className="tunnel-headline-wrap max-w-2xl mx-auto px-6 text-center"
        >
          <blockquote className="font-display uppercase text-[clamp(2.5rem,6.5vw,5.25rem)] leading-[0.95] tracking-wide text-[#163E48] text-balance">
            Every journey starts in the mind.
          </blockquote>
          <p className="mt-4 font-note text-sm sm:text-base font-bold text-[#2A5C69] tracking-widest">
            - TravelMind
          </p>
        </div>

        {/* 3D Perspective Card Layer — sits ABOVE headline while passing, BELOW navbar */}
        <div aria-hidden="true" className="tunnel-card-layer">
          {cards.map((card, index) => (
            <div
              key={card.id}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              style={{ "--card-w": `${card.width}px` } as CSSProperties}
              className="tunnel-card"
            >
              <img
                src={card.src}
                alt=""
                aria-hidden="true"
                loading="eager"
                decoding="async"
                draggable={false}
                className="tunnel-card-img"
              />
              <div className="tunnel-card-scrim" />
              <span className="tunnel-card-label">{card.label}</span>
            </div>
          ))}
        </div>

        {/* Existing Scroll Cue Prompt */}
        <div
          ref={scrollCueRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-xs font-note text-[#2A5C69] pointer-events-none"
        >
          <span>Scroll</span>
          <span className="w-7 h-7 rounded-full border border-[#1F4F5B]/45 bg-[#FFF8E0] flex items-center justify-center shadow-sm">
            <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#163E48]" />
          </span>
        </div>
      </div>
    </section>
  );
}
