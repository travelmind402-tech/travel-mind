import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  FloatingScrapbookSticker,
  ScrapbookSticker,
  useDiaryReveal,
  useScrapbookMotion,
  type StickerVariant,
} from "@/components/ScrapbookStickers";
import { EditorialTravelSections } from "@/components/editorial/EditorialTravelSections";
import {
  ArrowDown,
  ChevronRight,
  LogOut,
  Mail,
  PlaneTakeoff,
} from "lucide-react";

const STICKER_JOBS: {
  sticker: StickerVariant;
  job: string;
  detail: string;
  accent: string;
}[] = [
  {
    sticker: "pushpin",
    job: "Destinations",
    detail: "Cities, countries & layover stops pinned cleanly.",
    accent: "bg-[#FFEBAF] text-[#163E48]",
  },
  {
    sticker: "clock",
    job: "Timing",
    detail: "Dates, trip length & seasonal pacing checked.",
    accent: "bg-[#4C9DB0] text-[#163E48]",
  },
  {
    sticker: "speech",
    job: "AI chat",
    detail: "Local phrasebooks & phonetic street prompts.",
    accent: "bg-[#1F4F5B] text-[#FFEBAF]",
  },
  {
    sticker: "envelope",
    job: "Saved trips",
    detail: "All 7 specialized briefings bundled together.",
    accent: "bg-[#4C9DB0] text-[#163E48]",
  },
  {
    sticker: "chess",
    job: "Planning",
    detail: "Smart backup routes, driving rules & alerts.",
    accent: "bg-[#FFEBAF] text-[#163E48]",
  },
  {
    sticker: "lightbulb",
    job: "Ideas",
    detail: "Culture tips, hidden neighborhoods & food spots.",
    accent: "bg-[#4C9DB0] text-[#163E48]",
  },
  {
    sticker: "cassette",
    job: "Trip soundtrack",
    detail: "The mood, tempo & rhythm of your days away.",
    accent: "bg-[#1F4F5B] text-[#FFEBAF]",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Tell us the trip",
    description:
      "Drop your destination, dates, crew size, food flags, and daily budget into our 4-step travel brief.",
    sticker: "pushpin" as StickerVariant,
    accent: "bg-[#FFEBAF] text-[#163E48]",
  },
  {
    step: "02",
    title: "AI plans it",
    description:
      "Seven focused travel specialists check weather, disruptions, roads, cuisine, culture, budget, and phrases.",
    sticker: "chess" as StickerVariant,
    accent: "bg-[#4C9DB0] text-[#163E48]",
  },
  {
    step: "03",
    title: "Get your itinerary",
    description:
      "Open a calm, scannable briefing deck you can actually use on the ground before and during your trip.",
    sticker: "envelope" as StickerVariant,
    accent: "bg-[#1F4F5B] text-[#FFEBAF]",
  },
];

function useInViewOnce(threshold = 0.2) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

import { PerspectiveTunnelHero } from "@/components/ui/perspective-tunnel-hero";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  useScrapbookMotion(pageRef, heroRef);

  const chaosSection = useInViewOnce(0.15);
  const sortSection = useInViewOnce(0.16);
  const howStepsSection = useDiaryReveal(0.14);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen paper-texture text-[#163E48] overflow-x-clip">
      {/* Floating White Pill Navbar */}
      <div className="sticky top-3 z-50 px-3 sm:px-6 pointer-events-none">
        <header className="pointer-events-auto max-w-5xl mx-auto rounded-full bg-[#FFF8E0]/95 backdrop-blur-md border-[1.5px] border-[#1F4F5B] shadow-[0_10px_28px_rgba(22,62,72,0.12)] px-3.5 sm:px-5 py-2 flex items-center justify-between gap-4 sm:gap-8">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("home");
            }}
            className="flex items-center gap-2 font-display text-lg sm:text-xl tracking-wide text-[#163E48] whitespace-nowrap shrink-0 pl-1"
          >
            <span className="w-7 h-7 rounded-full bg-[#4C9DB0] border border-[#1F4F5B] flex items-center justify-center">
              <PlaneTakeoff className="w-3.5 h-3.5 text-[#163E48]" />
            </span>
            <span>TRAVELMIND</span>
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#2A5C69]"
          >
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("home");
              }}
              className="hover:text-[#163E48] hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-colors"
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("how-it-works");
              }}
              className="hover:text-[#163E48] hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-colors"
            >
              How it works
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("contact");
              }}
              className="hover:text-[#163E48] hover:underline underline-offset-4 whitespace-nowrap shrink-0 transition-colors"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="font-note text-xs font-bold text-[#2A5C69] max-w-[110px] truncate">
                  {user.name}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void logout()}
                  className="rounded-full border-[1.5px] border-[#1F4F5B]/55 bg-[#FFEBAF] text-[#163E48] hover:bg-[#4C9DB0]/25 h-9 px-3 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Log out
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/auth")}
                className="rounded-full bg-[#FFF8E0] text-[#163E48] hover:bg-[#4C9DB0]/20 border-[1.5px] border-[#1F4F5B] h-9 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                Log in
              </Button>
            )}

            <Button
              type="button"
              onClick={() => setLocation("/plan")}
              className="rounded-full bg-[#4C9DB0] text-[#163E48] hover:bg-[#3F8C9E] border-[1.5px] border-[#1F4F5B] px-4 sm:px-5 h-9 text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 shadow-[2px_2px_0_#1F4F5B] active:translate-y-0.5 active:shadow-none transition-all duration-150 cursor-pointer"
            >
              Make the trip
            </Button>
          </div>
        </header>
      </div>

      {/* SCENE 0: PERSPECTIVE TUNNEL HERO */}
      <PerspectiveTunnelHero />

      {/* HERO SECTION */}
      <section
        ref={heroRef}
        id="home"
        className="relative min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 sm:px-8 pt-12 pb-20 overflow-hidden"
      >
        {/* Organically scattered collage stickers across open space around hero copy (all 9 PNGs) */}
        <FloatingScrapbookSticker
          variant="newsbird"
          eager
          className="absolute left-2 sm:left-5 xl:left-10 top-5 sm:top-8 w-16 sm:w-24 xl:w-32 z-[2]"
          restRotate={-11}
          enterX={-150}
          enterY={-110}
          enterRotate={-34}
          enterScale={0.58}
          enterDelayMs={80}
          enterDurationMs={840}
          driftVariant="a"
          driftDurationSec={7.4}
          parallaxX={-22}
          parallaxY={-18}
          parallaxRotate={-3}
          scrollX={-48}
          scrollY={-185}
          scrollRotate={-8}
        />

        <FloatingScrapbookSticker
          variant="envelope"
          eager
          className="absolute right-3 sm:right-6 xl:right-14 top-6 sm:top-10 w-16 sm:w-24 lg:w-28 xl:w-36 z-[2]"
          restRotate={9}
          enterX={160}
          enterY={-105}
          enterRotate={28}
          enterScale={0.6}
          enterDelayMs={160}
          enterDurationMs={860}
          driftVariant="b"
          driftDurationSec={8.9}
          parallaxX={24}
          parallaxY={-16}
          parallaxRotate={2.5}
          scrollX={52}
          scrollY={-205}
          scrollRotate={10}
        />

        <FloatingScrapbookSticker
          variant="lightbulb"
          eager
          className="hidden md:block absolute left-[10%] xl:left-[17%] top-[13%] xl:top-[15%] w-16 lg:w-20 xl:w-24 z-[2]"
          restRotate={-15}
          enterX={-40}
          enterY={-140}
          enterRotate={-32}
          enterScale={0.5}
          enterDelayMs={250}
          enterDurationMs={800}
          driftVariant="d"
          driftDurationSec={6.9}
          parallaxX={14}
          parallaxY={-11}
          parallaxRotate={2}
          scrollX={-22}
          scrollY={-140}
          scrollRotate={-6}
        />

        <FloatingScrapbookSticker
          variant="megaphone"
          eager
          className="hidden lg:block absolute right-[8%] xl:right-[14%] top-[21%] w-20 xl:w-28 z-[2]"
          restRotate={12}
          enterX={170}
          enterY={-30}
          enterRotate={30}
          enterScale={0.58}
          enterDelayMs={330}
          enterDurationMs={820}
          driftVariant="c"
          driftDurationSec={9.8}
          parallaxX={-25}
          parallaxY={13}
          parallaxRotate={3.2}
          scrollX={60}
          scrollY={-170}
          scrollRotate={12}
        />

        <FloatingScrapbookSticker
          variant="swallow"
          eager
          className="hidden sm:block absolute left-3 lg:left-8 xl:left-[8%] top-[47%] w-16 lg:w-24 xl:w-28 z-[2]"
          restRotate={-7}
          enterX={-170}
          enterY={24}
          enterRotate={-26}
          enterScale={0.66}
          enterDelayMs={410}
          enterDurationMs={880}
          driftVariant="e"
          driftDurationSec={8.3}
          parallaxX={10}
          parallaxY={9}
          parallaxRotate={1.6}
          scrollX={-30}
          scrollY={-95}
          scrollRotate={-5}
        />

        <FloatingScrapbookSticker
          variant="speech"
          eager
          className="hidden sm:block absolute right-3 lg:right-9 xl:right-[10%] top-[51%] w-16 lg:w-24 xl:w-28 z-[2]"
          restRotate={8}
          enterX={120}
          enterY={18}
          enterRotate={22}
          enterScale={0.44}
          enterDelayMs={490}
          enterDurationMs={780}
          driftVariant="a"
          driftDurationSec={9.1}
          parallaxX={-16}
          parallaxY={-12}
          parallaxRotate={-2.2}
          scrollX={36}
          scrollY={-125}
          scrollRotate={6}
        />

        <FloatingScrapbookSticker
          variant="statue"
          eager
          className="absolute left-3 sm:left-8 xl:left-16 bottom-6 sm:bottom-12 w-16 sm:w-24 xl:w-28 z-[2]"
          restRotate={6}
          enterX={-130}
          enterY={125}
          enterRotate={-18}
          enterScale={0.62}
          enterDelayMs={570}
          enterDurationMs={860}
          driftVariant="b"
          driftDurationSec={10.4}
          parallaxX={16}
          parallaxY={16}
          parallaxRotate={2.4}
          scrollX={-36}
          scrollY={-110}
          scrollRotate={-7}
        />

        <FloatingScrapbookSticker
          variant="cassette"
          eager
          className="hidden lg:block absolute left-[18%] xl:left-[22%] bottom-8 xl:bottom-10 w-20 xl:w-24 z-[2]"
          restRotate={-9}
          enterX={-50}
          enterY={145}
          enterRotate={18}
          enterScale={0.56}
          enterDelayMs={650}
          enterDurationMs={840}
          driftVariant="d"
          driftDurationSec={7.2}
          parallaxX={-21}
          parallaxY={18}
          parallaxRotate={-2.8}
          scrollX={-18}
          scrollY={-155}
          scrollRotate={5}
        />

        <FloatingScrapbookSticker
          variant="star"
          eager
          className="absolute right-4 sm:right-8 xl:right-20 bottom-6 sm:bottom-12 w-14 sm:w-20 xl:w-24 z-[2]"
          restRotate={-14}
          enterX={135}
          enterY={115}
          enterRotate={-46}
          enterScale={0.48}
          enterDelayMs={730}
          enterDurationMs={800}
          driftVariant="c"
          driftDurationSec={8.1}
          parallaxX={-17}
          parallaxY={15}
          parallaxRotate={3}
          scrollX={42}
          scrollY={-138}
          scrollRotate={14}
        />

        {/* Center Hero Copy */}
        <div className="hero-scroll-stage relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="kinetic-badge inline-flex items-center px-4 py-1.5 rounded-full bg-[#4C9DB0] border-[1.5px] border-[#1F4F5B] shadow-[2px_2px_0_#1F4F5B] mb-7">
            <span className="font-note text-xs sm:text-sm font-bold tracking-tight text-[#163E48]">
              Your AI travel mind is here
            </span>
          </div>

          <h1 className="font-display uppercase text-[clamp(3rem,7vw,5.75rem)] leading-[0.94] tracking-wide text-[#163E48] text-balance max-w-3xl">
            <span className="kinetic-line-1">TRAVEL WITH A</span>{" "}
            <span className="kinetic-cutout-mind font-note inline-block bg-[#4C9DB0] text-[#FFEBAF] px-3 py-0.5 rounded-lg border-[1.5px] border-[#1F4F5B] shadow-[3px_3px_0_#1F4F5B]">
              MIND
            </span>{" "}
            <span className="kinetic-word-1">OF</span>{" "}
            <span className="kinetic-word-2">ITS</span>{" "}
            <span className="kinetic-word-3">OWN.</span>
          </h1>

          <p className="kinetic-subtitle mt-6 text-base sm:text-xl text-[#2A5C69] max-w-xl leading-relaxed">
            Tell TravelMind where your head is at. It turns scattered ideas into a trip that fits you.
          </p>

          <p className="kinetic-tagline mt-3 font-note text-xs sm:text-sm text-[#1F4F5B] font-bold">
            &ldquo;Your trip, thought through.&rdquo;
          </p>

          <div className="kinetic-ctas mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button
              type="button"
              onClick={() => setLocation("/plan")}
              size="lg"
              className="rounded-full bg-[#4C9DB0] text-[#163E48] hover:bg-[#3F8C9E] border-[1.5px] border-[#1F4F5B] shadow-[4px_4px_0_#1F4F5B] hover:shadow-[2px_2px_0_#1F4F5B] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none px-8 h-12 text-base font-bold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer"
            >
              Make the trip
              <ChevronRight className="w-4 h-4 ml-1 stroke-[2.5]" />
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => scrollToSection("how-it-works")}
              className="rounded-full bg-[#FFF8E0] text-[#163E48] hover:bg-[#4C9DB0]/20 border-[1.5px] border-[#1F4F5B] px-7 h-12 text-base font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer"
            >
              See how it works
            </Button>
          </div>

          <button
            type="button"
            onClick={() => scrollToSection("how-it-works")}
            className="kinetic-scroll-cue mt-14 inline-flex flex-col items-center gap-2 text-xs font-note text-[#2A5C69] hover:text-[#163E48] transition-colors cursor-pointer"
          >
            <span>Scroll to untangle the scrapbook</span>
            <span className="w-8 h-8 rounded-full border border-[#1F4F5B]/45 bg-[#FFF8E0] flex items-center justify-center">
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            </span>
          </button>
        </div>
      </section>

      {/* SCROLL STORY 1: CHAOS -> 2: SORTING */}
      <section id="how-it-works" className="relative py-20 px-4 sm:px-8 border-t border-[#4C9DB0]/40 overflow-hidden">
        <FloatingScrapbookSticker
          variant="lightbulb"
          className="hidden 2xl:block absolute right-6 top-16 w-20 z-[1]"
          restRotate={12}
          enterX={70}
          enterY={-30}
          enterDelayMs={180}
          driftVariant="d"
          driftDurationSec={8.2}
          parallaxX={-12}
          parallaxY={10}
          scrollY={-40}
        />

        <div className="relative z-10 max-w-5xl mx-auto space-y-24">
          {/* Story Step 1: Chaos */}
          <div
            ref={chaosSection.ref}
            className="grid lg:grid-cols-12 gap-8 items-center"
          >
            <div
              data-revealed={chaosSection.inView}
              className="diary-reveal lg:col-span-5 space-y-4"
            >
              <h2 className="font-display uppercase text-4xl sm:text-5xl leading-[0.98] tracking-wide text-[#163E48] text-balance">
                All your travel ideas, everywhere.
              </h2>
              <p className="text-[#2A5C69] text-base leading-relaxed">
                Half-read food tabs, weather worries, layover notes, playlist ideas, and scribbled phrases all pile up before you even pack.
              </p>
            </div>

            <div
              data-revealed={chaosSection.inView}
              style={{ "--reveal-delay": "120ms" } as CSSProperties}
              className="diary-reveal lg:col-span-7"
            />
          </div>

          {/* Story Step 2: Sorting (scroll-triggered snap into tidy sticker-job groups) */}
          <div ref={sortSection.ref} className="space-y-8">
            <div
              data-revealed={sortSection.inView}
              className="diary-reveal flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
              <div className="space-y-2 max-w-xl">
                <h2 className="font-display uppercase text-4xl sm:text-5xl leading-[0.98] tracking-wide text-[#163E48]">
                  TravelMind sorts it.
                </h2>
                <p className="text-[#2A5C69] text-base">
                  Every collage piece takes a real job in your trip briefing—turning loose thoughts into structured intelligence.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setLocation("/plan")}
                className="self-start md:self-auto rounded-full bg-[#4C9DB0] text-[#163E48] hover:bg-[#3F8C9E] border-[1.5px] border-[#1F4F5B] shadow-[3px_3px_0_#1F4F5B] font-bold whitespace-nowrap shrink-0 cursor-pointer"
              >
                Make the trip
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {STICKER_JOBS.map((item, idx) => (
                <div
                  key={item.job}
                  style={{ transitionDelay: `${idx * 70}ms` }}
                  className={`paper-card-soft rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-600 ease-out ${
                    sortSection.inView
                      ? "opacity-100 translate-y-0 rotate-0 scale-100"
                      : "opacity-0 translate-y-7 rotate-2 scale-95"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`font-note text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#1F4F5B] ${item.accent}`}
                    >
                      {item.job}
                    </span>
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                      <ScrapbookSticker variant={item.sticker} className="w-12" />
                    </div>
                  </div>
                  <p className="text-sm text-[#2A5C69] leading-snug">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Story Step 3: How it works (3 short cards) */}
          <div ref={howStepsSection.ref} className="relative space-y-8 pt-4 border-t border-[#4C9DB0]/40">
            <div
              data-revealed={howStepsSection.revealed}
              className="diary-reveal space-y-2 max-w-xl"
            >
              <h2 className="font-display uppercase text-4xl sm:text-5xl leading-[0.98] tracking-wide text-[#163E48]">
                Three steps from scatter to sorted.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {HOW_IT_WORKS_STEPS.map((card, idx) => (
                <div
                  key={card.step}
                  data-revealed={howStepsSection.revealed}
                  style={
                    {
                      "--reveal-delay": `${100 + idx * 110}ms`,
                      "--reveal-rot": idx % 2 === 0 ? "-1.2deg" : "1.2deg",
                    } as CSSProperties
                  }
                  className="diary-reveal paper-card rounded-2xl p-6 flex flex-col justify-between gap-5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-note text-xs font-bold px-3 py-1 rounded-full border border-[#1F4F5B] ${card.accent}`}
                    >
                      Step {card.step}
                    </span>
                    <div className="w-12 h-12 flex items-center justify-center">
                      <ScrapbookSticker variant={card.sticker} className="w-12" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display uppercase text-2xl tracking-wide text-[#163E48]">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#2A5C69] leading-relaxed">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Merged editorial travel sections */}
      <EditorialTravelSections />

      {/* CONTACT & QUIET FOOTER */}
      <footer id="contact" className="border-t border-[#4C9DB0]/45 bg-[#FFEBAF] py-14 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 font-display text-2xl tracking-wide text-[#163E48]">
              <span className="w-8 h-8 rounded-full bg-[#4C9DB0] border border-[#1F4F5B] flex items-center justify-center">
                <PlaneTakeoff className="w-4 h-4 text-[#163E48]" />
              </span>
              <span>TRAVELMIND</span>
            </div>
            <p className="font-note text-xs text-[#2A5C69]">
              Your trip, thought through. Built for curious travelers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="mailto:hello@travelmind.app"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF8E0] border border-[#1F4F5B] text-sm font-medium text-[#163E48] hover:bg-[#4C9DB0] transition-colors whitespace-nowrap shrink-0"
            >
              <Mail className="w-4 h-4" />
              <span>hello@travelmind.app</span>
            </a>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/auth")}
              className="rounded-full border-[#1F4F5B] bg-[#FFF8E0] text-[#163E48] hover:bg-[#4C9DB0]/25 px-5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {user ? "Account" : "Log in"}
            </Button>
            <Button
              type="button"
              onClick={() => setLocation("/plan")}
              className="rounded-full bg-[#1F4F5B] text-[#FFEBAF] hover:bg-[#163E48] px-5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Make the trip
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
