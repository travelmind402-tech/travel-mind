import { useTrip } from "@/context/TripContext";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrapbookSticker } from "@/components/ScrapbookStickers";
import {
  Calendar,
  Wallet,
  Cloud,
  AlertTriangle,
  Car,
  Utensils,
  Globe,
  MessageSquare,
  MapPin,
  Users,
  Plane,
  Clock,
  ChevronRight,
  UtensilsCrossed,
  Languages,
  ArrowUpRight,
} from "lucide-react";
import { useEffect } from "react";

const agents = [
  {
    name: "Weather Analysis",
    path: "/dashboard/weather",
    icon: Cloud,
    desc: "Forecast, health risks & packing list",
    color: "text-[#163E48]",
    bg: "bg-[#FFEBAF] group-hover:bg-[#FFF3CC]",
  },
  {
    name: "Disruption Alerts",
    path: "/dashboard/disruption",
    icon: AlertTriangle,
    desc: "Road closures, scams & local strikes",
    color: "text-[#163E48]",
    bg: "bg-[#4C9DB0] group-hover:bg-[#3F8C9E]",
  },
  {
    name: "Driving Intelligence",
    path: "/dashboard/driving",
    icon: Car,
    desc: "Daily road conditions & safety guide",
    color: "text-[#FFEBAF]",
    bg: "bg-[#1F4F5B] group-hover:bg-[#163E48]",
  },
  {
    name: "Cuisine Guide",
    path: "/dashboard/cuisine",
    icon: Utensils,
    desc: "Must-try dishes & dietary-safe dining",
    color: "text-[#163E48]",
    bg: "bg-[#FFEBAF] group-hover:bg-[#FFF3CC]",
  },
  {
    name: "Cultural Briefing",
    path: "/dashboard/culture",
    icon: Globe,
    desc: "Etiquette, dress codes & local laws",
    color: "text-[#FFEBAF]",
    bg: "bg-[#1F4F5B] group-hover:bg-[#163E48]",
  },
  {
    name: "Budget Planner",
    path: "/dashboard/budget",
    icon: Wallet,
    desc: "Cost breakdown in local currency",
    color: "text-[#163E48]",
    bg: "bg-[#4C9DB0] group-hover:bg-[#3F8C9E]",
  },
  {
    name: "Language Assistant",
    path: "/dashboard/language",
    icon: MessageSquare,
    desc: "Essential phrases with phonetics",
    color: "text-[#163E48]",
    bg: "bg-[#FFEBAF] group-hover:bg-[#FFF3CC]",
  },
];

export default function DashboardHome() {
  const { tripForm, tripId } = useTrip();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!tripId) setLocation("/plan");
  }, [tripId, setLocation]);

  if (!tripForm || !tripId) return null;

  const startDate = new Date(tripForm.travel_start_date);
  const endDate = new Date(tripForm.travel_end_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nights = Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 86400000));
  const daysUntil = Math.round((startDate.getTime() - today.getTime()) / 86400000);
  const totalBudget = tripForm.daily_budget * (nights || 1);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const travelerLabel =
    tripForm.traveler_type === "family" && tripForm.family_members > 0
      ? `Family (${tripForm.family_members + 1} members)`
      : tripForm.traveler_type === "solo"
      ? "Solo Traveler"
      : tripForm.group_size > 1
      ? `Group of ${tripForm.group_size}`
      : tripForm.traveler_type.charAt(0).toUpperCase() + tripForm.traveler_type.slice(1);

  const tripPrefs = [
    tripForm.travel_style && { label: "Style", value: tripForm.travel_style.replace(/_/g, " ") },
    tripForm.cuisine_preferences && {
      label: "Cuisine",
      value: tripForm.cuisine_preferences === "fine_dining" ? "Fine Dining" : tripForm.cuisine_preferences.replace(/_/g, " "),
    },
    tripForm.native_language && { label: "Language", value: tripForm.native_language },
    { label: "Budget tier", value: tripForm.budget_tier.replace(/_/g, " ") },
  ].filter(Boolean) as { label: string; value: string }[];

  const allTags = [
    ...tripForm.dietary_restrictions,
    ...tripForm.known_allergies,
    ...tripForm.known_sensitivities,
  ];

  return (
    <div className="max-w-5xl mx-auto p-5 sm:p-8 md:p-10 space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <span className="font-note text-xs font-bold text-[#1F4F5B] uppercase tracking-wider">
            Your trip, thought through
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#163E48] mt-0.5">
            Trip Overview
          </h1>
          <p className="font-note text-[#2A5C69] mt-1 text-xs">
            Session {tripId.split("-")[0]} · Organized from your 4-step brief
          </p>
        </div>

        {daysUntil > 0 && (
          <div className="flex items-center gap-2 bg-[#4C9DB0] text-[#163E48] border-[1.5px] border-[#1F4F5B] shadow-[2px_2px_0_#1F4F5B] px-4 py-2 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="font-bold text-sm tabular-nums">{daysUntil} days to go</span>
          </div>
        )}
        {daysUntil === 0 && (
          <div className="flex items-center gap-2 bg-[#4C9DB0] text-[#163E48] border-[1.5px] border-[#1F4F5B] shadow-[2px_2px_0_#1F4F5B] px-4 py-2 rounded-full">
            <Plane className="w-4 h-4" />
            <span className="font-bold text-sm">Departing today</span>
          </div>
        )}
        {daysUntil < 0 && nights + daysUntil > 0 && (
          <div className="flex items-center gap-2 bg-[#1F4F5B] text-[#FFEBAF] border-[1.5px] border-[#163E48] shadow-[2px_2px_0_#4C9DB0] px-4 py-2 rounded-full">
            <MapPin className="w-4 h-4" />
            <span className="font-bold text-sm">Currently traveling</span>
          </div>
        )}
      </div>

      {/* Boarding-Pass Hero Card */}
      <Card className="bg-[#1F4F5B] text-[#FFEBAF] border-[1.5px] border-[#163E48] shadow-[6px_6px_0_#4C9DB0] rounded-3xl overflow-hidden relative">
        <div className="hidden lg:block absolute right-6 top-6 w-16 opacity-90 rotate-6 pointer-events-none">
          <ScrapbookSticker variant="star" />
        </div>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#FFEBAF] font-note text-xs font-bold uppercase tracking-widest">
                <Plane className="w-3.5 h-3.5" />
                <span>Destination Brief</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#FFEBAF]">
                  {tripForm.city}
                </h2>
                <ChevronRight className="w-5 h-5 text-[#FFEBAF]" />
                <span className="font-display text-2xl sm:text-3xl font-bold text-[#FFEBAF]/85">
                  {tripForm.country}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#FFEBAF]/85">
                <MapPin className="w-3.5 h-3.5 text-[#FFEBAF]" />
                <span>
                  {tripForm.transit_waypoints.length > 0
                    ? `Via ${tripForm.transit_waypoints.join(" → ")}`
                    : "Direct route"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:items-end lg:pr-20">
              <div className="flex items-center gap-2 bg-[#4C9DB0]/25 border border-[#4C9DB0]/55 rounded-xl px-4 py-2">
                <Calendar className="w-4 h-4 text-[#FFEBAF]" />
                <div className="text-sm tabular-nums">
                  <span className="font-semibold">{formatDate(startDate)}</span>
                  <span className="text-[#FFEBAF]/80 mx-2">—</span>
                  <span className="font-semibold">{formatDate(endDate)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#4C9DB0]/25 border border-[#4C9DB0]/55 rounded-xl px-4 py-2">
                <Users className="w-4 h-4 text-[#FFEBAF]" />
                <span className="text-sm font-medium">{travelerLabel}</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-dashed border-[#4C9DB0]/50">
            <div>
              <p className="font-display text-2xl sm:text-3xl font-extrabold tabular-nums text-[#FFEBAF]">
                {nights}
              </p>
              <p className="font-note text-xs text-[#FFEBAF]/80 mt-0.5">Nights</p>
            </div>
            <div className="border-x border-[#4C9DB0]/40 px-3">
              <p className="font-display text-2xl sm:text-3xl font-extrabold tabular-nums text-[#FFEBAF]">
                {tripForm.daily_budget.toLocaleString()}
              </p>
              <p className="font-note text-xs text-[#FFEBAF]/80 mt-0.5">{tripForm.currency} / day</p>
            </div>
            <div className="pl-2">
              <p className="font-display text-2xl sm:text-3xl font-extrabold tabular-nums text-[#FFEBAF]">
                {totalBudget.toLocaleString()}
              </p>
              <p className="font-note text-xs text-[#FFEBAF]/80 mt-0.5">Total ({tripForm.currency})</p>
            </div>
          </div>

          {/* Clean unboxed metadata line */}
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-[#4C9DB0]/35 font-note text-xs text-[#FFEBAF]/85">
            <span className="capitalize">{tripForm.budget_tier.replace("_", " ")}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{tripForm.travel_style}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">
              {tripForm.cuisine_preferences === "fine_dining" ? "Fine Dining" : tripForm.cuisine_preferences}
            </span>
            {tripForm.group_size > 1 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{tripForm.group_size} travelers</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Globe className="w-4 h-4 text-[#1F4F5B]" />
            <CardTitle className="font-display text-sm font-bold text-[#163E48]">
              Trip Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {tripPrefs.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between text-sm border-b border-[#4C9DB0]/25 pb-1.5 last:border-0 last:pb-0">
                <span className="text-[#2A5C69]">{label}</span>
                <span className="font-semibold capitalize text-[#163E48]">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-[#1F4F5B]" />
            <CardTitle className="font-display text-sm font-bold text-[#163E48]">
              Dietary & Health Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs rounded-full bg-[#FFEBAF] text-[#163E48] border border-[#1F4F5B]/45"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="font-note text-xs text-[#2A5C69]">No restrictions flagged</p>
            )}
          </CardContent>
        </Card>

        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Languages className="w-4 h-4 text-[#163E48]" />
            <CardTitle className="font-display text-sm font-bold text-[#163E48]">
              Language Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#2A5C69]">Native</span>
              <span className="font-semibold text-[#163E48]">{tripForm.native_language}</span>
            </div>
            {tripForm.phrases_needed.length > 0 ? (
              <div className="pt-1 border-t border-[#4C9DB0]/25">
                <p className="font-note text-xs text-[#2A5C69] mb-1.5">Phrases queued</p>
                <ul className="space-y-1">
                  {tripForm.phrases_needed.slice(0, 3).map((p) => (
                    <li key={p} className="text-xs text-[#2A5C69] flex items-start gap-1.5">
                      <span className="text-[#4C9DB0] font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                  {tripForm.phrases_needed.length > 3 && (
                    <li className="font-note text-xs text-[#2A5C69]">
                      +{tripForm.phrases_needed.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            ) : (
              <p className="font-note text-xs text-[#2A5C69]">No specific phrases requested</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agents grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-extrabold tracking-tight text-[#163E48]">
            Your 7 AI Briefings
          </h2>
          <span className="font-note text-xs text-[#2A5C69]">
            Pick any desk to generate
          </span>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {agents.map(({ name, path, icon: Icon, desc, color, bg }) => (
            <Link key={path} href={path}>
              <Card className="h-full bg-[#FFF8E0] border-[1.5px] border-[#1F4F5B] shadow-[3px_3px_0_#4C9DB0] hover:shadow-[1px_1px_0_#4C9DB0] hover:translate-x-[2px] hover:translate-y-[2px] rounded-2xl transition-all duration-150 cursor-pointer group">
                <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl border border-[#1F4F5B] flex items-center justify-center transition-colors ${bg}`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#2A5C69] group-hover:text-[#163E48] transition-colors" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-base leading-tight text-[#163E48]">
                      {name}
                    </p>
                    <p className="text-xs text-[#2A5C69] mt-1 leading-snug">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
