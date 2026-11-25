import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useTrip } from "@/context/TripContext";
import { startSession } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ScrapbookSticker,
  useParallaxOffset,
  type StickerVariant,
} from "@/components/ScrapbookStickers";
import {
  PlaneTakeoff,
  Loader2,
  LogOut,
  X,
  Plus,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  MapPin,
  Check,
} from "lucide-react";

const TRAVELER_TYPES = ["solo", "family", "elderly", "student"];
const CUISINE_PREFS = ["all", "local", "street", "fine_dining"];
const BUDGET_TIERS = ["budget", "mid_range", "luxury"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD"];
const TRAVEL_STYLES = ["general", "adventure", "cultural", "relaxation", "business"];
const COMMON_ALLERGIES = ["Peanuts", "Shellfish", "Dairy", "Gluten", "Eggs", "Soy"];
const COMMON_DIETS = ["Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-Free"];

const COUNTRY_ALIASES: Record<string, string> = {
  america: "United States",
  burma: "Myanmar",
  england: "United Kingdom",
  india: "India",
  japan: "Japan",
  korea: "South Korea",
  "south korea": "South Korea",
  "uae": "United Arab Emirates",
  "u.a.e": "United Arab Emirates",
  "united arab emirates": "United Arab Emirates",
  "uk": "United Kingdom",
  "u.k": "United Kingdom",
  "united kingdom": "United Kingdom",
  "us": "United States",
  "u.s": "United States",
  "usa": "United States",
  "u.s.a": "United States",
  "united states": "United States",
  "united states of america": "United States",
};

const CITY_ALIASES: Record<string, string> = {
  rangoon: "Yangon",
};

type DestinationStatus = "idle" | "checking" | "valid" | "invalid";
type DestinationValidation = {
  key: string;
  status: DestinationStatus;
  warning: string | null;
};

const formatDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeLocationValue = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
const normalizeCountryName = (value: string) => {
  const normalized = normalizeLocationValue(value).replace(/\./g, "");

  return COUNTRY_ALIASES[normalized] || value.trim();
};
const normalizeCityName = (value: string) => {
  const normalized = normalizeLocationValue(value);

  return CITY_ALIASES[normalized] || value.trim();
};

const countriesMatch = (left: string, right: string) =>
  normalizeLocationValue(normalizeCountryName(left)) === normalizeLocationValue(normalizeCountryName(right));
const getDestinationKey = (city: string, country: string) =>
  `${normalizeLocationValue(normalizeCityName(city))}|${normalizeLocationValue(normalizeCountryName(country))}`;

function TagInput({
  label,
  tags,
  onAdd,
  onRemove,
  onPendingChange,
  placeholder,
  suggestions,
}: {
  label: string;
  tags: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
  onPendingChange?: (v: string) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const [val, setVal] = useState("");

  const add = (v: string) => {
    const trimmed = v.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
    }
    setVal("");
    onPendingChange?.("");
  };

  return (
    <div className="space-y-2.5">
      <Label className="text-sm font-semibold text-[#163E48]">{label}</Label>
      {suggestions && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C9DB0] ${
                tags.includes(s)
                  ? "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48] shadow-[2px_2px_0_#163E48]"
                  : "bg-[#FFF8E0] border-[#4C9DB0]/65 hover:border-[#1F4F5B] text-[#2A5C69] hover:text-[#163E48]"
              }`}
            >
              {tags.includes(s) ? `✓ ${s}` : `+ ${s}`}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            onPendingChange?.(e.target.value);
          }}
          placeholder={placeholder || "Type and press Enter"}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(val);
            }
          }}
          className="flex-1 h-11 bg-[#FFF8E0] border-[1.5px] border-[#4C9DB0] focus-visible:border-[#1F4F5B] focus-visible:ring-[#4C9DB0]/30 rounded-xl text-[#163E48] placeholder:text-[#2F7282]"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label={`Add ${label}`}
          onClick={() => add(val)}
          className="h-11 px-4 rounded-xl border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0] text-[#163E48] hover:bg-[#3F8C9E] shadow-[2px_2px_0_#1F4F5B] active:translate-y-0.5 active:shadow-none transition-all duration-150"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((t) => (
            <Badge
              key={t}
              variant="secondary"
              className="gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-[#4C9DB0]/25 text-[#163E48] border border-[#1F4F5B]/65 font-medium text-xs"
            >
              <span>{t}</span>
              <button
                type="button"
                aria-label={`Remove ${t}`}
                onClick={() => onRemove(t)}
                className="w-5 h-5 rounded-full inline-flex items-center justify-center hover:bg-[#1F4F5B] hover:text-[#FFEBAF] transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

const STEPS = ["Destination", "Traveler", "Preferences", "Budget & Language"];

const STEP_MASCOTS: {
  sticker: StickerVariant;
  note: string;
  tag: string;
  accent: string;
}[] = [
  {
    sticker: "pushpin",
    note: "Pin the map — we'll sort out the route & layovers.",
    tag: "Stop 01 · Route",
    accent: "bg-[#FFEBAF] text-[#163E48]",
  },
  {
    sticker: "clock",
    note: "Solo sprint, family caravan, or unhurried pace?",
    tag: "Stop 02 · Crew",
    accent: "bg-[#4C9DB0] text-[#163E48]",
  },
  {
    sticker: "lightbulb",
    note: "Tell us what fuels you and what to keep off your plate.",
    tag: "Stop 03 · Taste",
    accent: "bg-[#1F4F5B] text-[#FFEBAF]",
  },
  {
    sticker: "handpen",
    note: "Daily spend, currency, and the phrases worth pocketing.",
    tag: "Stop 04 · Pocket",
    accent: "bg-[#163E48] text-[#FFEBAF]",
  },
];

const LOADING_MESSAGES = [
  "Shuffling your travel notes into place...",
  "Pinning destinations, weather, and transit legs...",
  "Preparing your 7 specialized TravelMind briefings...",
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { setSession } = useTrip();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPhrase, setPendingPhrase] = useState("");
  const [destinationValidation, setDestinationValidation] = useState<DestinationValidation>({
    key: "",
    status: "idle",
    warning: null,
  });

  const [form, setForm] = useState({
    city: "",
    country: "",
    travel_start_date: "",
    travel_end_date: "",
    traveler_type: "solo",
    family_members: 0,
    group_size: 1,
    known_allergies: [] as string[],
    known_sensitivities: [] as string[],
    transit_waypoints: [] as string[],
    dietary_restrictions: [] as string[],
    cuisine_preferences: "all",
    travel_style: "general",
    daily_budget: 3000,
    currency: "INR",
    budget_tier: "mid_range",
    native_language: "English",
    phrases_needed: [] as string[],
  });

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const parallax = useParallaxOffset(14);

  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return;
    }
    const id = window.setInterval(() => {
      setLoadingMessageIndex((idx) => (idx + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, [loading]);

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const addTag = (key: string) => (v: string) => set(key, [...(form as any)[key], v]);
  const removeTag = (key: string) => (v: string) =>
    set(key, (form as any)[key].filter((t: string) => t !== v));
  const today = formatDateInputValue(new Date());

  const getDateWarning = () => {
    if (form.travel_start_date && form.travel_start_date < today) {
      return "Start date should be today or later --- unless you've invented time travel";
    }

    if (
      form.travel_start_date &&
      form.travel_end_date &&
      form.travel_start_date >= form.travel_end_date
    ) {
      return "Start date must be before the end date.";
    }

    return null;
  };

  const dateWarning = getDateWarning();
  const currentDestinationKey = getDestinationKey(form.city, form.country);
  const destinationStatus = !form.city.trim() || !form.country.trim()
    ? "idle"
    : destinationValidation.key === currentDestinationKey
    ? destinationValidation.status
    : "checking";
  const destinationWarning =
    destinationValidation.key === currentDestinationKey ? destinationValidation.warning : null;

  useEffect(() => {
    const city = normalizeCityName(form.city);
    const country = form.country.trim();
    const validationKey = getDestinationKey(city, country);

    if (!city || !country) {
      setDestinationValidation({ key: validationKey, status: "idle", warning: null });
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setDestinationValidation({ key: validationKey, status: "checking", warning: null });

      try {
        const params = new URLSearchParams({
          name: city,
          count: "10",
          language: "en",
          format: "json",
        });
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Destination validation failed");

        const data = await res.json();
        const results = Array.isArray(data?.results) ? data.results : [];
        if (!results.length) {
          setDestinationValidation({
            key: validationKey,
            status: "invalid",
            warning: `We could not find a city named ${city}. Please enter a valid destination city.`,
          });
          return;
        }

        const matchingResult = results.find((result: any) => countriesMatch(result?.country || "", country));
        if (matchingResult) {
          setDestinationValidation({ key: validationKey, status: "valid", warning: null });
          return;
        }

        setDestinationValidation({
          key: validationKey,
          status: "invalid",
          warning: "Invalid input. Please enter a valid matching city and country.",
        });
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setDestinationValidation({
          key: validationKey,
          status: "invalid",
          warning: "Could not validate this destination right now. Please check the city and country.",
        });
      }
    }, 500);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [form.city, form.country]);

  const handleSubmit = async () => {
    const warning = getDateWarning() || destinationWarning;
    if (warning) {
      setError(warning);
      return;
    }
    if (destinationStatus !== "valid") {
      setError("Please enter a valid matching city and country before creating the trip.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const trimmedPendingPhrase = pendingPhrase.trim();
      const phrasesNeeded = trimmedPendingPhrase && !form.phrases_needed.includes(trimmedPendingPhrase)
        ? [...form.phrases_needed, trimmedPendingPhrase]
        : form.phrases_needed;
      const payload = {
        ...form,
        phrases_needed: phrasesNeeded.length ? phrasesNeeded : null,
      };
      const { user_id, trip_id } = await startSession(payload);
      setSession(user_id, trip_id, { ...form, phrases_needed: phrasesNeeded });
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create trip session");
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) {
      return (
        form.city &&
        form.country &&
        form.travel_start_date &&
        form.travel_end_date &&
        !dateWarning &&
        destinationStatus === "valid"
      );
    }
    if (step === 1) return !!form.traveler_type;
    return true;
  };

  const currentMascot = STEP_MASCOTS[step];

  return (
    <div className="min-h-screen paper-texture text-[#163E48] overflow-x-hidden flex flex-col">
      {/* Compact Header with Logo & Optional Logged-in User */}
      <header className="border-b border-[#4C9DB0]/55 bg-[#FFF8E0]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-xl tracking-wide text-[#163E48] whitespace-nowrap shrink-0"
          >
            <span className="w-7 h-7 rounded-full bg-[#4C9DB0] border border-[#1F4F5B] flex items-center justify-center">
              <PlaneTakeoff className="w-3.5 h-3.5 text-[#163E48]" />
            </span>
            <span>TRAVELMIND</span>
          </Link>

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <>
                <span className="font-note text-xs font-bold text-[#2A5C69] max-w-[160px] truncate">
                  {user.name}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void logout()}
                  className="rounded-full border-[1.5px] border-[#1F4F5B] bg-[#FFEBAF] text-[#163E48] hover:bg-[#4C9DB0] h-9 px-3.5 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Log out
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLocation("/auth")}
                className="rounded-full border-[1.5px] border-[#1F4F5B] bg-[#FFF8E0] text-[#163E48] hover:bg-[#4C9DB0] h-9 px-4 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
              >
                Log in
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* THE 4-STEP WIZARD */}
      <main id="trip-wizard" className="relative flex-1 py-10 sm:py-14 px-4 sm:px-6">
        {/* Edge decorative stickers around the wizard on large viewports (never behind inputs) */}
        <div
          aria-hidden="true"
          className="hidden xl:block absolute left-8 top-24 w-28 pointer-events-none opacity-95"
          style={{
            transform: `translate3d(${parallax.x * -0.4}px, ${parallax.y * -0.3}px, 0)`,
          }}
        >
          <div className="animate-sticker-float" style={{ ["--sticker-rot" as string]: "-8deg" }}>
            <ScrapbookSticker variant="newsbird" className="w-full" />
          </div>
        </div>
        <div
          aria-hidden="true"
          className="hidden xl:block absolute right-8 bottom-20 w-24 pointer-events-none opacity-95"
          style={{
            transform: `translate3d(${parallax.x * 0.4}px, ${parallax.y * 0.3}px, 0)`,
          }}
        >
          <div className="animate-sticker-float-alt" style={{ ["--sticker-rot" as string]: "9deg" }}>
            <ScrapbookSticker variant="star" className="w-full" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="font-note text-xs uppercase tracking-wider text-[#1F4F5B] font-bold">
              Your trip, thought through
            </span>
            <h1 className="font-display uppercase text-4xl sm:text-5xl tracking-wide text-[#163E48]">
              Four stops to a thought-through trip.
            </h1>
            <p className="font-note text-xs sm:text-sm text-[#2A5C69]">
              Takes ~60 seconds. Every field shapes your 7 AI travel briefings.
            </p>
          </div>

          {/* Themed Route Progress Tracker (Pushpin moving along a dotted route) */}
          <div className="max-w-2xl mx-auto mb-10 px-2" aria-label="Wizard progress">
            <div className="relative flex items-start justify-between">
              {/* Dotted background route */}
              <div
                aria-hidden="true"
                className="absolute top-5 left-6 right-6 border-t-2 border-dashed border-[#4C9DB0]/65"
              />
              {/* Completed route fill */}
              <div
                aria-hidden="true"
                className="absolute top-5 left-6 border-t-2 border-[#1F4F5B] transition-all duration-300"
                style={{
                  width: `calc(${(step / (STEPS.length - 1)) * 100}% - ${step === 0 ? "0px" : "48px"})`,
                }}
              />

              {STEPS.map((s, i) => {
                const isDone = i < step;
                const isCurrent = i === step;
                return (
                  <div key={s} className="relative z-10 flex flex-col items-center gap-2 w-1/4 text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 border-[1.5px] ${
                        isCurrent
                          ? "bg-[#4C9DB0] border-[#1F4F5B] text-[#163E48] shadow-[2px_2px_0_#1F4F5B] scale-110"
                          : isDone
                          ? "bg-[#1F4F5B] border-[#1F4F5B] text-[#FFEBAF]"
                          : "bg-[#FFF8E0] border-[#4C9DB0]/70 text-[#2F7282]"
                      }`}
                    >
                      {isCurrent ? (
                        <MapPin className="w-4 h-4 fill-[#FFEBAF] text-[#163E48]" />
                      ) : isDone ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <span className="font-note text-xs font-bold">{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] sm:text-xs leading-tight px-1 ${
                        isCurrent
                          ? "font-bold text-[#163E48]"
                          : isDone
                          ? "font-semibold text-[#2A5C69]"
                          : "font-medium text-[#2F7282]"
                      }`}
                    >
                      {s}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wizard Grid: Card + Side Step Mascot */}
          <div className="grid lg:grid-cols-12 gap-8 items-start max-w-4xl mx-auto">
            {/* Step Mascot Sidebar Note */}
            <aside className="lg:col-span-4 order-1 lg:order-2 flex lg:flex-col items-center lg:items-start gap-4 bg-[#FFF8E0] border-[1.5px] border-[#1F4F5B] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0_#1F4F5B]">
              <div className="w-16 sm:w-20 lg:w-24 shrink-0 lg:rotate-[-3deg]">
                <ScrapbookSticker variant={currentMascot.sticker} className="w-full" />
              </div>
              <div className="space-y-2">
                <span className={`inline-block font-note text-[11px] font-bold px-2.5 py-0.5 rounded border border-[#1F4F5B] ${currentMascot.accent}`}>
                  {currentMascot.tag}
                </span>
                <p className="font-note text-xs sm:text-sm text-[#163E48] leading-relaxed">
                  {currentMascot.note}
                </p>
              </div>
            </aside>

            {/* Postcard / Ticket Form Card */}
            <div className="lg:col-span-8 order-2 lg:order-1 relative">
              {/* Decorative masking tape strip (never tilted on inputs) */}
              <div
                aria-hidden="true"
                className="hidden sm:block absolute -top-3 left-10 w-24 h-6 bg-[#4C9DB0]/80 border border-[#1F4F5B]/45 -rotate-2 z-20 pointer-events-none"
              />

              <Card className="paper-card rounded-3xl overflow-hidden border-[1.5px] border-[#1F4F5B]">
                {loading ? (
                  <CardContent className="py-16 px-6 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-16 animate-sticker-shuffle">
                        <ScrapbookSticker variant="envelope" />
                      </div>
                      <div className="w-16 animate-sticker-shuffle [animation-delay:0.25s]">
                        <ScrapbookSticker variant="speech" />
                      </div>
                      <div className="w-16 animate-sticker-shuffle [animation-delay:0.5s]">
                        <ScrapbookSticker variant="swallow" />
                      </div>
                    </div>
                    <div className="space-y-2 max-w-sm">
                      <h3 className="font-display text-xl font-bold text-[#163E48]">
                        Sorting your scrapbook...
                      </h3>
                      <p className="font-note text-sm text-[#1F4F5B] font-bold">
                        {LOADING_MESSAGES[loadingMessageIndex]}
                      </p>
                    </div>
                  </CardContent>
                ) : (
                  <>
                    <CardHeader className="pb-4 pt-7 px-6 sm:px-8 border-b border-dashed border-[#4C9DB0]/60 bg-[#FFEBAF]/50">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-note text-xs text-[#2A5C69]">
                          Step {step + 1} of {STEPS.length}
                        </span>
                        <span className="font-note text-xs text-[#1F4F5B] font-bold">
                          TravelMind Brief
                        </span>
                      </div>
                      <CardTitle className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#163E48] mt-1">
                        {STEPS[step]}
                      </CardTitle>
                      <CardDescription className="text-sm text-[#2A5C69]">
                        {step === 0 && "Where are you heading and when?"}
                        {step === 1 && "Tell us about your travel crew"}
                        {step === 2 && "Your food cravings, sensitivities, and travel pace"}
                        {step === 3 && "Daily spend, currency, and phrases worth knowing"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent key={step} className="space-y-5 p-6 sm:p-8 animate-step-enter">
                      {step === 0 && (
                        <>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="city" className="text-sm font-semibold text-[#163E48]">
                                City *
                              </Label>
                              <Input
                                id="city"
                                placeholder="e.g. Tokyo"
                                value={form.city}
                                onChange={(e) => set("city", e.target.value)}
                                className="h-12 bg-[#FFF8E0] border-[1.5px] border-[#4C9DB0] focus-visible:border-[#1F4F5B] focus-visible:ring-[#4C9DB0]/30 rounded-xl text-base text-[#163E48] placeholder:text-[#2F7282]"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="country" className="text-sm font-semibold text-[#163E48]">
                                Country *
                              </Label>
                              <Input
                                id="country"
                                placeholder="e.g. Japan"
                                value={form.country}
                                onChange={(e) => set("country", e.target.value)}
                                className="h-12 bg-[#FFF8E0] border-[1.5px] border-[#4C9DB0] focus-visible:border-[#1F4F5B] focus-visible:ring-[#4C9DB0]/30 rounded-xl text-base text-[#163E48] placeholder:text-[#2F7282]"
                              />
                            </div>
                          </div>

                          {destinationWarning && (
                            <div
                              role="alert"
                              className="flex items-start gap-2.5 rounded-xl border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0]/25 p-3.5 text-sm font-medium text-[#163E48]"
                            >
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#1F4F5B]" />
                              <span>{destinationWarning}</span>
                            </div>
                          )}

                          {destinationStatus === "checking" && (
                            <div className="flex items-center gap-2.5 rounded-xl border border-[#4C9DB0]/65 bg-[#FFF8E0] p-3 text-sm font-note text-[#2A5C69]">
                              <Loader2 className="h-4 w-4 animate-spin text-[#4C9DB0]" />
                              <span>Checking city and country on the atlas...</span>
                            </div>
                          )}

                          {destinationStatus === "valid" && (
                            <div className="flex items-center gap-2 rounded-xl border border-[#4C9DB0] bg-[#4C9DB0]/20 px-3.5 py-2 text-xs font-note font-bold text-[#163E48]">
                              <Check className="h-3.5 w-3.5 text-[#1F4F5B]" />
                              <span>Destination pinned cleanly.</span>
                            </div>
                          )}

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="start" className="text-sm font-semibold text-[#163E48]">
                                Start Date *
                              </Label>
                              <Input
                                id="start"
                                type="date"
                                min={today}
                                value={form.travel_start_date}
                                onChange={(e) => set("travel_start_date", e.target.value)}
                                className="h-12 bg-[#FFF8E0] border-[1.5px] border-[#4C9DB0] focus-visible:border-[#1F4F5B] focus-visible:ring-[#4C9DB0]/30 rounded-xl text-base text-[#163E48]"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="end" className="text-sm font-semibold text-[#163E48]">
                                End Date *
                              </Label>
                              <Input
                                id="end"
                                type="date"
                                min={form.travel_start_date || today}
                                value={form.travel_end_date}
                                onChange={(e) => set("travel_end_date", e.target.value)}
                                className="h-12 bg-[#FFF8E0] border-[1.5px] border-[#4C9DB0] focus-visible:border-[#1F4F5B] focus-visible:ring-[#4C9DB0]/30 rounded-xl text-base text-[#163E48]"
                              />
                            </div>
                          </div>

                          {dateWarning && (
                            <div
                              role="alert"
                              className="flex items-start gap-2.5 rounded-xl border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0]/25 p-3.5 text-sm font-medium text-[#163E48]"
                            >
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#1F4F5B]" />
                              <span>{dateWarning}</span>
                            </div>
                          )}

                          <div className="pt-1">
                            <TagInput
                              label="Transit Waypoints (optional)"
                              tags={form.transit_waypoints}
                              onAdd={addTag("transit_waypoints")}
                              onRemove={removeTag("transit_waypoints")}
                              placeholder="e.g. Dubai, Singapore"
                            />
                            <p className="font-note text-xs text-[#2A5C69] mt-1.5">
                              Layovers or road stops you want checked for weather & disruptions.
                            </p>
                          </div>
                        </>
                      )}

                      {step === 1 && (
                        <>
                          <div className="space-y-2.5">
                            <Label className="text-sm font-semibold text-[#163E48]">Traveler Type *</Label>
                            <div className="grid grid-cols-2 gap-3">
                              {TRAVELER_TYPES.map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => set("traveler_type", t)}
                                  className={`px-4 py-3.5 rounded-xl border-[1.5px] text-sm font-semibold capitalize transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C9DB0] ${
                                    form.traveler_type === t
                                      ? "bg-[#4C9DB0] text-[#163E48] border-[#1F4F5B] shadow-[3px_3px_0_#1F4F5B]"
                                      : "bg-[#FFF8E0] border-[#4C9DB0]/70 hover:border-[#1F4F5B] text-[#163E48]"
                                  }`}
                                >
                                  {t === "solo" && "Solo"}
                                  {t === "family" && "Family"}
                                  {t === "elderly" && "Senior"}
                                  {t === "student" && "Student"}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="group_size" className="text-sm font-semibold text-[#163E48]">
                                Group Size
                              </Label>
                              <Input
                                id="group_size"
                                type="number"
                                min={1}
                                value={form.group_size}
                                onChange={(e) => set("group_size", parseInt(e.target.value) || 1)}
                                className="h-12 bg-[#FFF8E0] border-[1.5px] border-[#4C9DB0] focus-visible:border-[#1F4F5B] focus-visible:ring-[#4C9DB0]/30 rounded-xl text-base"
                              />
                            </div>
                            {form.traveler_type === "family" && (
                              <div className="space-y-2">
                                <Label htmlFor="family_members" className="text-sm font-semibold text-[#163E48]">
                                  Family Members
                                </Label>
                                <Input
                                  id="family_members"
                                  type="number"
                                  min={0}
                                  value={form.family_members}
                                  onChange={(e) => set("family_members", parseInt(e.target.value) || 0)}
                                  className="h-12 bg-[#FFF8E0] border-[1.5px] border-[#4C9DB0] focus-visible:border-[#1F4F5B] focus-visible:ring-[#4C9DB0]/30 rounded-xl text-base"
                                />
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {step === 2 && (
                        <>
                          <div className="space-y-2.5">
                            <Label className="text-sm font-semibold text-[#163E48]">Cuisine Preference</Label>
                            <div className="grid grid-cols-2 gap-3">
                              {CUISINE_PREFS.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => set("cuisine_preferences", c)}
                                  className={`px-3 py-3 rounded-xl border-[1.5px] text-sm font-semibold capitalize transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C9DB0] ${
                                    form.cuisine_preferences === c
                                      ? "bg-[#4C9DB0] text-[#163E48] border-[#1F4F5B] shadow-[3px_3px_0_#1F4F5B]"
                                      : "bg-[#FFF8E0] border-[#4C9DB0]/70 hover:border-[#1F4F5B] text-[#163E48]"
                                  }`}
                                >
                                  {c === "fine_dining" ? "Fine Dining" : c.charAt(0).toUpperCase() + c.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-[#163E48]">Travel Style</Label>
                            <Select value={form.travel_style} onValueChange={(v) => set("travel_style", v)}>
                              <SelectTrigger className="h-12 bg-[#FFF8E0] border-[1.5px] border-[#4C9DB0] focus:ring-[#4C9DB0]/30 rounded-xl text-base">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#FFF8E0] border-[#1F4F5B]">
                                {TRAVEL_STYLES.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <TagInput
                            label="Dietary Restrictions"
                            tags={form.dietary_restrictions}
                            onAdd={addTag("dietary_restrictions")}
                            onRemove={removeTag("dietary_restrictions")}
                            placeholder="Add restriction"
                            suggestions={COMMON_DIETS}
                          />
                          <TagInput
                            label="Known Allergies"
                            tags={form.known_allergies}
                            onAdd={addTag("known_allergies")}
                            onRemove={removeTag("known_allergies")}
                            placeholder="Add allergy"
                            suggestions={COMMON_ALLERGIES}
                          />
                          <TagInput
                            label="Known Sensitivities"
                            tags={form.known_sensitivities}
                            onAdd={addTag("known_sensitivities")}
                            onRemove={removeTag("known_sensitivities")}
                            placeholder="e.g. strong spices, loud environments"
                          />
                        </>
                      )}

                      {step === 3 && (
                        <>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-2">
                              <Label htmlFor="budget" className="text-sm font-semibold text-[#163E48]">
                                Daily Budget
                              </Label>
                              <Input
                                id="budget"
                                type="number"
                                min={0}
                                value={form.daily_budget}
                                onChange={(e) => set("daily_budget", parseFloat(e.target.value) || 0)}
                                className="h-12 bg-[#FFF8E0] border-[1.5px] border-[#4C9DB0] focus-visible:border-[#1F4F5B] focus-visible:ring-[#4C9DB0]/30 rounded-xl text-base tabular-nums"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-[#163E48]">Currency</Label>
                              <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                                <SelectTrigger className="h-12 bg-[#FFF8E0] border-[1.5px] border-[#4C9DB0] rounded-xl text-base">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#FFF8E0] border-[#1F4F5B]">
                                  {CURRENCIES.map((c) => (
                                    <SelectItem key={c} value={c}>
                                      {c}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2.5">
                            <Label className="text-sm font-semibold text-[#163E48]">Budget Tier</Label>
                            <div className="grid grid-cols-3 gap-3">
                              {BUDGET_TIERS.map((b) => (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => set("budget_tier", b)}
                                  className={`px-3 py-3 rounded-xl border-[1.5px] text-sm font-semibold capitalize transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C9DB0] ${
                                    form.budget_tier === b
                                      ? "bg-[#4C9DB0] text-[#163E48] border-[#1F4F5B] shadow-[3px_3px_0_#1F4F5B]"
                                      : "bg-[#FFF8E0] border-[#4C9DB0]/70 hover:border-[#1F4F5B] text-[#163E48]"
                                  }`}
                                >
                                  {b === "mid_range" ? "Mid-Range" : b.charAt(0).toUpperCase() + b.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lang" className="text-sm font-semibold text-[#163E48]">
                              Native Language
                            </Label>
                            <Input
                              id="lang"
                              placeholder="e.g. English, Hindi, Spanish"
                              value={form.native_language}
                              onChange={(e) => set("native_language", e.target.value)}
                              className="h-12 bg-[#FFF8E0] border-[1.5px] border-[#4C9DB0] focus-visible:border-[#1F4F5B] focus-visible:ring-[#4C9DB0]/30 rounded-xl text-base"
                            />
                          </div>
                          <div>
                            <TagInput
                              label="Phrases You Need Help With (optional)"
                              tags={form.phrases_needed}
                              onAdd={addTag("phrases_needed")}
                              onRemove={removeTag("phrases_needed")}
                              onPendingChange={setPendingPhrase}
                              placeholder="e.g. Where is the hospital?"
                            />
                            <p className="font-note text-xs text-[#2A5C69] mt-1.5">
                              We’ll translate these phonetically so you can actually say them on the street.
                            </p>
                          </div>
                        </>
                      )}

                      {error && (
                        <div
                          role="alert"
                          className="p-3.5 rounded-xl border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0]/25 text-[#163E48] text-sm font-medium"
                        >
                          {error}
                        </div>
                      )}

                      <div className="flex gap-3 pt-3 border-t border-dashed border-[#4C9DB0]/55">
                        {step > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep((s) => s - 1)}
                            className="flex-1 h-12 rounded-xl border-[1.5px] border-[#1F4F5B] bg-[#FFF8E0] text-[#163E48] hover:bg-[#FFEBAF] font-semibold cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back
                          </Button>
                        )}
                        {step < STEPS.length - 1 ? (
                          <Button
                            type="button"
                            onClick={() => setStep((s) => s + 1)}
                            disabled={!canNext()}
                            className="flex-1 h-12 rounded-xl border-[1.5px] border-[#163E48] bg-[#1F4F5B] text-[#FFEBAF] hover:bg-[#163E48] shadow-[3px_3px_0_#4C9DB0] hover:shadow-[1px_1px_0_#4C9DB0] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-45 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed font-bold transition-all duration-150 cursor-pointer"
                          >
                            Continue
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 h-12 rounded-xl border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0] text-[#163E48] hover:bg-[#3F8C9E] shadow-[3px_3px_0_#1F4F5B] hover:shadow-[1px_1px_0_#1F4F5B] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 font-extrabold transition-all duration-150 cursor-pointer"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Trip...
                              </>
                            ) : (
                              "Create My Trip"
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
