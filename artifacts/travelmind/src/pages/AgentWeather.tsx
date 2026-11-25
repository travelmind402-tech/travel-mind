import { AgentPage } from "@/components/AgentPage";
import { fetchWeather } from "@/services/api";
import { Cloud, Thermometer, AlertTriangle, Heart, Wind, Leaf, ChevronRight, Shield, MapPin, Phone, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function StatusBadge({ value, map }: { value: string; map: Record<string, string> }) {
  const color = map[value?.toLowerCase?.()] ?? "bg-[#FFF3CC] text-[#163E48] border-[#4C9DB0]/55";
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-bold capitalize ${color}`}>
      {value}
    </span>
  );
}

const severityColors: Record<string, string> = {
  clear: "bg-[#4C9DB0]/20 text-[#163E48] border-[#4C9DB0]",
  advisory: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  critical: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
  low: "bg-[#4C9DB0]/20 text-[#163E48] border-[#4C9DB0]",
  medium: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  moderate: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  high: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
  extreme: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
};

function WeatherDisplay({ data }: { data: any }) {
  const d = data?.weather_analysis ?? data?.weather ?? data ?? {};

  return (
    <div className="space-y-5">
      {d.summary && (
        <Card className="bg-[#4C9DB0]/20 border-[1.5px] border-[#1F4F5B] shadow-[3px_3px_0_#1F4F5B] rounded-2xl">
          <CardContent className="p-5">
            <p className="font-note text-xs font-bold uppercase tracking-wider text-[#163E48] mb-1.5">
              Weather Summary
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-[#163E48]">{d.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Severe Alerts */}
      {d.severe_alerts && d.severe_alerts !== "None" && (
        <Card className="border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0]/25 rounded-2xl">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#1F4F5B] shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-[#163E48]">{d.severe_alerts}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Conditions */}
        {(d.current_season || d.temperature || d.conditions) && (
          <Card className="paper-card-soft rounded-2xl">
            <CardHeader className="pb-2 flex-row items-center gap-2">
              <Thermometer className="w-4 h-4 text-[#4C9DB0]" />
              <CardTitle className="font-display text-base font-bold text-[#163E48]">Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {d.current_season && <p><span className="text-[#2A5C69]">Season:</span> <span className="font-medium text-[#163E48]">{d.current_season}</span></p>}
              {d.temperature && <p><span className="text-[#2A5C69]">Temp:</span> <span className="font-medium text-[#163E48]">{d.temperature}</span></p>}
              {d.conditions && <p><span className="text-[#2A5C69]">Conditions:</span> <span className="font-medium text-[#163E48]">{d.conditions}</span></p>}
              {d.best_time_outdoors && (
                <p className="pt-2 border-t border-[#4C9DB0]/35">
                  <span className="text-[#2A5C69]">Best outdoors:</span> <span className="font-medium text-[#163E48]">{d.best_time_outdoors}</span>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Calamity Risk */}
        {d.calamity_prediction_alert && (
          <Card className={`rounded-2xl border-[1.5px] ${d.calamity_prediction_alert.status === "CLEAR" ? "bg-[#FFF8E0] border-[#4C9DB0]/55" : "bg-[#4C9DB0]/15 border-[#1F4F5B]"}`}>
            <CardHeader className="pb-2 flex-row items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#1F4F5B]" />
              <CardTitle className="font-display text-base font-bold text-[#163E48]">Calamity Risk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <StatusBadge value={d.calamity_prediction_alert.status} map={severityColors} />
              {d.calamity_prediction_alert.probability_score && (
                <p><span className="text-[#2A5C69]">Probability:</span> <span className="font-medium text-[#163E48]">{d.calamity_prediction_alert.probability_score}</span></p>
              )}
              {d.calamity_prediction_alert.historical_basis && (
                <p className="text-[#2A5C69] text-xs leading-relaxed">{d.calamity_prediction_alert.historical_basis}</p>
              )}
              {d.calamity_prediction_alert.predicted_events?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {d.calamity_prediction_alert.predicted_events.map((e: string) => (
                    <Badge key={e} variant="outline" className="text-xs border-[#1F4F5B]/45 bg-[#FFEBAF]">{e}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Hazard Risk Assessment */}
      {d.hazard_risk_assessment && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#4C9DB0]" />
              <CardTitle className="font-display text-base font-bold text-[#163E48]">Hazard Risk Assessment</CardTitle>
            </div>
            {d.hazard_risk_assessment.overall_risk_level && (
              <StatusBadge value={d.hazard_risk_assessment.overall_risk_level} map={severityColors} />
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {d.hazard_risk_assessment.primary_hazards?.map((h: any, i: number) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[#4C9DB0]/35 last:border-0 text-sm">
                  <StatusBadge value={h.risk_level} map={severityColors} />
                  <div>
                    <span className="font-semibold text-[#163E48]">{h.hazard_type}</span>
                    {h.impact && <p className="text-[#2A5C69] text-xs mt-0.5">{h.impact}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Travel Health Index */}
      {d.travel_health_index && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Heart className="w-4 h-4 text-[#1F4F5B]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Travel Health Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {Object.entries(d.travel_health_index).map(([k, v]) =>
                k !== "overall_health_recommendation" && (
                  <div key={k} className="flex justify-between items-center border-b border-[#4C9DB0]/35 py-2">
                    <span className="text-[#2A5C69] capitalize">{k.replace(/_/g, " ")}</span>
                    <StatusBadge value={String(v)} map={severityColors} />
                  </div>
                )
              )}
            </div>
            {d.travel_health_index.overall_health_recommendation && (
              <p className="mt-3 text-sm text-[#2A5C69] border-t border-[#4C9DB0]/35 pt-3">
                {d.travel_health_index.overall_health_recommendation}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Day-by-Day Forecast Timeline */}
      {d.journey_weather_timeline?.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-3 flex-row items-center gap-2">
            <Wind className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Day-by-Day Forecast Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:border-l-2 before:border-dashed before:border-[#4C9DB0]/65">
              {d.journey_weather_timeline.map((day: any, i: number) => (
                <div key={i} className="relative bg-[#FFEBAF]/50 border border-[#4C9DB0]/55 rounded-xl p-4">
                  <div
                    aria-hidden="true"
                    className="absolute -left-[22px] top-4 w-4 h-4 rounded-full bg-[#4C9DB0] border-[1.5px] border-[#1F4F5B]"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="inline-flex items-center gap-1.5 font-note text-xs font-bold text-[#1F4F5B]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{day.date ?? `Day ${i + 1}`}</span>
                    </div>
                    {day.temperature && (
                      <span className="font-note text-xs font-bold bg-[#FFF8E0] border border-[#4C9DB0]/55 px-2.5 py-0.5 rounded-full text-[#163E48] tabular-nums">
                        {day.temperature}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-sm text-[#163E48]">{day.condition ?? day.summary ?? ""}</p>
                  {day.recommendation && <p className="text-[#2A5C69] text-xs mt-1 leading-relaxed">{day.recommendation}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Allergen Alerts */}
      {d.allergen_alerts?.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Leaf className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Allergen Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {d.allergen_alerts.map((a: any, i: number) => (
                <div key={i} className="py-2 border-b border-[#4C9DB0]/35 last:border-0 text-sm">
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge value={a.level} map={severityColors} />
                    <span className="font-semibold text-[#163E48]">{a.allergen_type}</span>
                    {a.origin_season && <span className="font-note text-[#2A5C69] text-xs">({a.origin_season})</span>}
                  </div>
                  {a.precautions && <p className="text-[#2A5C69] text-xs mt-1.5">{a.precautions}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seasonal Environmental Factors */}
      {d.seasonal_environmental_factors && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <MapPin className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Environmental Factors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {d.seasonal_environmental_factors.sensory_note && (
              <p className="font-note italic text-[#2A5C69]">{d.seasonal_environmental_factors.sensory_note}</p>
            )}
            {d.seasonal_environmental_factors.economic_impact && (
              <p><span className="text-[#2A5C69]">Economic:</span> {d.seasonal_environmental_factors.economic_impact}</p>
            )}
            {d.seasonal_environmental_factors.infrastructure_risk && (
              <p><span className="text-[#2A5C69]">Infrastructure:</span> {d.seasonal_environmental_factors.infrastructure_risk}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Packing Tips — supports both packing_tips and packing_recommendations */}
      {(d.packing_tips ?? d.packing_recommendations)?.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <ChevronRight className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Packing Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(d.packing_tips ?? d.packing_recommendations).map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#163E48]">
                  <span className="text-[#4C9DB0] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Safety Recommendations */}
      {d.traveler_safety_recommendations?.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Shield className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Safety Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {d.traveler_safety_recommendations.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#163E48]">
                  <span className="text-[#4C9DB0] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts */}
      {d.emergency_contacts_relevant?.length > 0 && (
        <Card className="border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0]/15 rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Phone className="w-4 h-4 text-[#1F4F5B]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {d.emergency_contacts_relevant.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#163E48]">
                  <span className="text-[#1F4F5B] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AgentWeather() {
  return (
    <AgentPage
      title="Weather Analysis"
      description="Forecast, health risks, allergen alerts, and packing recommendations."
      icon={Cloud}
      fetchData={fetchWeather}
      formatData={(data) => <WeatherDisplay data={data} />}
    />
  );
}
