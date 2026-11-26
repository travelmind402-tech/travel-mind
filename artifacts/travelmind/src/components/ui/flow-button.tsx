'use client';

import type { ButtonHTMLAttributes } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type FlowButtonVariant = "primary" | "secondary" | "teal" | "inverse";
export type FlowButtonSize = "sm" | "md" | "lg";

export interface FlowButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  variant?: FlowButtonVariant;
  size?: FlowButtonSize;
  direction?: "forward" | "back";
  loading?: boolean;
}

const VARIANT_STYLES: Record<
  FlowButtonVariant,
  {
    button: string;
    circle: string;
    arrow: string;
  }
> = {
  primary: {
    button:
      "border-[#1F4F5B] bg-[#FFF8E0] text-[#163E48] hover:border-transparent hover:text-[#FFF8E0]",
    circle: "bg-[#163E48]",
    arrow: "stroke-[#163E48] group-hover:stroke-[#FFF8E0]",
  },
  secondary: {
    button:
      "border-[#1F4F5B]/55 bg-[#FFF8E0]/90 text-[#163E48] hover:border-transparent hover:text-[#FFF8E0]",
    circle: "bg-[#1F4F5B]",
    arrow: "stroke-[#1F4F5B] group-hover:stroke-[#FFF8E0]",
  },
  teal: {
    button:
      "border-[#163E48] bg-[#1F4F5B] text-[#FFEBAF] hover:border-transparent hover:text-[#163E48]",
    circle: "bg-[#4C9DB0]",
    arrow: "stroke-[#FFEBAF] group-hover:stroke-[#163E48]",
  },
  inverse: {
    button:
      "border-[#FFEBAF]/55 bg-transparent text-[#FFEBAF] hover:border-transparent hover:text-[#163E48]",
    circle: "bg-[#FFEBAF]",
    arrow: "stroke-[#FFEBAF] group-hover:stroke-[#163E48]",
  },
};

const SIZE_STYLES: Record<
  FlowButtonSize,
  {
    button: string;
    arrow: string;
    circle: string;
    enterForward: string;
    restForward: string;
    enterBack: string;
    restBack: string;
    textForward: string;
    textBack: string;
  }
> = {
  sm: {
    button: "h-9 px-6 sm:px-7 text-xs sm:text-sm font-semibold",
    arrow: "w-3.5 h-3.5",
    circle: "group-hover:w-[260px] group-hover:h-[260px]",
    enterForward: "left-[-25%] group-hover:left-3",
    restForward: "right-3 group-hover:right-[-25%]",
    enterBack: "right-[-25%] group-hover:right-3",
    restBack: "left-3 group-hover:left-[-25%]",
    textForward: "-translate-x-2 group-hover:translate-x-2",
    textBack: "translate-x-2 group-hover:-translate-x-2",
  },
  md: {
    button: "h-11 px-8 text-sm font-semibold",
    arrow: "w-4 h-4",
    circle: "group-hover:w-[340px] group-hover:h-[340px]",
    enterForward: "left-[-25%] group-hover:left-4",
    restForward: "right-4 group-hover:right-[-25%]",
    enterBack: "right-[-25%] group-hover:right-4",
    restBack: "left-4 group-hover:left-[-25%]",
    textForward: "-translate-x-2.5 group-hover:translate-x-2.5",
    textBack: "translate-x-2.5 group-hover:-translate-x-2.5",
  },
  lg: {
    button: "h-12 px-9 text-base font-bold",
    arrow: "w-4 h-4",
    circle: "group-hover:w-[560px] group-hover:h-[560px]",
    enterForward: "left-[-25%] group-hover:left-4",
    restForward: "right-4 group-hover:right-[-25%]",
    enterBack: "right-[-25%] group-hover:right-4",
    restBack: "left-4 group-hover:left-[-25%]",
    textForward: "-translate-x-3 group-hover:translate-x-3",
    textBack: "translate-x-3 group-hover:-translate-x-3",
  },
};

export function FlowButton({
  text = "Modern Button",
  children,
  variant = "primary",
  size = "md",
  direction = "forward",
  loading = false,
  disabled,
  className,
  type = "button",
  ...props
}: FlowButtonProps) {
  const palette = VARIANT_STYLES[variant];
  const dims = SIZE_STYLES[size];
  const isBack = direction === "back";
  const ArrowIcon = isBack ? ArrowLeft : ArrowRight;
  const label = children ?? text;
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        "group relative inline-flex items-center justify-center gap-1 overflow-hidden whitespace-nowrap shrink-0",
        "rounded-[100px] border-[1.5px] cursor-pointer select-none",
        "transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
        "hover:rounded-[12px] active:scale-[0.95]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C9DB0]",
        "disabled:pointer-events-none disabled:opacity-45",
        palette.button,
        dims.button,
        className,
      )}
      {...props}
    >
      {/* Entering arrow */}
      {!loading && (
        <ArrowIcon
          aria-hidden="true"
          className={cn(
            "absolute fill-none z-[9] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            dims.arrow,
            palette.arrow,
            isBack ? dims.enterBack : dims.enterForward,
          )}
        />
      )}

      {/* Label */}
      <span
        className={cn(
          "relative z-[1] inline-flex items-center justify-center gap-2 transition-all duration-[800ms] ease-out",
          !loading && (isBack ? dims.textBack : dims.textForward),
        )}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        <span>{label}</span>
      </span>

      {/* Expanding ink circle */}
      {!loading && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "w-4 h-4 rounded-[50%] opacity-0 group-hover:opacity-100",
            "transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]",
            palette.circle,
            dims.circle,
          )}
        />
      )}

      {/* Resting / exiting arrow */}
      {!loading && (
        <ArrowIcon
          aria-hidden="true"
          className={cn(
            "absolute fill-none z-[9] transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            dims.arrow,
            palette.arrow,
            isBack ? dims.restBack : dims.restForward,
          )}
        />
      )}
    </button>
  );
}
