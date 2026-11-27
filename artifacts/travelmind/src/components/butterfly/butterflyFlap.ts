/**
 * Procedural butterfly wingbeat.
 *
 * Drives two wing layers with CSS 3D `rotateY` (pivoting on the body seam) plus a little
 * body bob / sway on the wrapper. Only `transform` and a brightness `filter` are written,
 * and the rAF loop sleeps completely when the butterfly is at rest.
 */

export type FlapParts = {
  /** Wrapper that gets the lift / bob / sway. Must have CSS `perspective`. */
  inner: HTMLElement;
  left: HTMLElement;
  right: HTMLElement;
  leftImg?: HTMLElement | null;
  rightImg?: HTMLElement | null;
};

export type FlapOptions = {
  /** Wing lift (deg) at the top of the upstroke. 90 = edge-on. Default 64. */
  maxAngle?: number;
  /** Base wingbeats per second. Default 3.4 (higher reads as a blur on screen). */
  beatHz?: number;
  /** How far it rises while flapping, as a fraction of its own width. Default 0.05. */
  lift?: number;
  /** How quickly flapping ramps up when hovered (1/s). Default 9. */
  attack?: number;
  /** How quickly it settles after the pointer leaves (1/s). Default 2.4. */
  release?: number;
  /** Touch devices have no hover: a tap flaps for this long (ms). Default 1500. */
  tapMs?: number;
};

const TAU = Math.PI * 2;
const sine = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t); // ease-in-out, t in 0..1
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** 0 = wings flat/open, 1 = wings lifted. Upstroke is quicker (40%) than the downstroke (60%). */
function wave(p: number) {
  return p < 0.4 ? sine(p / 0.4) : sine(1 - (p - 0.4) / 0.6);
}

export function attachButterflyFlap(
  parts: FlapParts,
  trigger: HTMLElement,
  options: FlapOptions = {},
): () => void {
  if (typeof window === "undefined") return () => {};
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const o = {
    maxAngle: 64,
    beatHz: 3.4,
    lift: 0.05,
    attack: 9,
    release: 2.4,
    tapMs: 1500,
    ...options,
  };

  const { inner, left, right, leftImg, rightImg } = parts;
  let raf = 0;
  let last = 0;
  let phase = 0; // wingbeat cycles
  let sway = rand(0, TAU);
  let env = 0; // 0 = at rest, 1 = full flapping
  let target = 0;
  let freq = o.beatHz;
  let amp = 1;
  let tapTimer = 0;

  const apply = () => {
    const size = inner.offsetWidth || 80;
    const p = phase - Math.floor(phase);
    const g = wave(p);
    // tiny left/right asymmetry so the two wings never move in perfect lockstep
    const asym = 1 + 0.045 * Math.sin(phase * Math.PI + 1.3);
    const a = o.maxAngle * amp * env * g;

    left.style.transform = `rotateY(${(a * asym).toFixed(2)}deg)`;
    right.style.transform = `rotateY(${(-a / asym).toFixed(2)}deg)`;

    // wings catch less light as they tilt away from the viewer
    const shade = `brightness(${(1 - 0.2 * g * env).toFixed(3)})`;
    if (leftImg) leftImg.style.filter = shade;
    if (rightImg) rightImg.style.filter = shade;

    // body rises on the downstroke, sinks a touch at the top; slow sway + drift
    const y = -size * env * (o.lift + 0.014 * (0.5 - g));
    const x = size * 0.014 * env * Math.sin(sway * 0.8 + 1);
    const r = 2.6 * env * Math.sin(sway);
    const s = 1 + 0.06 * env;
    inner.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
  };

  const reset = () => {
    left.style.transform = "";
    right.style.transform = "";
    inner.style.transform = "";
    if (leftImg) leftImg.style.filter = "";
    if (rightImg) rightImg.style.filter = "";
  };

  const frame = (now: number) => {
    raf = 0;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;

    const rate = target ? o.attack : o.release;
    env += (target - env) * (1 - Math.exp(-rate * dt));

    const prev = Math.floor(phase);
    phase += freq * dt * (0.5 + 0.5 * env); // beats slow down as it settles
    sway += dt * 1.7;
    if (Math.floor(phase) !== prev) {
      // each beat is a little different: speed and strength drift like a real flutter
      freq = o.beatHz * rand(0.85, 1.15);
      amp = rand(0.82, 1);
    }

    if (!target && env < 0.015) {
      env = 0;
      phase = 0;
      last = 0;
      reset();
      return; // asleep until the next hover
    }
    apply();
    raf = requestAnimationFrame(frame);
  };

  const wake = (v: 0 | 1) => {
    target = v;
    if (!raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  };

  // Mouse / pen: flap while hovered. Touch is handled by onDown (enter/leave fire around every tap).
  const onEnter = (e: PointerEvent) => {
    if (e.pointerType !== "touch") wake(1);
  };
  const onLeave = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    window.clearTimeout(tapTimer);
    wake(0);
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== "touch") return;
    wake(1);
    window.clearTimeout(tapTimer);
    tapTimer = window.setTimeout(() => wake(0), o.tapMs);
  };

  trigger.addEventListener("pointerenter", onEnter);
  trigger.addEventListener("pointerleave", onLeave);
  trigger.addEventListener("pointerdown", onDown);

  return () => {
    trigger.removeEventListener("pointerenter", onEnter);
    trigger.removeEventListener("pointerleave", onLeave);
    trigger.removeEventListener("pointerdown", onDown);
    window.clearTimeout(tapTimer);
    if (raf) cancelAnimationFrame(raf);
    reset();
  };
}
