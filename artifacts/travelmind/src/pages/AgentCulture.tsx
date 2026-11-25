import { AgentPage } from "@/components/AgentPage";
import { fetchCulture } from "@/services/api";
import { Globe, BookOpen, Shirt, MessageSquare, Calendar, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const levelColors: Record<string, string> = {
  conservative: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
  moderate: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  liberal: "bg-[#4C9DB0]/20 text-[#163E48] border-[#4C9DB0]",
  high: "bg-[#4C9DB0]/20 text-[#163E48] border-[#4C9DB0]",
  medium: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  low: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
};

function StatusBadge({ value }: { value: string }) {
  const color = levelColors[value?.toLowerCase?.()] ?? "bg-[#FFF3CC] text-[#163E48] border-[#4C9DB0]/55";
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-bold capitalize ${color}`}>
      {value}
    </span>
  );
}

function CultureDisplay({ data }: { data: any }) {
  const d = data?.culture_analysis ?? data ?? {};
  const overview = d.destination_overview ?? {};
  const etiquette = d.customs_and_etiquette ?? {};
  const dress = d.dress_code_guide ?? {};
  const langGuide = d.language_guide ?? {};
  const festivals = d.festivals_and_events ?? {};
  const laws = d.local_laws_travelers_must_know ?? [];
  const sensitivity = d.cultural_sensitivity_score ?? {};

  return (
    <div className="space-y-5">
      {d.summary && (
        <Card className="bg-[#4C9DB0]/20 border-[1.5px] border-[#1F4F5B] shadow-[3px_3px_0_#1F4F5B] rounded-2xl">
          <CardContent className="p-5 text-sm sm:text-base leading-relaxed text-[#163E48]">
            {d.summary}
          </CardContent>
        </Card>
      )}

      {Object.keys(overview).length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Globe className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Destination Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            {overview.cultural_identity && <p className="text-[#163E48]">{overview.cultural_identity}</p>}
            <div className="flex flex-wrap items-center gap-2">
              {overview.primary_religion && (
                <Badge variant="outline" className="border-[#1F4F5B]/45 bg-[#FFEBAF]">{overview.primary_religion}</Badge>
              )}
              {overview.social_conservatism_level && <StatusBadge value={overview.social_conservatism_level} />}
              {overview.traveler_friendliness && (
                <div className="flex items-center gap-1.5">
                  <span className="font-note text-xs text-[#2A5C69]">Traveler-friendly:</span>
                  <StatusBadge value={overview.traveler_friendliness} />
                </div>
              )}
            </div>
            {overview.best_cultural_experience && (
              <p className="font-note text-[#1F4F5B] text-xs font-bold pt-1">
                Highlight: {overview.best_cultural_experience}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {Object.keys(etiquette).length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Customs & Etiquette</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {etiquette.greeting_style && (
              <p className="text-sm"><span className="font-semibold text-[#163E48]">Greeting:</span> <span className="text-[#2A5C69]">{etiquette.greeting_style}</span></p>
            )}
            {etiquette.tipping_culture && (
              <p className="text-sm"><span className="font-semibold text-[#163E48]">Tipping:</span> <span className="text-[#2A5C69]">{etiquette.tipping_culture}</span></p>
            )}
            {etiquette.physical_contact_norms && (
              <p className="text-sm"><span className="font-semibold text-[#163E48]">Physical contact:</span> <span className="text-[#2A5C69]">{etiquette.physical_contact_norms}</span></p>
            )}
            {(etiquette.dos?.length > 0 || etiquette.donts?.length > 0) && (
              <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-[#4C9DB0]/35">
                {etiquette.dos?.length > 0 && (
                  <div className="bg-[#4C9DB0]/15 border border-[#4C9DB0] rounded-xl p-3.5">
                    <p className="font-note text-xs font-bold text-[#163E48] mb-2">✓ Do</p>
                    <ul className="space-y-1.5">
                      {etiquette.dos.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#163E48]">
                          <span className="text-[#1F4F5B] font-bold mt-0.5">•</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {etiquette.donts?.length > 0 && (
                  <div className="bg-[#1F4F5B]/10 border border-[#1F4F5B] rounded-xl p-3.5">
                    <p className="font-note text-xs font-bold text-[#163E48] mb-2">✕ Don&apos;t</p>
                    <ul className="space-y-1.5">
                      {etiquette.donts.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#163E48]">
                          <span className="text-[#1F4F5B] font-bold mt-0.5">•</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {etiquette.dining_etiquette?.length > 0 && (
              <div className="pt-1">
                <p className="font-note text-xs font-bold text-[#2A5C69] mb-1.5">Dining Etiquette</p>
                <ul className="space-y-1">
                  {etiquette.dining_etiquette.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#2A5C69]">
                      <span className="text-[#4C9DB0] font-bold mt-0.5">•</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {Object.keys(dress).length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Shirt className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Dress Code Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#2A5C69]">
            {dress.general_street_wear && <p><span className="font-semibold text-[#163E48]">Street:</span> {dress.general_street_wear}</p>}
            {dress.religious_sites && <p><span className="font-semibold text-[#163E48]">Religious sites:</span> {dress.religious_sites}</p>}
            {dress.beach_or_resort && <p><span className="font-semibold text-[#163E48]">Beach/Resort:</span> {dress.beach_or_resort}</p>}
            {dress.packing_dress_tips?.length > 0 && (
              <div className="pt-1">
                <p className="font-note text-[#2A5C69] text-xs mb-1">Packing Tips</p>
                <ul className="space-y-1">
                  {dress.packing_dress_tips.map((t: string, i: number) => (
                    <li key={i} className="flex items-start gap-2"><span className="text-[#4C9DB0] font-bold mt-0.5">•</span>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {langGuide.essential_phrases?.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Essential Phrases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {langGuide.essential_phrases.map((p: any, i: number) => (
                <div key={i} className="grid grid-cols-3 gap-2 border-b border-[#4C9DB0]/35 pb-2 last:border-0 last:pb-0 text-sm">
                  <span className="text-[#2A5C69]">{p.phrase}</span>
                  <span className="font-semibold text-[#163E48]">{p.local}</span>
                  <span className="font-note text-[#1F4F5B] text-xs">{p.pronunciation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(festivals).length > 0 && festivals.during_travel_dates?.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Calendar className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Festivals During Your Visit</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {festivals.during_travel_dates.map((f: any, i: number) => (
              <div key={i} className="border-b border-[#4C9DB0]/35 pb-2 last:border-0 last:pb-0">
                {typeof f === "string" ? <p>{f}</p> : (
                  <>
                    <p className="font-bold text-[#163E48]">{f.name ?? f.festival}</p>
                    {f.dates && <p className="font-note text-[#1F4F5B] text-xs">{f.dates}</p>}
                    {f.significance && <p className="text-[#2A5C69]">{f.significance}</p>}
                  </>
                )}
              </div>
            ))}
            {festivals.crowd_impact_warning && (
              <p className="font-note text-xs text-[#1F4F5B] font-bold pt-1">{festivals.crowd_impact_warning}</p>
            )}
          </CardContent>
        </Card>
      )}

      {laws.length > 0 && (
        <Card className="border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0]/15 rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1F4F5B]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Local Laws to Know</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {laws.map((law: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#163E48]">
                  <span className="text-[#1F4F5B] font-bold mt-0.5 shrink-0">•</span><span>{law}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {Object.keys(sensitivity).length > 0 && (
        <Card className="paper-card-soft rounded-2xl bg-[#FFF3CC]">
          <CardContent className="p-5 text-sm">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="font-display font-bold text-[#163E48]">Cultural Sensitivity Score:</span>
              <span className="font-display text-2xl font-extrabold text-[#1F4F5B] tabular-nums">{sensitivity.score}/10</span>
              {sensitivity.risk_level && <StatusBadge value={sensitivity.risk_level + " risk"} />}
            </div>
            {sensitivity.explanation && <p className="text-[#2A5C69]">{sensitivity.explanation}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AgentCulture() {
  return (
    <AgentPage
      title="Cultural Briefing"
      description="Customs, etiquette, dress codes, local laws, festivals, and cultural sensitivity for your destination."
      icon={Globe}
      fetchData={fetchCulture}
      formatData={(data) => <CultureDisplay data={data} />}
    />
  );
}
