import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowDown } from "lucide-react";

interface TunnelSticker {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  baseWidth: string;
}

const ALL_TUNNEL_STICKERS: TunnelSticker[] = [
  { id: "pushpin", src: "/stickers/pushpin.png", alt: "Pushpin sticker", width: 240, height: 240, baseWidth: "w-20 sm:w-28" },
  { id: "clock", src: "/stickers/clock.png", alt: "Clock sticker", width: 240, height: 240, baseWidth: "w-20 sm:w-28" },
  { id: "statue", src: "/assets/aistudio/image_8d05b2f7.png", alt: "Statue head sticker", width: 334, height: 260, baseWidth: "w-28 sm:w-36" },
  { id: "speech", src: "/assets/aistudio/image_9793eea3.png", alt: "Speech bubble sticker", width: 335, height: 232, baseWidth: "w-28 sm:w-36" },
  { id: "envelope", src: "/assets/aistudio/image_1b8d6268.png", alt: "Envelope sticker", width: 487, height: 480, baseWidth: "w-32 sm:w-44" },
  { id: "megaphone", src: "/assets/aistudio/image_4eab9a73.png", alt: "Megaphone sticker", width: 546, height: 447, baseWidth: "w-32 sm:w-44" },
  { id: "chess", src: "/stickers/chess-king.png", alt: "Chess king sticker", width: 240, height: 240, baseWidth: "w-20 sm:w-28" },
  { id: "lightbulb", src: "/assets/aistudio/image_79080a9a.png", alt: "Lightbulb sticker", width: 481, height: 460, baseWidth: "w-32 sm:w-44" },
  { id: "cassette", src: "/assets/aistudio/image_c52e4d36.png", alt: "Cassette tape sticker", width: 502, height: 328, baseWidth: "w-28 sm:w-40" },
  { id: "handpen", src: "/stickers/hand-with-pen.png", alt: "Hand with pen sticker", width: 240, height: 240, baseWidth: "w-20 sm:w-28" },
  { id: "magnifier", src: "/stickers/hand-with-magnifier.png", alt: "Hand with magnifier sticker", width: 240, height: 240, baseWidth: "w-20 sm:w-28" },
];

function TunnelStickerItem({
  sticker,
  index,
  total,
  smoothProgress,
  isMobile,
}: {
  sticker: TunnelSticker;
  index: number;
  total: number;
  smoothProgress: MotionValue<number>;
  isMobile: boolean;
}) {
  const start = (index / total) * 0.55;
  const end = start + 0.42;

  const z = useTransform(smoothProgress, [start, end], [-1600, 180]);
  const opacity = useTransform(smoothProgress, [start, start + 0.08, end - 0.08, end], [0, 1, 1, 0]);
  const scale = useTransform(smoothProgress, [start, end], [0.35, 1.45]);

  const angle = index * 137.5 * (Math.PI / 180);
  const radiusX = isMobile ? 130 : 380;
  const radiusY = isMobile ? 90 : 240;
  const baseXin = Math.cos(angle) * radiusX;
  const baseYin = Math.sin(angle) * radiusY;

  const x = useTransform(smoothProgress, [start, end], [baseXin * 0.4, baseXin * 1.8]);
  const y = useTransform(smoothProgress, [start, end], [baseYin * 0.4, baseYin * 1.8]);
  const rotate = useTransform(smoothProgress, [start, end], [angle * (180 / Math.PI) * 0.2, angle * (180 / Math.PI) * 0.8 + (index % 2 === 0 ? 35 : -35)]);

  return (
    <motion.div
      style={{
        position: "absolute",
        x,
        y,
        z,
        scale,
        opacity,
        rotate,
        transformStyle: "preserve-3d",
      }}
      className="flex items-center justify-center pointer-events-none"
    >
      <div className="sticker-float-gentle">
        <img
          src={sticker.src}
          alt=""
          aria-hidden="true"
          width={sticker.width}
          height={sticker.height}
          loading="eager"
          decoding="async"
          className={`${sticker.baseWidth} h-auto object-contain select-none drop-shadow-[2px_8px_12px_rgba(22,62,72,0.22)]`}
        />
      </div>
    </motion.div>
  );
}

export function PerspectiveTunnelHero() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasFinePointer, setHasFinePointer] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMedia = () => {
      setIsMobile(window.innerWidth < 768);
      setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      setHasFinePointer(window.matchMedia("(pointer: fine)").matches);
    };

    checkMedia();
    window.addEventListener("resize", checkMedia);
    return () => window.removeEventListener("resize", checkMedia);
  }, []);

  const stickers = isMobile ? ALL_TUNNEL_STICKERS.slice(0, 6) : ALL_TUNNEL_STICKERS;

  // Scroll progress for normal scroll engine (called unconditionally)
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    restDelta: 0.001,
  });

  // Quote opacity & scale mapped to smoothProgress (called unconditionally)
  const quoteOpacity = useTransform(smoothProgress, [0.03, 0.12, 0.72, 0.92], [0, 1, 1, 0]);
  const quoteScale = useTransform(smoothProgress, [0.03, 0.15, 0.85, 0.98], [0.94, 1, 1, 1.05]);
  const scrollCueOpacity = useTransform(smoothProgress, [0, 0.08, 0.18], [1, 1, 0]);

  useEffect(() => {
    if (!hasFinePointer || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 20;
      const ny = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x: nx, y: ny });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [hasFinePointer, prefersReducedMotion]);

  // ALL HOOKS ARE ABOVE THIS LINE. Now we can safely return conditionally if reduced motion is preferred.
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

  const wrapperHeightClass = isMobile ? "h-[240vh]" : "h-[300vh]";

  return (
    <div ref={wrapperRef} className={`relative w-full ${wrapperHeightClass} bg-transparent`}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden flex items-center justify-center bg-transparent">
        {/* Perspective Tunnel Container */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            perspective: "1000px",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Flying Stickers */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transformStyle: "preserve-3d",
              transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0px)`,
              transition: "transform 0.1s cubic-bezier(0.1, 0.7, 0.3, 1)",
            }}
          >
            {stickers.map((sticker, index) => (
              <TunnelStickerItem
                key={sticker.id}
                sticker={sticker}
                index={index}
                total={stickers.length}
                smoothProgress={smoothProgress}
                isMobile={isMobile}
              />
            ))}
          </div>

          {/* Center Quote Block */}
          <motion.div
            style={{
              opacity: quoteOpacity,
              scale: quoteScale,
            }}
            className="relative z-20 max-w-2xl mx-auto px-6 text-center pointer-events-none"
          >
            <blockquote className="font-display uppercase text-[clamp(2.5rem,6.5vw,5.25rem)] leading-[0.95] tracking-wide text-[#163E48] text-balance">
              Every journey starts in the mind.
            </blockquote>
            <p className="mt-4 font-note text-sm sm:text-base font-bold text-[#2A5C69] tracking-widest">
              - TravelMind
            </p>
          </motion.div>

          {/* Scroll Cue Prompt */}
          <motion.div
            style={{ opacity: scrollCueOpacity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-xs font-note text-[#2A5C69] pointer-events-none"
          >
            <span>Scroll</span>
            <span className="w-7 h-7 rounded-full border border-[#1F4F5B]/45 bg-[#FFF8E0] flex items-center justify-center shadow-sm">
              <ArrowDown className="w-3.5 h-3.5 animate-bounce text-[#163E48]" />
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
