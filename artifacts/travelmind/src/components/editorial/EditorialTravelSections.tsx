import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ScrapbookSticker,
  useDiaryReveal,
  type StickerVariant,
} from "@/components/ScrapbookStickers";

interface StatementWord {
  text: string;
  accent?: "purple" | "red" | "highlight";
}

function ScrollRevealStatement({
  words,
  kicker,
  kickerColor = "text-[#1F4F5B]",
}: {
  words: StatementWord[];
  kicker: string;
  kickerColor?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setProgress(1);
      return;
    }

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const start = vh * 0.85;
      const end = vh * 0.25;
      const raw = (start - rect.top) / Math.max(1, start - end);
      setProgress(Math.max(0, Math.min(1, raw)));
    };

    const schedule = () => {
      if (!rafId) rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const total = words.length;

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto">
      <p className={`font-note text-xs uppercase tracking-wider font-bold mb-5 ${kickerColor}`}>
        {kicker}
      </p>
      <p className="font-display uppercase text-[clamp(2.2rem,5vw,4.25rem)] leading-[0.98] tracking-wide">
        {words.map((word, idx) => {
          const threshold = idx / Math.max(1, total - 1);
          const revealed = progress >= threshold * 0.9;

          let color = revealed ? "#163E48" : "#9EC6D0";
          if (revealed && (word.accent === "purple" || word.accent === "red" || word.accent === "highlight")) {
            color = "#4C9DB0";
          }

          return (
            <span
              key={`${word.text}-${idx}`}
              className="font-display inline-block mr-[0.22em] transition-colors duration-200"
              style={{ color }}
            >
              {word.text}
            </span>
          );
        })}
      </p>
    </div>
  );
}

const STATEMENT_ONE_WORDS: StatementWord[] = [
  { text: "Some" },
  { text: "places" },
  { text: "leave" },
  { text: "you" },
  { text: "with" },
  { text: "photographs,", accent: "highlight" },
  { text: "others" },
  { text: "leave" },
  { text: "you" },
  { text: "with" },
  { text: "a" },
  { text: "feeling", accent: "highlight" },
  { text: "you" },
  { text: "carry" },
  { text: "for" },
  { text: "the" },
  { text: "rest" },
  { text: "of" },
  { text: "your" },
  { text: "life.", accent: "purple" },
];

const STATEMENT_TWO_WORDS: StatementWord[] = [
  { text: "In" },
  { text: "a" },
  { text: "world" },
  { text: "that" },
  { text: "never" },
  { text: "stops" },
  { text: "changing,", accent: "red" },
  { text: "perhaps" },
  { text: "the" },
  { text: "most" },
  { text: "beautiful" },
  { text: "thing" },
  { text: "is" },
  { text: "finding" },
  { text: "places", accent: "highlight" },
  { text: "worth" },
  { text: "visiting" },
  { text: "and" },
  { text: "moments" },
  { text: "worth" },
  { text: "remembering.", accent: "purple" },
];

interface AgentCardData {
  name: string;
  role: string;
  desc: string;
  sticker: StickerVariant;
  tag: string;
}

const TRAVEL_MIND_AGENTS: AgentCardData[] = [
  {
    name: "Weather Analysis",
    role: "Forecast & Packing Guide",
    desc: "Checks destination meteorology, severe weather risks, and compiles intelligent packing lists.",
    sticker: "clock",
    tag: "METEO_AI",
  },
  {
    name: "Disruption Alerts",
    role: "Safety & Disruption Monitor",
    desc: "Scans for road closures, regional strikes, travel advisories, and tourist scams in real time.",
    sticker: "megaphone",
    tag: "RISK_AI",
  },
  {
    name: "Driving Intelligence",
    role: "Route & Road Safety",
    desc: "Analyzes highway conditions, toll requirements, local traffic rules, and parking tips.",
    sticker: "chess",
    tag: "DRIVE_AI",
  },
  {
    name: "Cuisine Guide",
    role: "Dining & Dietary Safety",
    desc: "Recommends must-try local dishes while filtering strictly for allergy and dietary restrictions.",
    sticker: "lightbulb",
    tag: "FOOD_AI",
  },
  {
    name: "Cultural Briefing",
    role: "Etiquette & Customs Expert",
    desc: "Outlines local social customs, temple dress codes, tipping etiquette, and regional laws.",
    sticker: "statue",
    tag: "CULTURE_AI",
  },
  {
    name: "Budget Planner",
    role: "Financial & Currency Expert",
    desc: "Calculates realistic daily expenditures and currency breakdowns tailored to your trip size.",
    sticker: "envelope",
    tag: "BUDGET_AI",
  },
  {
    name: "Language Assistant",
    role: "Phonetic Phrasebook",
    desc: "Provides essential on-the-ground phrases with phonetic pronunciation guides for quick communication.",
    sticker: "speech",
    tag: "LINGO_AI",
  },
];

export function EditorialTravelSections() {
  const agentsSection = useDiaryReveal(0.12);

  return (
    <div className="overflow-x-clip">
      {/* SCROLL-REVEAL STATEMENT #1 */}
      <section id="philosophy" className="scroll-mt-24 px-4 sm:px-8 pt-14 pb-24 sm:pt-20 sm:pb-32 border-t border-[#4C9DB0]/40 bg-transparent">
        <ScrollRevealStatement
          kicker="Travel Philosophy"
          kickerColor="text-[#1F4F5B]"
          words={STATEMENT_ONE_WORDS}
        />
      </section>

      {/* AGENTS CARDS GRID SECTION (Replacing PortfolioScrollGrid) */}
      <section
        id="agents"
        ref={agentsSection.ref}
        className="scroll-mt-24 relative py-24 sm:py-32 px-4 sm:px-8 border-t border-[#4C9DB0]/40 bg-transparent overflow-hidden"
      >
        <div className="max-w-5xl mx-auto space-y-16">
          <div
            data-revealed={agentsSection.revealed}
            className="diary-reveal text-center max-w-2xl mx-auto space-y-3"
          >
            <span className="font-note text-xs uppercase tracking-wider text-[#1F4F5B] font-bold">
              Specialized Intelligence
            </span>
            <h2 className="font-display uppercase text-4xl sm:text-6xl tracking-wide text-[#163E48] leading-[0.96]">
              TravelMind Offers{" "}
              <span className="font-display inline-block text-[#4C9DB0]">
                All
              </span>
            </h2>
            <p className="font-note text-sm sm:text-base text-[#2A5C69] font-bold">
              &ldquo;A team of AI agents, working on your trip.&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {TRAVEL_MIND_AGENTS.map((agent, idx) => (
              <div
                key={agent.name}
                data-revealed={agentsSection.revealed}
                style={
                  {
                    "--reveal-delay": `${120 + idx * 80}ms`,
                    "--reveal-rot": idx % 2 === 0 ? "-0.6deg" : "0.6deg",
                  } as CSSProperties
                }
                className="diary-reveal paper-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[6px_8px_0_#4C9DB0]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="font-display text-xs uppercase tracking-widest text-[#4C9DB0] inline-block">
                      {agent.tag}
                    </span>
                    <h3 className="font-display uppercase text-2xl tracking-wide text-[#163E48] pt-1">
                      {agent.name}
                    </h3>
                    <p className="font-note text-xs font-bold text-[#2A5C69]">{agent.role}</p>
                  </div>
                  <div className="w-14 h-14 shrink-0 flex items-center justify-center p-1 bg-[#FFF8E0] rounded-xl border border-[#1F4F5B]/40 shadow-[2px_2px_0_#4C9DB0]">
                    <ScrapbookSticker variant={agent.sticker} className="w-10 h-10" />
                  </div>
                </div>

                <p className="text-sm text-[#2A5C69] leading-relaxed pt-2 border-t border-[#4C9DB0]/35">
                  {agent.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECOND SCROLL-REVEAL STATEMENT */}
      <section className="px-4 sm:px-8 py-20 sm:py-24 border-t border-[#4C9DB0]/40 bg-transparent">
        <ScrollRevealStatement
          kicker="Architecture of Rest"
          kickerColor="text-[#1F4F5B]"
          words={STATEMENT_TWO_WORDS}
        />
      </section>
    </div>
  );
}
