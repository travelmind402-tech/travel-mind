import { AgentPage } from "@/components/AgentPage";
import { fetchDriving } from "@/services/api";
import { Car, AlertTriangle, Phone, Wrench, CheckSquare, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const riskColors: Record<string, string> = {
  low: "bg-[#4C9DB0]/20 text-[#163E48] border-[#4C9DB0]",
  moderate: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  high: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
  extreme: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
  critical: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
  medium: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  excellent: "bg-[#4C9DB0]/20 text-[#163E48] border-[#4C9DB0]",
  good: "bg-[#4C9DB0]/25 text-[#163E48] border-[#1F4F5B]/50",
  poor: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
  dangerous: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
};

const colorDot: Record<string, string> = {
  green: "bg-[#4C9DB0]",
  yellow: "bg-[#FFEBAF]",
  orange: "bg-[#3F8C9E]",
  red: "bg-[#1F4F5B]",
};

function StatusBadge({ value }: { value: string }) {
  const color = riskColors[value?.toLowerCase?.()] ?? "bg-[#FFF3CC] text-[#163E48] border-[#4C9DB0]/55";
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-bold capitalize ${color}`}>
      {value}
    </span>
  );
}

function DrivingDisplay({ data }: { data: any }) {
  const d = data?.driving_analysis ?? data ?? {};

  return (
    <div className="space-y-5">
      {d.trip_driving_summary && (
        <Card className="bg-[#4C9DB0]/20 border-[1.5px] border-[#1F4F5B] shadow-[3px_3px_0_#1F4F5B] rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2.5 flex-wrap">
              {d.overall_driving_risk && <StatusBadge value={d.overall_driving_risk + " risk"} />}
              {d.should_avoid_self_drive && (
                <Badge className="bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]">Avoid Self-Drive</Badge>
              )}
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-[#163E48]">{d.trip_driving_summary}</p>
            {d.avoid_reason && <p className="font-note text-xs text-[#2A5C69] mt-2">{d.avoid_reason}</p>}
          </CardContent>
        </Card>
      )}

      {d.daily_driving_guide?.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-3 flex-row items-center gap-2">
            <Car className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Daily Driving Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:border-l-2 before:border-dashed before:border-[#4C9DB0]/65">
              {d.daily_driving_guide.map((day: any, i: number) => (
                <div key={i} className="relative bg-[#FFEBAF]/50 border border-[#4C9DB0]/55 rounded-xl p-4">
                  <div
                    aria-hidden="true"
                    className={`absolute -left-[22px] top-4 w-4 h-4 rounded-full border-[1.5px] border-[#1F4F5B] ${colorDot[day.color_code] ?? "bg-[#FFF3CC]"}`}
                  />
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-note text-xs font-bold text-[#1F4F5B]">
                        <Calendar className="w-3.5 h-3.5" />
                        {day.date}
                      </span>
                      <StatusBadge value={day.condition} />
                    </div>
                    {day.driving_score !== undefined && (
                      <span className="font-note text-xs font-bold text-[#163E48] bg-[#FFF8E0] border border-[#4C9DB0]/55 px-2.5 py-0.5 rounded-full tabular-nums">
                        Score {day.driving_score}
                      </span>
                    )}
                  </div>
                  {day.best_departure_time && (
                    <p className="font-note text-xs text-[#2A5C69] mb-1">
                      Best depart: {day.best_departure_time}
                    </p>
                  )}
                  <p className="text-sm text-[#2A5C69]">{day.recommendation}</p>
                  {day.active_hazards?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {day.active_hazards.map((h: string) => (
                        <Badge key={h} variant="outline" className="text-xs border-[#1F4F5B]/45 bg-[#FFF8E0]">{h}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {d.dangerous_stretches?.length > 0 && (
        <Card className="border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0]/15 rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#1F4F5B]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Dangerous Stretches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.dangerous_stretches.map((s: any, i: number) => (
              <div key={i} className="bg-[#FFF8E0] border border-[#4C9DB0]/55 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-[#163E48]">{s.stretch ?? s.route_name}</span>
                  <StatusBadge value={s.risk_level} />
                  {s.risk_type && (
                    <Badge variant="outline" className="text-xs capitalize border-[#1F4F5B]/45">
                      {s.risk_type.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>
                {s.advisory && <p className="text-sm text-[#2A5C69]">{s.advisory}</p>}
                {s.alternative_route && (
                  <p className="font-note text-xs text-[#1F4F5B] font-bold">Alternative: {s.alternative_route}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {d.vehicle_specific_advice && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Wrench className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Vehicle Advice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#163E48]">{d.vehicle_specific_advice.vehicle_type}</span>
              {d.vehicle_specific_advice.suitability_rating && <StatusBadge value={d.vehicle_specific_advice.suitability_rating} />}
            </div>
            {d.vehicle_specific_advice.specific_tips?.length > 0 && (
              <ul className="space-y-1.5 text-[#2A5C69]">
                {d.vehicle_specific_advice.specific_tips.map((t: string, i: number) => (
                  <li key={i} className="flex items-start gap-2"><span className="text-[#4C9DB0] font-bold mt-0.5">•</span>{t}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {d.driver_checklist?.length > 0 && (
          <Card className="paper-card-soft rounded-2xl">
            <CardHeader className="pb-2 flex-row items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#4C9DB0]" />
              <CardTitle className="font-display text-base font-bold text-[#163E48]">Driver Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {d.driver_checklist.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#163E48]">
                    <span className="text-[#4C9DB0] font-bold mt-0.5">☐</span><span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {d.emergency_contacts?.length > 0 && (
          <Card className="paper-card-soft rounded-2xl">
            <CardHeader className="pb-2 flex-row items-center gap-2">
              <Phone className="w-4 h-4 text-[#1F4F5B]" />
              <CardTitle className="font-display text-base font-bold text-[#163E48]">Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {d.emergency_contacts.map((c: any, i: number) => (
                <div key={i} className="text-sm border-b border-[#4C9DB0]/35 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#163E48]">{c.service}</span>
                    <span className="font-note font-bold text-[#1F4F5B] tabular-nums">{c.number}</span>
                  </div>
                  {c.when_to_call && <p className="text-xs text-[#2A5C69] mt-0.5">{c.when_to_call}</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {(d.fuel_advisory || d.parking_advisory || d.night_driving_assessment) && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Additional Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#2A5C69]">
            {d.fuel_advisory && <p><span className="font-semibold text-[#163E48]">Fuel:</span> {d.fuel_advisory}</p>}
            {d.parking_advisory && <p><span className="font-semibold text-[#163E48]">Parking:</span> {d.parking_advisory}</p>}
            {d.night_driving_assessment && <p><span className="font-semibold text-[#163E48]">Night Driving:</span> {d.night_driving_assessment}</p>}
            {d.best_driving_day && <p><span className="font-semibold text-[#163E48]">Best Day:</span> <span className="font-note">{d.best_driving_day}</span></p>}
            {d.worst_driving_day && <p><span className="font-semibold text-[#163E48]">Worst Day:</span> <span className="font-note">{d.worst_driving_day}</span></p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AgentDriving() {
  return (
    <AgentPage
      title="Driving Intelligence"
      description="Daily driving conditions, dangerous stretches, emergency contacts, and road safety for your route."
      icon={Car}
      fetchData={fetchDriving}
      formatData={(data) => <DrivingDisplay data={data} />}
    />
  );
}
