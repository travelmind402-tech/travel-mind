import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STICKERS, type StickerConfig } from "./stickerConfig";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  id?: string;
  /** Opening headline shown before scrolling (fades out). Omit when handled by an intro section above. */
  intro?: ReactNode;
  /** Main hero copy + CTAs (fades in) */
  children: ReactNode;
};

const byId = Object.fromEntries(STICKERS.map((s) => [s.id, s])) as Record<string, StickerConfig>;

const MAX_SCROLL_OFFSET_PX = 22;

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function ScrapbookHeroTransition({ id = "home", intro, children }: Props) {
  const trackRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    const introEl = introRef.current;
    const content = contentRef.current;
    if (!track || !stage || !content) return;

    const els = gsap.utils.toArray<HTMLElement>(stage.querySelectorAll("[data-sticker]"));

    if (!intro || !introEl) {
      gsap.set(content, { autoAlpha: 1, y: 0 });
      els.forEach((el) => {
        const c = byId[el.dataset.sticker!];
        gsap.set(el, { x: 0, y: 0, rotation: c.rotate, scale: c.scale ?? 1 });
      });
      return;
    }

    const mm = gsap.matchMedia();

    // Reduced motion: skip the scrub, show the final docked state.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(introEl, { autoAlpha: 0 });
      gsap.set(content, { autoAlpha: 1, y: 0 });
      els.forEach((el) => {
        const c = byId[el.dataset.sticker!];
        gsap.set(el, { x: 0, y: 0, rotation: c.rotate, scale: c.scale ?? 1 });
      });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom", // sticky stage is "pinned" for the track's extra 200vh
          scrub: 0.6, // set to `true` for strictly 1:1 with no smoothing
          invalidateOnRefresh: true, // recompute start offsets on resize
        },
      });

      // Intro headline out
      tl.fromTo(
        introEl,
        { autoAlpha: 1, y: 0, scale: 1 },
        { autoAlpha: 0, y: -40, scale: 0.94, duration: 0.22 },
        0,
      );

      // Stickers: burst from center, decelerate, stick at their docked spots
      els.forEach((el, i) => {
        const c = byId[el.dataset.sticker!];
        const fromX = () =>
          stage.clientWidth / 2 -
          (el.offsetLeft + el.offsetWidth / 2) +
          (c.start.x / 100) * stage.clientWidth;
        const fromY = () =>
          stage.clientHeight / 2 -
          (el.offsetTop + el.offsetHeight / 2) +
          (c.start.y / 100) * stage.clientHeight;

        tl.fromTo(
          el,
          { x: fromX, y: fromY, rotation: c.start.rotate, scale: c.start.scale },
          {
            x: 0,
            y: 0,
            rotation: c.rotate,
            scale: c.scale ?? 1,
            ease: "power3.out",
            duration: 0.6,
          },
          0.04 + i * 0.012,
        );
      });

      // Main hero copy in
      tl.fromTo(
        content,
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
        0.5,
      );

      // Hold the finished collage for the last 17% of the pinned scroll
      tl.to({}, { duration: 0 }, 1);

      // Offsets depend on image heights, so re-measure once all images are ready
      let pending = els.length;
      const done = () => {
        if (--pending === 0) ScrollTrigger.refresh();
      };
      const cleanups: Array<() => void> = [];
      els.forEach((el) => {
        const img = el.querySelector("img");
        if (!img || img.complete) return done();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
        cleanups.push(() => {
          img.removeEventListener("load", done);
          img.removeEventListener("error", done);
        });
      });
      return () => cleanups.forEach((fn) => fn());
    });

    return () => mm.revert();
  }, [intro]);

  // Single passive scroll listener + single rAF lerp loop + IntersectionObserver pause
  // Drives ONLY `--sh-scroll-offset` on the middle `.sh-sticker-scroll` wrappers.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    stage.style.setProperty("--sh-scroll-offset", "0px");

    let isReduced = reducedMotionQuery.matches;
    let isInView = true;
    let rafId = 0;
    let lastScrollY = window.scrollY;
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
      stage.style.setProperty("--sh-scroll-offset", "0px");
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

      // Smoothly decay velocity impulse back toward exact resting 0
      targetOffset *= Math.pow(0.84, frameScale);

      // Smooth lerp easing (~0.10 per 60fps frame)
      const alpha = 1 - Math.pow(1 - 0.1, frameScale);
      currentOffset += (targetOffset - currentOffset) * alpha;

      if (Math.abs(currentOffset) < 0.03 && Math.abs(targetOffset) < 0.03) {
        resetToRest();
        return;
      }

      stage.style.setProperty("--sh-scroll-offset", `${currentOffset.toFixed(2)}px`);
      rafId = window.requestAnimationFrame(tick);
    };

    const handleScroll = () => {
      const nextY = window.scrollY;
      const dy = nextY - lastScrollY;
      lastScrollY = nextY;

      if (isReduced || !isInView || dy === 0) return;

      // Velocity-proportional vertical nudge reversed with scroll direction, capped at ±22px
      targetOffset = clamp(targetOffset - dy * 0.34, -MAX_SCROLL_OFFSET_PX, MAX_SCROLL_OFFSET_PX);

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
          track.dataset.inview = visible ? "true" : "false";
          if (!visible) {
            resetToRest();
          } else {
            lastScrollY = window.scrollY;
          }
        },
        { rootMargin: "120px 0px" },
      );
      observer.observe(track);
    } else {
      track.dataset.inview = "true";
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReduced = e.matches;
      if (isReduced) {
        resetToRest();
      } else {
        lastScrollY = window.scrollY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", handleMotionChange);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
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
  }, []);

  return (
    <section
      ref={trackRef}
      id={id}
      data-inview="true"
      className="sh-track"
      style={!intro ? { height: "auto" } : undefined}
    >
      <div ref={stageRef} className="sh-stage">
        {/* Three nested layers per sticker so fixed rotation, scroll nudge, and idle float never conflict */}
        {STICKERS.map((s) => (
          <div
            key={s.id}
            data-sticker={s.id}
            data-hide={s.hide}
            aria-hidden="true"
            className="sh-sticker"
            style={{ ...s.pos, "--w": s.w, zIndex: s.z } as CSSProperties}
          >
            <div
              className="sh-sticker-scroll"
              style={{ "--depth": s.depth } as CSSProperties}
            >
              <img
                src={s.src}
                alt=""
                draggable={false}
                decoding="async"
                className="sh-sticker-img"
                style={
                  {
                    "--float-y": `${s.floatY}px`,
                    "--float-rot": `${s.floatRot}deg`,
                    "--float-dur": `${s.floatDur}s`,
                    "--float-delay": `${s.floatDelay}s`,
                  } as CSSProperties
                }
              />
            </div>
          </div>
        ))}

        {/* Intro headline */}
        {intro && (
          <div ref={introRef} className="sh-layer sh-intro">
            {intro}
          </div>
        )}

        {/* Main hero copy */}
        <div
          ref={contentRef}
          className="sh-layer sh-content"
          style={intro ? { opacity: 0, visibility: "hidden" } : undefined}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
