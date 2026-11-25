import { AgentPage } from "@/components/AgentPage";
import { fetchDisruption } from "@/services/api";
import { AlertTriangle, Zap, Bus, Wifi, ShieldAlert, ThumbsUp, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const severityColors: Record<string, string> = {
  critical: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
  high: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
  medium: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  low: "bg-[#4C9DB0]/20 text-[#163E48] border-[#4C9DB0]",
  always: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
  often: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
  sometimes: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  rarely: "bg-[#4C9DB0]/20 text-[#163E48] border-[#4C9DB0]",
  recent: "bg-[#4C9DB0]/20 text-[#163E48] border-[#4C9DB0]",
  moderate: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  old: "bg-[#FFF3CC] text-[#2A5C69] border-[#4C9DB0]/55",
};

function StatusBadge({ value }: { value: string }) {
  const color = severityColors[value?.toLowerCase?.()] ?? "bg-[#FFF3CC] text-[#163E48] border-[#4C9DB0]/55";
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-xs font-bold capitalize ${color}`}>
      {value}
    </span>
  );
}

function DisruptionDisplay({ data }: { data: any }) {
  const d = data?.disruption_analysis ?? data ?? {};

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4 bg-[#FFF8E0] border border-[#4C9DB0]/55 rounded-2xl p-4">
        {d.overall_disruption_risk && (
          <div className="flex items-center gap-2">
            <span className="font-note text-xs text-[#2A5C69]">Overall Risk:</span>
            <StatusBadge value={d.overall_disruption_risk} />
          </div>
        )}
        {d.confidence_level && (
          <div className="flex items-center gap-2">
            <span className="font-note text-xs text-[#2A5C69]">Confidence:</span>
            <StatusBadge value={d.confidence_level} />
          </div>
        )}
        {d.data_freshness && (
          <div className="flex items-center gap-2">
            <span className="font-note text-xs text-[#2A5C69]">Data:</span>
            <StatusBadge value={d.data_freshness} />
          </div>
        )}
      </div>

      {d.disruption_hotspots?.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#1F4F5B]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Disruption Hotspots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.disruption_hotspots.map((h: any, i: number) => (
              <div key={i} className="bg-[#FFEBAF]/50 border border-[#4C9DB0]/55 rounded-xl p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-[#163E48]">{h.location}</span>
                  <StatusBadge value={h.severity} />
                  <Badge variant="outline" className="text-xs capitalize border-[#1F4F5B]/45 bg-[#FFF8E0]">
                    {h.disruption_type?.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-note text-xs text-[#2A5C69]">
                  {h.frequency && <span>Frequency: <strong className="text-[#163E48]">{h.frequency}</strong></span>}
                  {h.typical_duration && <span>Duration: <strong className="text-[#163E48]">{h.typical_duration}</strong></span>}
                </div>
                {h.advisory && <p className="text-sm text-[#163E48]">{h.advisory}</p>}
                {h.trigger_condition && <p className="font-note text-xs text-[#2A5C69]">Trigger: {h.trigger_condition}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {d.power_situation && (
          <Card className="paper-card-soft rounded-2xl">
            <CardHeader className="pb-2 flex-row items-center gap-2">
              <Zap className="w-4 h-4 text-[#4C9DB0]" />
              <CardTitle className="font-display text-sm font-bold text-[#163E48]">Power</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1.5">
              {d.power_situation.outage_frequency && <p>Outages: <StatusBadge value={d.power_situation.outage_frequency} /></p>}
              {d.power_situation.typical_duration_hours && <p className="font-note text-[#2A5C69] text-xs">Avg. {d.power_situation.typical_duration_hours}h</p>}
              {d.power_situation.advisory && <p className="text-xs text-[#2A5C69] mt-2 leading-relaxed">{d.power_situation.advisory}</p>}
            </CardContent>
          </Card>
        )}

        {d.transport_situation && (
          <Card className="paper-card-soft rounded-2xl">
            <CardHeader className="pb-2 flex-row items-center gap-2">
              <Bus className="w-4 h-4 text-[#4C9DB0]" />
              <CardTitle className="font-display text-sm font-bold text-[#163E48]">Transport</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1.5">
              {d.transport_situation.local_transport_reliability && (
                <p>Reliability: <StatusBadge value={d.transport_situation.local_transport_reliability} /></p>
              )}
              {d.transport_situation.surge_pricing_risk !== undefined && (
                <p className="text-xs text-[#2A5C69]">
                  Surge pricing: {d.transport_situation.surge_pricing_risk ? "Possible" : "Unlikely"}
                </p>
              )}
              {d.transport_situation.advisory && <p className="text-xs text-[#2A5C69] mt-2 leading-relaxed">{d.transport_situation.advisory}</p>}
            </CardContent>
          </Card>
        )}

        {d.connectivity_situation && (
          <Card className="paper-card-soft rounded-2xl">
            <CardHeader className="pb-2 flex-row items-center gap-2">
              <Wifi className="w-4 h-4 text-[#4C9DB0]" />
              <CardTitle className="font-display text-sm font-bold text-[#163E48]">Connectivity</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1.5">
              {d.connectivity_situation.mobile_network_risk && (
                <p>Mobile: <StatusBadge value={d.connectivity_situation.mobile_network_risk} /></p>
              )}
              {d.connectivity_situation.atm_reliability && (
                <p>ATM: <StatusBadge value={d.connectivity_situation.atm_reliability} /></p>
              )}
              {d.connectivity_situation.advisory && <p className="text-xs text-[#2A5C69] mt-2 leading-relaxed">{d.connectivity_situation.advisory}</p>}
            </CardContent>
          </Card>
        )}
      </div>

      {d.scam_alerts?.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#1F4F5B]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Scam Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.scam_alerts.map((s: any, i: number) => (
              <div key={i} className="bg-[#FFEBAF]/50 border border-[#4C9DB0]/55 rounded-xl p-3.5 text-sm space-y-1">
                <p className="font-bold text-[#163E48]">{s.scam_type}</p>
                {s.location && <p className="font-note text-[#2A5C69] text-xs">{s.location}</p>}
                {s.how_to_avoid && <p className="text-[#2A5C69]">{s.how_to_avoid}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {d.positive_notes?.length > 0 && (
        <Card className="border-[1.5px] border-[#4C9DB0] bg-[#4C9DB0]/15 rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-[#1F4F5B]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Good News</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {d.positive_notes.map((n: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#163E48]">
                  <span className="text-[#1F4F5B] font-bold mt-0.5">✓</span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {d.best_backup_plans?.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Backup Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {d.best_backup_plans.map((p: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#163E48]">
                  <span className="text-[#4C9DB0] font-bold mt-0.5">→</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AgentDisruption() {
  return (
    <AgentPage
      title="Disruption Alerts"
      description="Real-world disruptions, scam alerts, power & transport reliability, and backup plans."
      icon={AlertTriangle}
      fetchData={fetchDisruption}
      formatData={(data) => <DisruptionDisplay data={data} />}
    />
  );
}
