import React, { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useAnimationControls, useReducedMotion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CardCarouselProps<T> {
  items: T[];
  renderItem: (item: T, state: { isActive: boolean; index: number }) => ReactNode;
  getItemKey?: (item: T, index: number) => React.Key;
  ariaLabel?: string;
  hovered?: boolean;
  className?: string;
}

function CardCarouselInner<T>({
  items,
  renderItem,
  getItemKey,
  ariaLabel = "TravelMind agents",
  hovered,
  className = "",
}: CardCarouselProps<T>) {
  const reducedMotion = useReducedMotion();
  const trackControls = useAnimationControls();
  const regionRef = useRef<HTMLDivElement | null>(null);
  const activeCardRef = useRef<HTMLDivElement | null>(null);
  const draggedRef = useRef(false);
  const hasPositionedRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(() => Math.floor(items.length / 2));
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [slideWidth, setSlideWidth] = useState(340);
  const [cardHeight, setCardHeight] = useState(268);

  const trackTransition = reducedMotion
    ? { duration: 0.01 }
    : ({ type: "spring", bounce: 0.1, duration: 0.8 } as const);

  const slideTransition = reducedMotion
    ? { duration: 0.01 }
    : ({ type: "spring", bounce: 0.2, duration: 0.8 } as const);

  // Keep activeIndex safely clamped if items length changes
  useEffect(() => {
    setActiveIndex((prev) => Math.max(0, Math.min(Math.max(0, items.length - 1), prev)));
  }, [items.length]);

  // Compute responsive slideWidth from container width via ResizeObserver
  useEffect(() => {
    const el = regionRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;

    const updateSize = (width: number) => {
      if (width >= 900) {
        setSlideWidth(340);
      } else if (width >= 600) {
        setSlideWidth(320);
      } else {
        setSlideWidth(Math.min(280, Math.max(248, Math.floor(width - 24))));
      }
    };

    updateSize(el.clientWidth);
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) updateSize(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure the active card height so the stage always reserves room for the fanned arc
  useEffect(() => {
    const cardEl = activeCardRef.current;
    if (!cardEl || typeof ResizeObserver === "undefined") return undefined;

    const updateHeight = (h: number) => {
      if (h > 100) setCardHeight(Math.ceil(h));
    };

    updateHeight(cardEl.offsetHeight);
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h) updateHeight(h);
    });
    ro.observe(cardEl);
    return () => ro.disconnect();
  }, [activeIndex, slideWidth]);

  // Position track without initial flash, then spring on subsequent index/width changes
  useLayoutEffect(() => {
    const targetX = -activeIndex * slideWidth;
    if (!hasPositionedRef.current) {
      hasPositionedRef.current = true;
      trackControls.set({ x: targetX });
      return;
    }
    void trackControls.start({ x: targetX, transition: trackTransition });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, slideWidth, reducedMotion]);

  if (items.length === 0) return null;

  const isFanned = hovered !== undefined ? hovered : isHovered || isDragging;
  const isFirst = activeIndex <= 0;
  const isLast = activeIndex >= items.length - 1;
  const cardWidth = Math.max(216, slideWidth - 32);
  const stageHeight = reducedMotion
    ? Math.max(cardHeight + 40, 290)
    : Math.max(cardHeight + 132, 392);

  const toPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const toNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex((prev) => Math.min(items.length - 1, prev + 1));
  };

  const toSlide = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (draggedRef.current) return;
    setActiveIndex(Math.max(0, Math.min(items.length - 1, index)));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      toPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      toNext();
    }
  };

  const handleDragStart = () => {
    draggedRef.current = true;
    setIsDragging(true);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const swipeThreshold = 48;
    const velocityThreshold = 280;

    let nextIndex = activeIndex;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      nextIndex = Math.min(items.length - 1, activeIndex + 1);
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      nextIndex = Math.max(0, activeIndex - 1);
    }

    if (nextIndex !== activeIndex) {
      setActiveIndex(nextIndex);
    } else {
      // Snap cleanly back to the current slide if drag was under threshold
      void trackControls.start({ x: -activeIndex * slideWidth, transition: trackTransition });
    }

    window.setTimeout(() => {
      draggedRef.current = false;
    }, 60);
  };

  return (
    <div
      ref={regionRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") setIsHovered(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "touch") setIsHovered(false);
      }}
      className={`w-full flex flex-col items-center justify-center relative z-10 overflow-x-clip select-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#4C9DB0] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFF8E0] rounded-3xl ${className}`}
    >
      {/* Carousel stage sized to hold the card plus vertical arc clearance */}
      <div
        className="relative flex items-center justify-start overflow-visible"
        style={{ width: `${slideWidth}px`, height: `${stageHeight}px` }}
      >
        <motion.div
          className="flex w-fit items-center cursor-grab active:cursor-grabbing"
          style={{ touchAction: "pan-y" }}
          drag="x"
          dragDirectionLock
          dragMomentum={false}
          dragConstraints={{
            left: -(items.length - 1) * slideWidth,
            right: 0,
          }}
          dragElastic={0.18}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          animate={trackControls}
        >
          {items.map((item, i) => {
            const isActive = activeIndex === i;
            const diff = i - activeIndex;

            const targetRotate = reducedMotion ? 0 : isFanned ? diff * 20 : diff * 5;
            const targetScale = reducedMotion
              ? isActive
                ? 1
                : 0.94
              : isActive
                ? 1.05
                : isFanned
                  ? 0.68
                  : 0.82;
            const targetY = reducedMotion ? 0 : isFanned ? diff * 24 : 0;

            return (
              <motion.div
                key={getItemKey ? getItemKey(item, i) : i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${items.length}`}
                tabIndex={isActive ? 0 : -1}
                onClick={(e) => {
                  if (!isActive) toSlide(i, e);
                }}
                className={`shrink-0 flex items-center justify-center will-change-transform focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#4C9DB0] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FFF8E0] rounded-2xl ${
                  isActive ? "cursor-default" : "cursor-pointer"
                }`}
                style={{
                  width: `${slideWidth}px`,
                  zIndex: items.length - Math.abs(diff),
                }}
                animate={{
                  rotate: targetRotate,
                  scale: targetScale,
                  y: targetY,
                }}
                transition={slideTransition}
              >
                <div
                  ref={isActive ? activeCardRef : undefined}
                  style={{ width: `${cardWidth}px` }}
                  className="shrink-0"
                >
                  {renderItem(item, { isActive, index: i })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Controls pill + handwritten counter */}
      <div className="mt-4 flex items-center justify-center gap-4 relative z-20">
        <div className="inline-flex items-center gap-2 px-2 py-1.5 rounded-full bg-[#FFF8E0] border-2 border-[#1F4F5B] shadow-[3px_3px_0_#4C9DB0]">
          <button
            type="button"
            onClick={toPrev}
            disabled={isFirst}
            aria-label="Previous agent"
            aria-disabled={isFirst}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#163E48] transition-colors cursor-pointer hover:bg-[#FFEBAF] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#4C9DB0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8E0] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center gap-1.5 px-1">
            {items.map((_, i) => {
              const isCurrent = activeIndex === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => toSlide(i, e)}
                  aria-label={`Go to agent ${i + 1} of ${items.length}`}
                  aria-current={isCurrent ? "true" : undefined}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#4C9DB0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8E0] ${
                    isCurrent
                      ? "w-6 bg-[#163E48]"
                      : "w-2 bg-[#163E48]/30 hover:bg-[#163E48]/55"
                  }`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={toNext}
            disabled={isLast}
            aria-label="Next agent"
            aria-disabled={isLast}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#163E48] transition-colors cursor-pointer hover:bg-[#FFEBAF] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#4C9DB0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8E0] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span
          className="font-note text-sm sm:text-base font-bold text-[#1F4F5B] tabular-nums select-none"
          aria-live="polite"
        >
          {activeIndex + 1} / {items.length}
        </span>
      </div>
    </div>
  );
}

export const CardCarousel = React.memo(CardCarouselInner) as typeof CardCarouselInner;
export default CardCarousel;
