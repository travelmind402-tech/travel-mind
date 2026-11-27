import { useEffect, useRef } from "react";
import { attachButterflyFlap, type FlapOptions } from "./butterflyFlap";

/** Where the three layers live in /public. */
const SRC = {
  right: "/stickers/pink-butterfly/wing-right.png",
  left: "/stickers/pink-butterfly/wing-left.png",
  body: "/stickers/pink-butterfly/body.png",
};

/**
 * A paper butterfly that flaps while its PARENT element is hovered.
 * Drop it inside the element you want to act as the trigger (e.g. the "MIND" span).
 * The parent needs `position: relative` (or any positioned display type).
 */
export function FlappingButterfly({
  className = "",
  options,
}: {
  className?: string;
  options?: FlapOptions;
}) {
  const hostRef = useRef<HTMLSpanElement | null>(null);
  const innerRef = useRef<HTMLSpanElement | null>(null);
  const leftRef = useRef<HTMLSpanElement | null>(null);
  const rightRef = useRef<HTMLSpanElement | null>(null);
  const leftImgRef = useRef<HTMLImageElement | null>(null);
  const rightImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const inner = innerRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const trigger = hostRef.current?.parentElement;
    if (!inner || !left || !right || !trigger) return undefined;
    return attachButterflyFlap(
      { inner, left, right, leftImg: leftImgRef.current, rightImg: rightImgRef.current },
      trigger,
      options,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span ref={hostRef} aria-hidden="true" className={`bf ${className}`}>
      <span ref={innerRef} className="bf-inner">
        <span ref={rightRef} className="bf-layer bf-wing">
          <img ref={rightImgRef} src={SRC.right} alt="" draggable={false} decoding="async" />
        </span>
        <span ref={leftRef} className="bf-layer bf-wing">
          <img ref={leftImgRef} src={SRC.left} alt="" draggable={false} decoding="async" />
        </span>
        <span className="bf-layer">
          <img src={SRC.body} alt="" draggable={false} decoding="async" />
        </span>
      </span>
    </span>
  );
}
