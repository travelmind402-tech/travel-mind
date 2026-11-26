import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { FlowButton } from "@/components/ui/flow-button";
import {
  ScrapbookSticker,
  useDiaryReveal,
  useScrapbookMotion,
  type StickerVariant,
} from "@/components/ScrapbookStickers";
import { PageFloatingStickers } from "@/components/PageFloatingStickers";
import { EditorialTravelSections } from "@/components/editorial/EditorialTravelSections";
import {
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
    accent: "bg-[#FFF8E0] text-[#4C9DB0]",
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
    accent: "bg-[#FFF8E0] text-[#4C9DB0]",
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
    accent: "bg-[#FFF8E0] text-[#4C9DB0]",
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
    accent: "bg-[#FFF8E0] text-[#4C9DB0]",
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

import { ScrapbookHeroTransition } from "@/components/ScrapbookHeroTransition";
import { ScrollIntroFlythrough } from "@/components/ScrollIntroFlythrough";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const homeRevealRef = useRef<HTMLDivElement | null>(null);
  useScrapbookMotion(pageRef);

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
      <div className="fixed top-3 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
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
                <FlowButton
                  size="sm"
                  variant="secondary"
                  text="Log out"
                  onClick={() => void logout()}
                />
              </div>
            ) : (
              <FlowButton
                size="sm"
                variant="secondary"
                text="Log in"
                onClick={() => setLocation("/auth")}
              />
            )}

            <FlowButton
              size="sm"
              variant="primary"
              text="Make the trip"
              onClick={() => setLocation("/plan")}
              className="font-bold"
            />
          </div>
        </header>
      </div>

      {/* ADDITIVE: SCROLL-DRIVEN 3D INTRO ANIMATION (ACTS 1–6) */}
      <ScrollIntroFlythrough
        revealTargetRef={homeRevealRef}
        quote={
          <div className="max-w-2xl mx-auto px-6 text-center">
            <blockquote className="font-display uppercase text-[clamp(2.5rem,6.5vw,5.25rem)] leading-[0.95] tracking-wide text-[#163E48] text-balance">
              Every journey starts in the{" "}
              <span className="text-[#4C9DB0]">mind.</span>
            </blockquote>
            <p className="mt-4 font-note text-sm sm:text-base font-bold text-[#2A5C69] tracking-widest">
              - TravelMind
            </p>
          </div>
        }
      />

      <div ref={homeRevealRef} className="intro-home-reveal">
      {/* SCROLL-SCRUBBED SCRAPBOOK HERO */}
      <ScrapbookHeroTransition id="home">
        {/* Center Hero Copy */}
        <div className="relative max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="kinetic-badge inline-flex items-center mb-7">
            <span className="font-note text-sm sm:text-base font-bold tracking-wide text-[#4C9DB0]">
              Your AI travel mind is here
            </span>
          </div>

          <h1 className="font-display uppercase text-[clamp(3rem,7vw,5.75rem)] leading-[0.94] tracking-wide text-[#163E48] text-balance max-w-3xl">
            <span className="kinetic-line-1">TRAVEL WITH A</span>{" "}
            <span className="kinetic-cutout-mind font-display inline-block text-[#4C9DB0]">
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
            <FlowButton
              size="lg"
              variant="primary"
              text="Make the trip"
              onClick={() => setLocation("/plan")}
            />

            <FlowButton
              size="lg"
              variant="secondary"
              text="See how it works"
              onClick={() => scrollToSection("how-it-works")}
              className="font-semibold"
            />
          </div>
        </div>
      </ScrapbookHeroTransition>

      <div className="relative">
        <PageFloatingStickers variant="landing" />

        {/* SCROLL STORY 1: CHAOS -> 2: SORTING */}
        <section id="how-it-works" className="relative z-[2] py-20 px-4 sm:px-8 border-t border-[#4C9DB0]/40 overflow-hidden">
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
                All your travel ideas,{" "}
                <span className="text-[#4C9DB0]">everywhere.</span>
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
                  TravelMind <span className="text-[#4C9DB0]">sorts it.</span>
                </h2>
                <p className="text-[#2A5C69] text-base">
                  Every collage piece takes a real job in your trip briefing—turning loose thoughts into structured intelligence.
                </p>
              </div>
              <FlowButton
                size="md"
                variant="primary"
                text="Make the trip"
                onClick={() => setLocation("/plan")}
                className="self-start md:self-auto font-bold"
              />
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
                    <span className="font-display uppercase text-lg tracking-wide text-[#4C9DB0]">
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
                Three steps from scatter to{" "}
                <span className="text-[#4C9DB0]">sorted.</span>
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
                    <span className="font-display uppercase text-sm tracking-wider text-[#4C9DB0]">
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
        <div className="relative z-[2]">
          <EditorialTravelSections />
        </div>

        {/* CONTACT & QUIET FOOTER */}
        <footer id="contact" className="relative z-[2] border-t border-[#4C9DB0]/45 bg-[#FFEBAF]/85 py-14 px-4 sm:px-8">
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
              <FlowButton
                size="sm"
                variant="secondary"
                text={user ? "Account" : "Log in"}
                onClick={() => setLocation("/auth")}
              />
              <FlowButton
                size="sm"
                variant="teal"
                text="Make the trip"
                onClick={() => setLocation("/plan")}
                className="font-bold"
              />
            </div>
          </div>
        </footer>
      </div>
      </div>
    </div>
  );
}
