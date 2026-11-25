import { AgentPage } from "@/components/AgentPage";
import { useTrip } from "@/context/TripContext";
import { fetchLanguage } from "@/services/api";
import { MessageSquare, Globe, BookOpen, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const proficiencyColors: Record<string, string> = {
  high: "bg-[#4C9DB0]/20 text-[#163E48] border-[#4C9DB0]",
  medium: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  low: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
  easy: "bg-[#4C9DB0]/20 text-[#163E48] border-[#4C9DB0]",
  moderate: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  hard: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
};

function StatusBadge({ value }: { value: string }) {
  const color = proficiencyColors[value?.toLowerCase?.()] ?? "bg-[#FFF3CC] text-[#163E48] border-[#4C9DB0]/55";
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-bold capitalize ${color}`}>
      {value}
    </span>
  );
}

function LanguageDisplay({ data }: { data: any }) {
  const { tripForm } = useTrip();
  const d = data?.language_analysis ?? data ?? {};
  const phrases = d.essential_phrases ?? [];
  const customTranslations = d.custom_translations ?? d.custom_phrases ?? [];
  const requestedPhrases = tripForm?.phrases_needed ?? [];
  const phraseHelpRows = customTranslations.length > 0
    ? customTranslations
    : requestedPhrases.map((phrase) => ({ native: phrase }));
  const customs = d.communication_customs ?? d.etiquette_rules ?? {};
  const translationApps = d.translation_apps ?? d.recommended_apps ?? d.translation_apps_recommended ?? [];
  const scripts = d.script_learning_tips ?? d.script_tips ?? d.script_reading_guide ?? {};

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {d.destination && <span className="font-display font-bold text-lg text-[#163E48]">{d.destination}</span>}
        {d.local_language && (
          <Badge className="bg-[#4C9DB0] text-[#163E48] border border-[#1F4F5B]">{d.local_language}</Badge>
        )}
        {d.script && (
          <Badge variant="outline" className="border-[#1F4F5B]/45 bg-[#FFF8E0]">{d.script}</Badge>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {d.english_proficiency_locals && (
          <div className="paper-card-soft rounded-2xl p-4 text-center">
            <p className="font-note text-xs text-[#2A5C69] mb-1.5">English Level</p>
            <StatusBadge value={d.english_proficiency_locals} />
          </div>
        )}
        {d.translation_difficulty && (
          <div className="paper-card-soft rounded-2xl p-4 text-center">
            <p className="font-note text-xs text-[#2A5C69] mb-1.5">Difficulty</p>
            <StatusBadge value={d.translation_difficulty} />
          </div>
        )}
        {d.script && (
          <div className="paper-card-soft rounded-2xl p-4 text-center">
            <p className="font-note text-xs text-[#2A5C69] mb-1.5">Script</p>
            <span className="text-sm font-bold text-[#163E48]">{d.script}</span>
          </div>
        )}
      </div>

      {phraseHelpRows.length > 0 && (
        <Card className="bg-[#4C9DB0]/20 border-[1.5px] border-[#1F4F5B] shadow-[3px_3px_0_#1F4F5B] rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#163E48]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Phrases You Need Help With</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {phraseHelpRows.map((p: any, i: number) => (
                <div key={i} className="border border-[#1F4F5B]/35 rounded-xl bg-[#FFF8E0] p-3.5 space-y-1">
                  <p className="text-sm text-[#2A5C69]">{p.native ?? p.english ?? p.phrase ?? ""}</p>
                  {(p.local || p.translation) ? (
                    <p className="font-bold text-base text-[#163E48]">{p.local ?? p.translation}</p>
                  ) : (
                    <p className="font-note text-xs text-[#2A5C69]">
                      Translation will appear here after the language agent returns it.
                    </p>
                  )}
                  {p.phonetic && (
                    <p className="font-note text-xs text-[#1F4F5B] font-bold mt-0.5">{p.phonetic}</p>
                  )}
                  {(p.usage_tip || p.usage) && (
                    <p className="text-xs text-[#2A5C69] border-t border-[#4C9DB0]/35 pt-1.5 mt-1">
                      {p.usage_tip ?? p.usage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {phrases.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Essential Phrases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {phrases.map((p: any, i: number) => (
                <div key={i} className="bg-[#FFEBAF]/50 border border-[#4C9DB0]/55 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-[#2A5C69]">{p.native}</span>
                  </div>
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="flex-1">
                      <p className="font-bold text-base text-[#163E48]">{p.local}</p>
                      {p.phonetic && (
                        <p className="font-note text-xs text-[#1F4F5B] font-bold mt-0.5">{p.phonetic}</p>
                      )}
                    </div>
                  </div>
                  {p.usage_tip && (
                    <p className="text-xs text-[#2A5C69] border-t border-[#4C9DB0]/35 pt-1.5">{p.usage_tip}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {d.survival_phrases?.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Survival Phrases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {d.survival_phrases.map((p: any, i: number) => (
                <div key={i} className="bg-[#FFEBAF]/50 border border-[#4C9DB0]/55 rounded-xl p-3 text-sm">
                  <p className="font-note text-[#2A5C69] text-xs">{p.situation ?? p.context}</p>
                  <p className="font-bold text-[#163E48] mt-0.5">{p.local}</p>
                  {p.phonetic && <p className="font-note text-[#1F4F5B] font-bold text-xs">{p.phonetic}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(customs).length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Globe className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Communication Customs</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {Object.entries(customs).map(([key, val]) => (
              <div key={key} className="border-b border-[#4C9DB0]/35 pb-2 last:border-0 last:pb-0">
                <span className="font-semibold text-[#163E48] capitalize">{key.replace(/_/g, " ")}:</span>
                <span className="ml-1 text-[#2A5C69]">{String(val)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(translationApps.length > 0 || d.offline_translation_tips) && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Tech & Translation Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {translationApps.length > 0 && (
              <div>
                <p className="font-note text-xs text-[#2A5C69] mb-1.5">Recommended Apps</p>
                <div className="flex flex-wrap gap-1.5">
                  {translationApps.map((app: any) => (
                    <Badge key={typeof app === "string" ? app : app.name ?? app.app} variant="secondary" className="bg-[#FFF3CC] text-[#163E48]">
                      {typeof app === "string" ? app : app.name ?? app.app}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {d.offline_translation_tips && (
              <p className="text-[#2A5C69]">{d.offline_translation_tips}</p>
            )}
          </CardContent>
        </Card>
      )}

      {Object.keys(scripts).length > 0 && (
        <Card className="paper-card-soft rounded-2xl bg-[#FFF3CC]">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Script Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1.5 text-[#2A5C69]">
            {Object.entries(scripts).map(([k, v]) => (
              <p key={k}><span className="font-semibold text-[#163E48] capitalize">{k.replace(/_/g, " ")}:</span> {String(v)}</p>
            ))}
          </CardContent>
        </Card>
      )}

      {d.quick_learning_tips?.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="font-display text-base font-bold text-[#163E48]">Quick Learning Tips</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {d.quick_learning_tips.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#163E48]">
                  <span className="text-[#4C9DB0] font-bold mt-0.5">•</span><span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AgentLanguage() {
  return (
    <AgentPage
      title="Language Assistant"
      description="Essential phrases with phonetics, script tips, translation apps, and communication customs."
      icon={MessageSquare}
      fetchData={fetchLanguage}
      formatData={(data) => <LanguageDisplay data={data} />}
    />
  );
}
