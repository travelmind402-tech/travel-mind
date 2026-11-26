import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";

/**
 * All existing PNG images in the project's public asset folders.
 * Swap or reorder paths in this single array to update the intro cards.
 */
export const introImages: string[] = [
  "/assets/aistudio/image_023f72af.png",
  "/assets/aistudio/image_1b8d6268.png",
  "/assets/aistudio/image_4eab9a73.png",
  "/assets/aistudio/image_6c85416c.png",
  "/assets/aistudio/image_79080a9a.png",
  "/assets/aistudio/image_8d05b2f7.png",
  "/assets/aistudio/image_9793eea3.png",
  "/assets/aistudio/image_b2616dd1.png",
  "/assets/aistudio/image_c52e4d36.png",
  "/stickers/butterflies.png",
  "/stickers/calico-cat.png",
  "/stickers/film-camera.png",
  "/stickers/orange-starburst.png",
  "/stickers/red-star-painted.png",
  "/stickers/space-cat.png",
  "/stickers/sunflower-collage.png",
];

interface CardSlot {
  /** Base card width in px on desktop (portrait 3:4 aspect ratio) */
  width: number;
  /** Fixed x offset from viewport center in vw */
  xVw: number;
  /** Fixed y offset from viewport center in vh */
  yVh: number;
  /** Scattered tilt angles in degrees */
  rotZ: number;
  rotX: number;
  rotY: number;
  /** Starting depth along Z axis (far distance) */
  startZ: number;
  /** Ending depth along Z axis (approaching/passing camera, < perspective) */
  endZ: number;
  /** Progress window [startP, endP] within Acts 2 & 3 (0.08–0.75) */
  startP: number;
  endP: number;
  /** Outward radial drift multiplier as card passes camera */
  driftX: number;
  driftY: number;
  /** Parallax speed exponent (higher = nearer/faster acceleration) */
  speedPower: number;
}

/**
 * 16 scattered 3D flight slots: some cross directly over the quote,
 * others sweep past the sides, above, and below with varied depth & parallax.
 * Timeline:
 *  - Act 1 (0.00–0.08): no cards visible
 *  - Act 2 (0.08–0.55): cards emerge staggered from center depth
 *  - Act 3 (0.45–0.75): cards zoom past camera and fade out completely by 0.74
 */
const CARD_SLOTS: CardSlot[] = [
  { width: 224, xVw: -20, yVh: -14, rotZ: -7, rotX: 4, rotY: 6, startZ: -1720, endZ: 840, startP: 0.085, endP: 0.46, driftX: -0.95, driftY: -0.62, speedPower: 1.55 },
  { width: 262, xVw: 4, yVh: -5, rotZ: 6, rotX: -4, rotY: -5, startZ: -1860, endZ: 865, startP: 0.11, endP: 0.485, driftX: 0.58, driftY: -0.52, speedPower: 1.72 },
  { width: 204, xVw: 23, yVh: 13, rotZ: -8, rotX: 5, rotY: -7, startZ: -1640, endZ: 825, startP: 0.135, endP: 0.505, driftX: 0.98, driftY: 0.58, speedPower: 1.42 },
  { width: 238, xVw: -7, yVh: 9, rotZ: 9, rotX: -5, rotY: 6, startZ: -1780, endZ: 855, startP: 0.16, endP: 0.53, driftX: -0.68, driftY: 0.64, speedPower: 1.66 },
  { width: 254, xVw: 19, yVh: -18, rotZ: -5, rotX: 3, rotY: -6, startZ: -1920, endZ: 870, startP: 0.185, endP: 0.555, driftX: 0.88, driftY: -0.78, speedPower: 1.75 },
  { width: 212, xVw: -24, yVh: 16, rotZ: -9, rotX: -4, rotY: 8, startZ: -1680, endZ: 830, startP: 0.21, endP: 0.575, driftX: -1.02, driftY: 0.68, speedPower: 1.46 },
  { width: 270, xVw: -2, yVh: -2, rotZ: 5, rotX: 4, rotY: -4, startZ: -1980, endZ: 875, startP: 0.235, endP: 0.595, driftX: -0.42, driftY: -0.68, speedPower: 1.8 },
  { width: 218, xVw: -15, yVh: -21, rotZ: 8, rotX: 5, rotY: 5, startZ: -1740, endZ: 845, startP: 0.26, endP: 0.615, driftX: -0.76, driftY: -0.88, speedPower: 1.52 },
  { width: 246, xVw: 14, yVh: 5, rotZ: -6, rotX: -3, rotY: -7, startZ: -1820, endZ: 860, startP: 0.285, endP: 0.63, driftX: 0.86, driftY: 0.34, speedPower: 1.68 },
  { width: 198, xVw: -25, yVh: -3, rotZ: 10, rotX: -5, rotY: 7, startZ: -1620, endZ: 820, startP: 0.31, endP: 0.645, driftX: -1.04, driftY: -0.22, speedPower: 1.38 },
  { width: 258, xVw: 7, yVh: 17, rotZ: -7, rotX: 4, rotY: -5, startZ: -1890, endZ: 868, startP: 0.335, endP: 0.665, driftX: 0.62, driftY: 0.84, speedPower: 1.74 },
  { width: 226, xVw: 25, yVh: -9, rotZ: 7, rotX: -4, rotY: -8, startZ: -1750, endZ: 842, startP: 0.36, endP: 0.68, driftX: 1.04, driftY: -0.44, speedPower: 1.54 },
  { width: 266, xVw: -5, yVh: -12, rotZ: -4, rotX: 3, rotY: 5, startZ: -1940, endZ: 872, startP: 0.385, endP: 0.695, driftX: -0.56, driftY: -0.74, speedPower: 1.78 },
  { width: 214, xVw: -17, yVh: 19, rotZ: 6, rotX: -5, rotY: 6, startZ: -1700, endZ: 835, startP: 0.41, endP: 0.71, driftX: -0.84, driftY: 0.88, speedPower: 1.48 },
  { width: 244, xVw: 16, yVh: -15, rotZ: -10, rotX: 5, rotY: -6, startZ: -1840, endZ: 858, startP: 0.435, endP: 0.725, driftX: 0.9, driftY: -0.72, speedPower: 1.65 },
  { width: 232, xVw: 3, yVh: 4, rotZ: 8, rotX: -4, rotY: 4, startZ: -1790, endZ: 852, startP: 0.46, endP: 0.74, driftX: 0.52, driftY: 0.66, speedPower: 1.6 },
];

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

interface ScrollIntroFlythroughProps {
  /** Existing quote element reused as-is without restyling */
  quote: ReactNode;
  /** Ref to the existing home content wrapper that fades in during Act 6 */
  revealTargetRef: RefObject<HTMLDivElement | null>;
}

export function ScrollIntroFlythrough({
  quote,
  revealTargetRef,
}: ScrollIntroFlythroughProps) {
  const trackRef = useRef<HTMLElement | null>(null);
  const quoteWrapRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const cards = CARD_SLOTS.map((slot, index) => ({
    ...slot,
    id: `intro-card-${index}`,
    src: introImages[index % introImages.length],
  }));

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const trackEl = trackRef.current;
    if (!trackEl) return;

    const setIntroState = (done: boolean) => {
      const next = done ? "done" : "playing";
      if (document.documentElement.dataset.intro !== next) {
        document.documentElement.dataset.intro = next;
        window.dispatchEvent(
          new CustomEvent("travelmind:intro-change", { detail: { done } }),
        );
      }
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setIntroState(true);
      return;
    }

    const rect = trackEl.getBoundingClientRect();
    const scrollable = Math.max(1, trackEl.offsetHeight - window.innerHeight);
    const p = clamp(-rect.top / scrollable, 0, 1);
    setIntroState(p >= 0.95);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const trackEl = trackRef.current;
    if (!trackEl) return;

    const setIntroState = (done: boolean) => {
      const next = done ? "done" : "playing";
      if (document.documentElement.dataset.intro !== next) {
        document.documentElement.dataset.intro = next;
        window.dispatchEvent(
          new CustomEvent("travelmind:intro-change", { detail: { done } }),
        );
      }
    };

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyReducedMotionState = () => {
      setIntroState(true);
      const revealEl = revealTargetRef.current;
      if (revealEl) {
        revealEl.style.opacity = "1";
        revealEl.style.transform = "none";
        revealEl.style.pointerEvents = "auto";
      }
      if (quoteWrapRef.current) {
        quoteWrapRef.current.style.opacity = "1";
        quoteWrapRef.current.style.transform = "none";
      }
      cardRefs.current.forEach((node) => {
        if (node) {
          node.style.opacity = "0";
        }
      });
    };

    if (reducedMotionQuery.matches) {
      applyReducedMotionState();
      return () => {
        setIntroState(true);
      };
    }

    let targetP = 0;
    let displayedP = 0;
    let rafId = 0;
    let lastTime = 0;

    const computeScrollProgress = (): number => {
      const rect = trackEl.getBoundingClientRect();
      const scrollable = Math.max(1, trackEl.offsetHeight - window.innerHeight);
      return clamp(-rect.top / scrollable, 0, 1);
    };

    const renderFrame = (p: number) => {
      const vw = window.innerWidth || 1280;
      const vh = window.innerHeight || 800;
      const offsetScale = vw < 640 ? 0.54 : vw < 1024 ? 0.78 : 1;

      // ── ACTS 1–5: Quote opacity & subtle exit motion ──
      // p 0.00–0.85: Quote stays fully visible (Act 1 clear, Acts 2–3 covered by flying cards, Act 4 clean again)
      // p 0.85–0.93: Act 5, quote smoothly fades out
      const quoteFadeOut = smoothstep(0.85, 0.93, p);
      const quoteOpacity = 1 - quoteFadeOut;
      if (quoteWrapRef.current) {
        quoteWrapRef.current.style.opacity = quoteOpacity.toFixed(4);
        quoteWrapRef.current.style.transform = `translate3d(0, ${(-18 * quoteFadeOut).toFixed(2)}px, 0) scale(${(1 - 0.03 * quoteFadeOut).toFixed(4)})`;
      }

      // ── ACTS 2–3: Floating 3D PNG Cards (p 0.08–0.75) ──
      for (let i = 0; i < cards.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        const card = cards[i];
        const t = (p - card.startP) / (card.endP - card.startP);

        if (t <= 0 || t >= 1) {
          el.style.opacity = "0";
          continue;
        }

        // Opacity: emerge tiny & transparent -> full visibility -> semi-transparent & fade out past camera
        const fadeIn = smoothstep(0.0, 0.18, t);
        const fadeOut = 1 - smoothstep(0.68, 1.0, t);
        const opacity = fadeIn * fadeOut;

        // Parallax depth acceleration: nearer/faster cards move quicker along Z
        const zProgress = Math.pow(t, card.speedPower);
        const z = card.startZ + (card.endZ - card.startZ) * zProgress;

        // Perspective spread from center + outward drift past edges on exit
        const spreadFactor = smoothstep(0.0, 0.75, t);
        const exitPush = smoothstep(0.62, 1.0, t);
        const baseX = (card.xVw / 100) * vw * offsetScale * (0.25 + 0.75 * spreadFactor);
        const baseY = (card.yVh / 100) * vh * offsetScale * (0.25 + 0.75 * spreadFactor);
        const extraX = card.driftX * vw * 0.24 * offsetScale * exitPush * exitPush;
        const extraY = card.driftY * vh * 0.22 * offsetScale * exitPush * exitPush;

        const x = baseX + extraX;
        const y = baseY + extraY;

        // Subtle dynamic tilt shift during flight
        const rZ = card.rotZ * (0.85 + 0.3 * t);
        const rX = card.rotX * (1 - 0.35 * t);
        const rY = card.rotY * (1 - 0.35 * t);

        el.style.opacity = opacity.toFixed(4);
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateX(${rX.toFixed(2)}deg) rotateY(${rY.toFixed(2)}deg) rotateZ(${rZ.toFixed(2)}deg)`;
      }

      // ── ACT 6: Home Screen Fades In (p 0.93–1.00) ──
      const revealEl = revealTargetRef.current;
      if (revealEl) {
        const homeIn = smoothstep(0.93, 1.0, p);
        revealEl.style.opacity = homeIn.toFixed(4);
        revealEl.style.transform = `translate3d(0, ${((1 - homeIn) * 26).toFixed(2)}px, 0)`;
        revealEl.style.pointerEvents = homeIn > 0.35 ? "auto" : "none";
      }

      // Navbar reveal threshold: hidden during intro, shown once progress >= 0.95
      setIntroState(p >= 0.95);
    };

    const tick = (now: number) => {
      rafId = 0;
      const dt = lastTime ? Math.min(48, now - lastTime) : 16.667;
      lastTime = now;

      // Frame-rate normalized lerp (~0.10 per 60fps frame)
      const alpha = 1 - Math.pow(1 - 0.1, dt / 16.667);
      const diff = targetP - displayedP;

      if (Math.abs(diff) < 0.00015) {
        displayedP = targetP;
        renderFrame(displayedP);
        lastTime = 0;
        return;
      }

      displayedP += diff * alpha;
      renderFrame(displayedP);
      rafId = window.requestAnimationFrame(tick);
    };

    const schedule = () => {
      targetP = computeScrollProgress();
      if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    // Initialize synchronously to current scroll position (supports reload mid-page)
    targetP = computeScrollProgress();
    displayedP = targetP;
    renderFrame(displayedP);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
        applyReducedMotionState();
      } else {
        schedule();
      }
    };

    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", handleMotionChange);
    }

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (typeof reducedMotionQuery.removeEventListener === "function") {
        reducedMotionQuery.removeEventListener("change", handleMotionChange);
      }
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      setIntroState(true);
    };
  }, [revealTargetRef]);

  return (
    <section
      ref={trackRef}
      aria-label="TravelMind visual introduction"
      className="scroll-intro-track"
    >
      <div className="scroll-intro-stage">
        {/* Existing Quote Element (reused as-is) */}
        <div ref={quoteWrapRef} className="scroll-intro-quote">
          {quote}
        </div>

        {/* 3D Perspective Floating Card Layer (ABOVE quote, BELOW navbar) */}
        <div aria-hidden="true" className="scroll-intro-card-layer">
          {cards.map((card, index) => (
            <div
              key={card.id}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              style={{ "--intro-card-w": `${card.width}px` } as CSSProperties}
              className="scroll-intro-card"
            >
              <img
                src={card.src}
                alt=""
                aria-hidden="true"
                loading="eager"
                decoding="async"
                draggable={false}
                className="scroll-intro-card-img"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
