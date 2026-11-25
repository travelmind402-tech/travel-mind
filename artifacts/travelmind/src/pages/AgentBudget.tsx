import { AgentPage } from "@/components/AgentPage";
import { fetchBudget } from "@/services/api";
import { Wallet, TrendingDown, Star, CreditCard, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const feasibilityColors: Record<string, string> = {
  comfortable: "bg-[#4C9DB0]/20 text-[#163E48] border-[#4C9DB0]",
  tight: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  over_budget: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
};

function BudgetDisplay({ data }: { data: any }) {
  const d = data?.budget_analysis ?? data ?? {};
  const summary = d.trip_summary ?? {};
  const daily = d.daily_breakdown ?? {};
  const total = d.total_trip_estimate ?? {};
  const activities = d.recommended_activities ?? d.suggested_activities ?? [];
  const accommodation = d.accommodation_recommendations ?? [];
  const moneySaving = d.money_saving_tips ?? d.budget_hacks ?? [];
  const hiddenCosts = d.hidden_costs ?? [];
  const currency = d.currency_symbol ?? d.currency ?? "";

  return (
    <div className="space-y-5">
      {d.destination && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display font-bold text-lg text-[#163E48]">{d.destination}</span>
          {currency && <Badge variant="outline" className="text-xs border-[#1F4F5B]/45 bg-[#FFF8E0]">{currency}</Badge>}
        </div>
      )}

      {Object.keys(summary).length > 0 && (
        <Card className="bg-[#4C9DB0]/20 border-[1.5px] border-[#1F4F5B] shadow-[3px_3px_0_#1F4F5B] rounded-2xl">
          <CardContent className="p-5">
            <div className="flex flex-wrap gap-2.5 items-center mb-4">
              {summary.budget_feasibility && (
                <span className={`px-3 py-1 rounded-full border text-xs font-bold capitalize ${feasibilityColors[summary.budget_feasibility] ?? "bg-[#FFF3CC] text-[#163E48] border-[#4C9DB0]/55"}`}>
                  {summary.budget_feasibility.replace("_", " ")}
                </span>
              )}
              {summary.budget_tier && (
                <Badge variant="outline" className="capitalize border-[#1F4F5B]/45 bg-[#FFF8E0]">
                  {summary.budget_tier.replace("_", " ")}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              {summary.total_days && (
                <div className="text-center p-3 bg-[#FFF8E0] border border-[#1F4F5B]/30 rounded-xl">
                  <div className="font-display text-2xl font-extrabold text-[#163E48] tabular-nums">{summary.total_days}</div>
                  <div className="font-note text-xs text-[#2A5C69]">Days</div>
                </div>
              )}
              {summary.daily_budget_local && (
                <div className="text-center p-3 bg-[#FFF8E0] border border-[#1F4F5B]/30 rounded-xl">
                  <div className="font-display text-lg font-extrabold text-[#1F4F5B] tabular-nums">{summary.daily_budget_local}</div>
                  <div className="font-note text-xs text-[#2A5C69]">Per Day</div>
                </div>
              )}
              {summary.total_budget_local && (
                <div className="text-center p-3 bg-[#FFF8E0] border border-[#1F4F5B]/30 rounded-xl col-span-2">
                  <div className="font-display text-lg font-extrabold text-[#163E48] tabular-nums">{summary.total_budget_local}</div>
                  <div className="font-note text-xs text-[#2A5C69]">Total Budget</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(daily).length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Wallet className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Daily Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {Object.entries(daily).map(([key, val]) => {
                const label = key.replace(/_local|_usd/, "").replace(/_/g, " ");
                const isTotal = key.includes("total");
                return (
                  <div key={key} className={`flex justify-between items-center py-2 ${isTotal ? "border-t-2 border-[#1F4F5B]/35 font-bold" : "border-b border-[#4C9DB0]/35"} text-sm`}>
                    <span className={`capitalize ${isTotal ? "text-[#163E48]" : "text-[#2A5C69]"}`}>{label}</span>
                    <span className={`tabular-nums ${isTotal ? "text-[#1F4F5B] font-extrabold" : "text-[#163E48] font-medium"}`}>{String(val)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(total).length > 0 && (
        <Card className="paper-card-soft rounded-2xl bg-[#FFF3CC]">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Total Trip Estimate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 text-sm">
              {Object.entries(total).map(([key, val]) => (
                <div key={key} className="flex justify-between border-b border-[#4C9DB0]/55 py-1.5 last:border-0">
                  <span className="text-[#2A5C69] capitalize">{key.replace(/_total|_local/, "").replace(/_/g, " ")}</span>
                  <span className="font-semibold text-[#163E48] tabular-nums">{String(val)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {accommodation.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Star className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Accommodation Picks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {accommodation.slice(0, 4).map((a: any, i: number) => (
              <div key={i} className="border-b border-[#4C9DB0]/35 pb-3 last:border-0 last:pb-0 text-sm">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-bold text-[#163E48]">{a.name ?? a.hotel_name ?? a.property}</p>
                    {a.area && <p className="font-note text-xs text-[#2A5C69]">{a.area}</p>}
                  </div>
                  {(a.price_per_night ?? a.nightly_rate ?? a.price) && (
                    <span className="font-note text-xs font-bold bg-[#FFEBAF]/65 border border-[#4C9DB0]/55 px-2.5 py-0.5 rounded-full tabular-nums">
                      {a.price_per_night ?? a.nightly_rate ?? a.price}/night
                    </span>
                  )}
                </div>
                {a.why_recommended && <p className="text-[#2A5C69] text-xs mt-1">{a.why_recommended}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activities.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Star className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Recommended Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {activities.slice(0, 6).map((a: any, i: number) => (
              <div key={i} className="flex items-start justify-between gap-2 border-b border-[#4C9DB0]/35 pb-2.5 last:border-0 last:pb-0 text-sm">
                <div className="flex-1">
                  <p className="font-semibold text-[#163E48]">{a.name ?? a.activity ?? String(a)}</p>
                  {a.description && <p className="text-xs text-[#2A5C69] mt-0.5">{a.description}</p>}
                </div>
                {(a.cost ?? a.estimated_cost) && (
                  <span className="font-note text-xs font-bold bg-[#FFEBAF]/65 border border-[#4C9DB0]/55 px-2.5 py-0.5 rounded-full shrink-0 tabular-nums">
                    {a.cost ?? a.estimated_cost}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {moneySaving.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#1F4F5B]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Money-Saving Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {moneySaving.map((tip: any, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#163E48]">
                  <span className="text-[#1F4F5B] font-bold mt-0.5">✓</span>
                  <span>{typeof tip === "string" ? tip : tip.tip ?? JSON.stringify(tip)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {hiddenCosts.length > 0 && (
        <Card className="border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0]/15 rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#1F4F5B]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Hidden Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {hiddenCosts.map((cost: any, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#163E48]">
                  <span className="text-[#1F4F5B] font-bold mt-0.5">•</span>
                  <span>{typeof cost === "string" ? cost : cost.cost ?? cost.item ?? JSON.stringify(cost)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {d.payment_tips && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Payment Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#2A5C69]">{typeof d.payment_tips === "string" ? d.payment_tips : JSON.stringify(d.payment_tips)}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AgentBudget() {
  return (
    <AgentPage
      title="Budget Planner"
      description="Daily cost breakdown, accommodation picks, hidden costs, and money-saving tips in local currency."
      icon={Wallet}
      fetchData={fetchBudget}
      formatData={(data) => <BudgetDisplay data={data} />}
    />
  );
}
