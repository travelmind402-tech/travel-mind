import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import {
  CassetteTape,
  Clock,
  Crown,
  Hand,
  Lightbulb,
  Mail,
  Megaphone,
  MessageCircle,
  PenTool,
  Pin,
  Search,
  Sparkles,
} from "lucide-react";

export type StickerVariant =
  | "pushpin"
  | "clock"
  | "statue"
  | "speech"
  | "envelope"
  | "megaphone"
  | "chess"
  | "lightbulb"
  | "cassette"
  | "handpen"
  | "magnifier"
  | "star"
  | "newsbird"
  | "swallow";

export function useParallaxOffset(strength = 18) {
  const [offset, setOffset] = useState({ x: 0, y: 0, scrollY: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let rafId = 0;
    let nextX = 0;
    let nextY = 0;
    let nextScroll = window.scrollY;

    const flush = () => {
      rafId = 0;
      setOffset({ x: nextX, y: nextY, scrollY: nextScroll });
    };

    const schedule = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(flush);
      }
    };

    const handleMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      nextX = nx * strength;
      nextY = ny * strength;
      schedule();
    };

    const handleScroll = () => {
      nextScroll = window.scrollY;
      schedule();
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("scroll", handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [strength]);

  return offset;
}

/**
 * Zero-re-render GPU-composited motion driver.
 * Updates CSS custom properties (--mx, --my, --hero-progress, --scroll-y)
 * directly on the target container via a damped requestAnimationFrame loop.
 * Uses cursor tracking on desktop and touch + scroll drift on touch devices.
 */
function getStaticDocumentTop(el: HTMLElement): number {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

interface ParallaxItem {
  el: HTMLElement;
  anchorCenterY: number;
  speedY: number;
  speedX: number;
  speedRot: number;
}

export function useScrapbookMotion(
  targetRef: RefObject<HTMLElement | null>,
  heroRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const targetEl = targetRef.current;
    if (!targetEl) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      targetEl.style.setProperty("--mx", "0");
      targetEl.style.setProperty("--my", "0");
      targetEl.style.setProperty("--hero-progress", "0");
      targetEl.style.setProperty("--scroll-y", "0px");
      targetEl.style.setProperty("--sb-1", "0");
      targetEl.style.setProperty("--sb-2", "0");
      targetEl.style.setProperty("--sb-1-abs", "0");
      targetEl.style.setProperty("--sb-2-abs", "0");
      return;
    }

    const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    let targetMx = 0;
    let targetMy = 0;
    let currentMx = 0;
    let currentMy = 0;
    let targetScroll = window.scrollY;
    let currentScroll = window.scrollY;
    let lastScrollY = window.scrollY;
    let vh = window.innerHeight || 800;
    let heroTop = 0;
    let heroHeight = Math.max(420, vh * 0.85);
    let parallaxItems: ParallaxItem[] = [];
    let bounce1Pos = 0;
    let bounce1Vel = 0;
    let bounce2Pos = 0;
    let bounce2Vel = 0;
    let lastTime = 0;
    let rafId = 0;

    const measureAll = () => {
      vh = window.innerHeight || 800;
      const heroEl = heroRef?.current;
      if (heroEl) {
        heroTop = Math.max(0, getStaticDocumentTop(heroEl));
        heroHeight = Math.max(420, heroEl.offsetHeight || vh * 0.85);
      } else {
        heroTop = 0;
        heroHeight = Math.max(420, vh * 0.85);
      }

      const nodes = targetEl.querySelectorAll<HTMLElement>("[data-parallax-item]");
      const measured: ParallaxItem[] = [];
      nodes.forEach((el) => {
        const anchorEl = el.parentElement ?? el;
        const anchorTop = getStaticDocumentTop(anchorEl);
        const anchorH = anchorEl.offsetHeight || 120;
        measured.push({
          el,
          anchorCenterY: anchorTop + anchorH * 0.5,
          speedY: Number(el.dataset.parallaxSpeedY ?? 0),
          speedX: Number(el.dataset.parallaxSpeedX ?? 0),
          speedRot: Number(el.dataset.parallaxSpeedRot ?? 0),
        });
      });
      parallaxItems = measured;
    };

    const applyVars = () => {
      const relativeScroll = Math.max(0, currentScroll - heroTop);
      const heroProgress = Math.max(0, Math.min(2.2, relativeScroll / heroHeight));

      targetEl.style.setProperty("--mx", currentMx.toFixed(4));
      targetEl.style.setProperty("--my", currentMy.toFixed(4));
      targetEl.style.setProperty("--scroll-y", `${currentScroll.toFixed(1)}px`);
      targetEl.style.setProperty("--hero-progress", heroProgress.toFixed(4));
      targetEl.style.setProperty("--sb-1", bounce1Pos.toFixed(3));
      targetEl.style.setProperty("--sb-2", bounce2Pos.toFixed(3));
      targetEl.style.setProperty("--sb-1-abs", Math.abs(bounce1Pos).toFixed(3));
      targetEl.style.setProperty("--sb-2-abs", Math.abs(bounce2Pos).toFixed(3));

      const viewportCenterY = currentScroll + vh * 0.5;
      for (let i = 0; i < parallaxItems.length; i++) {
        const item = parallaxItems[i];
        const rawNorm = (viewportCenterY - item.anchorCenterY) / Math.max(1, vh);
        const norm = rawNorm < -1.35 ? -1.35 : rawNorm > 1.35 ? 1.35 : rawNorm;

        item.el.style.setProperty("--sp-y", `${(norm * item.speedY).toFixed(2)}px`);
        item.el.style.setProperty("--sp-x", `${(norm * item.speedX).toFixed(2)}px`);
        item.el.style.setProperty("--sp-rot", `${(norm * item.speedRot).toFixed(2)}deg`);
      }
    };

    const tick = (now: number) => {
      rafId = 0;
      const dt = lastTime ? Math.min(0.032, Math.max(0.004, (now - lastTime) / 1000)) : 0.016;
      lastTime = now;

      if (isTouchDevice) {
        targetMx = Math.sin(targetScroll * 0.0038) * 0.42;
        targetMy = Math.cos(targetScroll * 0.0031) * 0.36;
      }

      const dx = targetMx - currentMx;
      const dy = targetMy - currentMy;
      const ds = targetScroll - currentScroll;

      const ptrAlpha = 1 - Math.pow(1 - 0.11, dt / 0.01667);
      const scrollAlpha = 1 - Math.pow(1 - 0.16, dt / 0.01667);

      currentMx += dx * ptrAlpha;
      currentMy += dy * ptrAlpha;
      currentScroll += ds * scrollAlpha;

      // Subtle underdamped harmonic spring 1 (gentle cushioned bounce on scroll)
      const a1 = -130 * bounce1Pos - 11.2 * bounce1Vel;
      bounce1Vel += a1 * dt;
      bounce1Pos += bounce1Vel * dt;
      bounce1Pos = Math.max(-18, Math.min(18, bounce1Pos));

      // Subtle underdamped harmonic spring 2 (staggered soft rebound)
      const a2 = -96 * bounce2Pos - 9.6 * bounce2Vel;
      bounce2Vel += a2 * dt;
      bounce2Pos += bounce2Vel * dt;
      bounce2Pos = Math.max(-18, Math.min(18, bounce2Pos));

      const springSettled =
        Math.abs(bounce1Pos) < 0.04 &&
        Math.abs(bounce1Vel) < 0.45 &&
        Math.abs(bounce2Pos) < 0.04 &&
        Math.abs(bounce2Vel) < 0.45;

      const settled =
        springSettled &&
        Math.abs(dx) < 0.0015 &&
        Math.abs(dy) < 0.0015 &&
        Math.abs(ds) < 0.25;

      if (settled) {
        currentMx = targetMx;
        currentMy = targetMy;
        currentScroll = targetScroll;
        bounce1Pos = 0;
        bounce1Vel = 0;
        bounce2Pos = 0;
        bounce2Vel = 0;
        lastTime = 0;
      }

      applyVars();

      if (!settled) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const schedule = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      targetMx = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      targetMy = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      schedule();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      targetMx = (touch.clientX / Math.max(1, window.innerWidth) - 0.5) * 1.3;
      targetMy = (touch.clientY / Math.max(1, window.innerHeight) - 0.5) * 1.1;
      schedule();
    };

    const handleScroll = () => {
      const nextScroll = window.scrollY;
      const delta = nextScroll - lastScrollY;
      lastScrollY = nextScroll;
      targetScroll = nextScroll;

      const impulse = Math.max(-34, Math.min(34, delta * 0.45));
      bounce1Vel += impulse * 7.2;
      bounce2Vel += impulse * 5.8;

      schedule();
    };

    const handleResize = () => {
      measureAll();
      applyVars();
    };

    const handlePointerLeave = () => {
      targetMx = 0;
      targetMy = 0;
      schedule();
    };

    measureAll();
    applyVars();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        measureAll();
        applyVars();
      });
      resizeObserver.observe(targetEl);
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("load", handleResize, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("load", handleResize);
      document.removeEventListener("mouseleave", handlePointerLeave);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [targetRef, heroRef]);
}

export function useDiaryReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, revealed };
}

interface StickerConfig {
  primarySrc: string;
  fallbackSrc?: string;
  alt: string;
  label: string;
  width: number;
  height: number;
  accentBg: string;
  accentText: string;
  PlaceholderIcon: typeof Pin;
}

const STICKER_ASSETS: Record<StickerVariant, StickerConfig> = {
  pushpin: {
    primarySrc: "/stickers/pushpin.png",
    alt: "Pushpin sticker for destinations",
    label: "Destinations",
    width: 240,
    height: 240,
    accentBg: "bg-[#4C9DB0]",
    accentText: "text-[#163E48]",
    PlaceholderIcon: Pin,
  },
  clock: {
    primarySrc: "/stickers/clock.png",
    alt: "Clock sticker for timing",
    label: "Timing",
    width: 240,
    height: 240,
    accentBg: "bg-[#FFEBAF]",
    accentText: "text-[#163E48]",
    PlaceholderIcon: Clock,
  },
  statue: {
    primarySrc: "/assets/aistudio/image_8d05b2f7.png",
    alt: "Classical statue head collage sticker",
    label: "Culture",
    width: 334,
    height: 260,
    accentBg: "bg-[#FFF8E0]",
    accentText: "text-[#163E48]",
    PlaceholderIcon: Sparkles,
  },
  speech: {
    primarySrc: "/assets/aistudio/image_9793eea3.png",
    alt: "Paper speech bubble sticker for AI chat",
    label: "AI chat",
    width: 335,
    height: 232,
    accentBg: "bg-[#1F4F5B]",
    accentText: "text-[#FFEBAF]",
    PlaceholderIcon: MessageCircle,
  },
  envelope: {
    primarySrc: "/assets/aistudio/image_1b8d6268.png",
    alt: "Vintage travel envelope sticker for saved trips",
    label: "Saved trips",
    width: 487,
    height: 480,
    accentBg: "bg-[#FFEBAF]",
    accentText: "text-[#163E48]",
    PlaceholderIcon: Mail,
  },
  megaphone: {
    primarySrc: "/assets/aistudio/image_4eab9a73.png",
    alt: "Megaphone sticker for travel alerts",
    label: "Alerts",
    width: 546,
    height: 447,
    accentBg: "bg-[#4C9DB0]",
    accentText: "text-[#163E48]",
    PlaceholderIcon: Megaphone,
  },
  chess: {
    primarySrc: "/stickers/chess-king.png",
    alt: "Chess king sticker for trip planning",
    label: "Planning",
    width: 240,
    height: 240,
    accentBg: "bg-[#1F4F5B]",
    accentText: "text-[#FFEBAF]",
    PlaceholderIcon: Crown,
  },
  lightbulb: {
    primarySrc: "/assets/aistudio/image_79080a9a.png",
    alt: "Lightbulb sticker for trip ideas",
    label: "Ideas",
    width: 481,
    height: 460,
    accentBg: "bg-[#FFEBAF]",
    accentText: "text-[#163E48]",
    PlaceholderIcon: Lightbulb,
  },
  cassette: {
    primarySrc: "/assets/aistudio/image_c52e4d36.png",
    alt: "Cassette sticker for trip soundtrack",
    label: "Soundtrack",
    width: 502,
    height: 328,
    accentBg: "bg-[#1F4F5B]",
    accentText: "text-[#FFEBAF]",
    PlaceholderIcon: CassetteTape,
  },
  handpen: {
    primarySrc: "/stickers/hand-with-pen.png",
    alt: "Hand with pen sticker for notes",
    label: "Notes",
    width: 240,
    height: 240,
    accentBg: "bg-[#FFF8E0]",
    accentText: "text-[#163E48]",
    PlaceholderIcon: PenTool,
  },
  magnifier: {
    primarySrc: "/stickers/hand-with-magnifier.png",
    alt: "Hand with magnifier sticker for local research",
    label: "Details",
    width: 240,
    height: 240,
    accentBg: "bg-[#FFF8E0]",
    accentText: "text-[#163E48]",
    PlaceholderIcon: Search,
  },
  star: {
    primarySrc: "/assets/aistudio/image_6c85416c.png",
    alt: "Vintage enamel star sticker",
    label: "Highlight",
    width: 303,
    height: 327,
    accentBg: "bg-[#4C9DB0]",
    accentText: "text-[#163E48]",
    PlaceholderIcon: Hand,
  },
  newsbird: {
    primarySrc: "/assets/aistudio/image_023f72af.png",
    alt: "Newspaper collage flying bird sticker",
    label: "Dispatch",
    width: 340,
    height: 297,
    accentBg: "bg-[#FFF8E0]",
    accentText: "text-[#163E48]",
    PlaceholderIcon: Mail,
  },
  swallow: {
    primarySrc: "/assets/aistudio/image_b2616dd1.png",
    alt: "Vintage swallow bird sticker",
    label: "Flight",
    width: 341,
    height: 276,
    accentBg: "bg-[#FFF8E0]",
    accentText: "text-[#163E48]",
    PlaceholderIcon: Sparkles,
  },
};

export function ScrapbookSticker({
  variant,
  className = "",
  decorative = true,
  eager = false,
  interactive = true,
}: {
  variant: StickerVariant;
  className?: string;
  decorative?: boolean;
  eager?: boolean;
  interactive?: boolean;
}) {
  const asset = STICKER_ASSETS[variant];
  const [src, setSrc] = useState<string>(asset.primarySrc);
  const [missing, setMissing] = useState<boolean>(false);

  useEffect(() => {
    setSrc(asset.primarySrc);
    setMissing(false);
  }, [asset.primarySrc]);

  const handleUnavailable = () => {
    if (asset.fallbackSrc && src !== asset.fallbackSrc) {
      setSrc(asset.fallbackSrc);
      return;
    }
    setMissing(true);
  };

  if (missing) {
    const Icon = asset.PlaceholderIcon;
    return (
      <div
        aria-hidden={decorative}
        title={decorative ? undefined : asset.label}
        className={`${interactive ? "sticker-wobble" : ""} inline-flex flex-col items-center justify-center gap-1 rounded-2xl border-[1.5px] border-dashed border-[#1F4F5B]/65 px-3 py-2.5 shadow-[2px_3px_0_rgba(76,157,176,0.35)] select-none ${asset.accentBg} ${asset.accentText} ${className}`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="font-note text-[10px] font-bold leading-none whitespace-nowrap">
          {asset.label}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={decorative ? "" : asset.alt}
      aria-hidden={decorative}
      width={asset.width}
      height={asset.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      referrerPolicy="no-referrer"
      onError={handleUnavailable}
      onLoad={(e) => {
        if (e.currentTarget.naturalWidth === 0) {
          handleUnavailable();
        }
      }}
      className={`${interactive ? "sticker-wobble pointer-events-auto" : "pointer-events-none"} w-full h-auto block select-none drop-shadow-[2px_4px_0_rgba(31,79,91,0.3)] drop-shadow-[0_6px_12px_rgba(22,62,72,0.12)] ${className}`}
    />
  );
}

export interface FloatingStickerProps {
  variant: StickerVariant;
  className?: string;
  restRotate?: number;
  enterX?: number;
  enterY?: number;
  enterRotate?: number;
  enterScale?: number;
  enterDelayMs?: number;
  enterDurationMs?: number;
  driftVariant?: "a" | "b" | "c" | "d" | "e" | "f";
  driftDurationSec?: number;
  driftPhaseSec?: number;
  parallaxX?: number;
  parallaxY?: number;
  parallaxRotate?: number;
  scrollX?: number;
  scrollY?: number;
  scrollRotate?: number;
  parallaxSpeedY?: number;
  parallaxSpeedX?: number;
  parallaxSpeedRot?: number;
  scrollBounce?: "a" | "b";
  bounceY?: number;
  bounceRotate?: number;
  bounceScale?: number;
  eager?: boolean;
}

export function FloatingScrapbookSticker({
  variant,
  className = "",
  restRotate = 0,
  enterX = -80,
  enterY = -80,
  enterRotate = -22,
  enterScale = 0.65,
  enterDelayMs = 120,
  enterDurationMs = 820,
  driftVariant = "a",
  driftDurationSec = 7.8,
  driftPhaseSec,
  parallaxX = 14,
  parallaxY = 12,
  parallaxRotate = 2,
  scrollX = 0,
  scrollY = -120,
  scrollRotate = 0,
  parallaxSpeedY,
  parallaxSpeedX = 0,
  parallaxSpeedRot = 0,
  scrollBounce,
  bounceY = 0.72,
  bounceRotate = 0.16,
  bounceScale = 0.0025,
  eager = false,
}: FloatingStickerProps) {
  const useSectionParallax = parallaxSpeedY !== undefined;

  const parallaxStyle = {
    "--px-x": `${parallaxX}px`,
    "--px-y": `${parallaxY}px`,
    "--px-rot": `${parallaxRotate}deg`,
    "--scroll-x": `${scrollX}px`,
    "--scroll-y": `${scrollY}px`,
    "--scroll-rot": `${scrollRotate}deg`,
    ...(scrollBounce
      ? {
          "--bounce-y": `${bounceY}px`,
          "--bounce-rot": `${bounceRotate}deg`,
          "--bounce-scale": `${bounceScale}`,
        }
      : {}),
  } as CSSProperties;

  const enterStyle = {
    "--enter-x": `${enterX}px`,
    "--enter-y": `${enterY}px`,
    "--enter-rot": `${enterRotate}deg`,
    "--enter-scale": `${enterScale}`,
    "--enter-delay": `${enterDelayMs}ms`,
    "--enter-dur": `${enterDurationMs}ms`,
    "--sticker-rot": `${restRotate}deg`,
  } as CSSProperties;

  const driftDelayValue =
    driftPhaseSec !== undefined
      ? `${driftPhaseSec}s`
      : `${Math.max(0, enterDelayMs + enterDurationMs - 140)}ms`;

  const driftStyle = {
    "--drift-dur": `${driftDurationSec}s`,
    "--drift-delay": driftDelayValue,
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    >
      <div
        className="sticker-parallax"
        data-parallax-item={useSectionParallax ? "true" : undefined}
        data-parallax-speed-y={useSectionParallax ? parallaxSpeedY : undefined}
        data-parallax-speed-x={useSectionParallax ? parallaxSpeedX : undefined}
        data-parallax-speed-rot={useSectionParallax ? parallaxSpeedRot : undefined}
        data-scroll-bounce={scrollBounce}
        style={parallaxStyle}
      >
        <div className="sticker-enter" style={enterStyle}>
          <div className={`sticker-drift-${driftVariant}`} style={driftStyle}>
            <ScrapbookSticker
              variant={variant}
              eager={eager}
              interactive={false}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
