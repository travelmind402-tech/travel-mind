import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { FlowButton } from "@/components/ui/flow-button";
import {
  ScrapbookSticker,
  useScrapbookMotion,
  type StickerVariant,
} from "@/components/ScrapbookStickers";
import { PageFloatingStickers } from "@/components/PageFloatingStickers";
import { EditorialTravelSections } from "@/components/editorial/EditorialTravelSections";
import PushpinTearFooter from "@/components/ui/pushpin-tear-footer";
import { SterlingGateKineticNavigation } from "@/components/ui/sterling-gate-kinetic-navigation";
import { FlappingButterfly } from "@/components/butterfly/FlappingButterfly";
import { Plane } from "lucide-react";

// TODO: Replace with real TravelMind contact email
const CONTACT_EMAIL = "hello@example.com";

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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen paper-texture text-[#163E48] overflow-x-clip">
      {/* Floating Cream Pill Navbar + Kinetic Right-Hand Sidebar (hidden during Scene 0 intro) */}
      <SterlingGateKineticNavigation
        hasIntro={true}
        user={user}
        onLogout={() => void logout()}
        onNavigate={(href) => {
          setLocation(href);
          window.scrollTo({ top: 0 });
        }}
      />

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
            <span className="kinetic-cutout-mind font-display relative inline-block text-[#4C9DB0]">
              MIND
              <FlappingButterfly />
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
        <section className="relative z-[2] py-12 md:py-16 lg:py-20 px-4 sm:px-8 border-t border-[#4C9DB0]/40 overflow-hidden">
          <div className="relative z-10 max-w-5xl mx-auto space-y-4 md:space-y-5">
          {/* Story Step 1: Chaos */}
          <div
            ref={chaosSection.ref}
            className="grid lg:grid-cols-12 items-center"
          >
            <div
              data-revealed={chaosSection.inView}
              className="diary-reveal lg:col-span-5"
            >
              <h2 className="font-display uppercase text-4xl sm:text-5xl leading-[0.98] tracking-wide text-[#163E48] text-balance">
                All your travel{" "}
                <span className="text-[#4C9DB0]">ideas.</span>
              </h2>
            </div>
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

          </div>
        </section>

        <div id="how-it-works" aria-hidden="true" className="h-0 scroll-mt-24" />

        {/* Merged editorial travel sections */}
        <div className="relative z-[2]">
          <EditorialTravelSections />
        </div>
      </div>

      {/* PUSHPIN TEAR FOOTER */}
      <PushpinTearFooter
        id="contact"
        className="w-full relative z-20"
        height="min(100svh, 860px)"
        sheet="#276F86"
        sheetInk="#FFF8E0"
        paper="#FFEBAF"
        paperInk="#163E48"
        fontSans="'Shadows Into Light', cursive, sans-serif"
        brand="travelmind"
        name="TravelMind"
        tagline="your trip, thought through"
        logo={
          <span className="w-10 h-10 rounded-full border-[1.5px] border-[#FFF8E0] flex items-center justify-center text-[#FFF8E0]">
            <Plane className="w-4 h-4" />
          </span>
        }
        logoHref="/"
        email={CONTACT_EMAIL}
        // TODO: Replace these placeholder URLs with real GitHub and LinkedIn profile links
        socials={[
          { icon: "github", label: "GitHub", href: "https://github.com/YOUR_GITHUB_USERNAME" },
          { icon: "linkedin", label: "LinkedIn", href: "https://linkedin.com/in/YOUR_LINKEDIN_USERNAME" },
        ]}
        newsletter={null}
        cta={{ label: "Make the trip", hint: "ready when your ideas are", href: "/plan" }}
        status={{ label: "seven AI agents, one trip", href: "/plan" }}
        mark="est. 2026"
        timeZone="Asia/Kolkata"
        timeLabel="IST"
        columns={[
          {
            title: "explore",
            links: [
              { label: "Home", href: "/" },
              { label: "How it works", href: "#how-it-works" },
              { label: "Contact", href: "#contact" },
            ],
            cta: { label: "trip", href: "/plan" },
          },
          {
            title: "account",
            links: [
              { label: "Log in", href: "/auth" },
              { label: "Sign up", href: "/auth" },
              { label: "Make the trip", href: "/plan" },
            ],
            cta: { label: "hello", href: `mailto:${CONTACT_EMAIL}` },
          },
        ]}
        chat={{ label: "say hi" }}
        sideLinks={[
          { icon: "globe", label: "how it works", href: "#how-it-works" },
          { icon: "mail", label: "contact", href: `mailto:${CONTACT_EMAIL}` },
        ]}
        copyright="© 2026 TravelMind"
        credit="made for wanderers"
        // TODO: Replace with real handle and profile link
        handle={{ label: "@your_handle", href: "https://github.com/YOUR_GITHUB_USERNAME" }}
        seed={7}
        onNavigate={(href) => {
          if (href === "/") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          } else {
            setLocation(href);
            window.scrollTo({ top: 0 });
          }
        }}
      />
      </div>
    </div>
  );
}
