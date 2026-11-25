import { AgentPage } from "@/components/AgentPage";
import { fetchCuisine } from "@/services/api";
import { Utensils, MapPin, Droplets, AlertCircle, Star, ShoppingBag, Coffee, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const dietColors: Record<string, string> = {
  vegetarian: "bg-[#4C9DB0]/20 text-[#163E48] border-[#4C9DB0]",
  vegan: "bg-[#4C9DB0]/20 text-[#163E48] border-[#4C9DB0]",
  halal: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  kosher: "bg-[#FFEBAF] text-[#163E48] border-[#1F4F5B]/50",
  gluten_free: "bg-[#1F4F5B] text-[#FFEBAF] border-[#163E48]",
};

function CuisineDisplay({ data }: { data: any }) {
  const d = data?.cuisine_analysis ?? data ?? {};
  const overview = d.cuisine_overview ?? {};
  const dishes = d.must_try_dishes ?? [];
  const restaurants = d.recommended_restaurants ?? [];
  const street = d.street_food_guide ?? {};
  const markets = d.food_markets ?? [];
  const dietary = d.dietary_accommodation ?? {};
  const drinks = d.local_drinks ?? {};
  const traps = d.tourist_trap_foods ?? [];
  const budget = d.budget_meal_plan ?? {};
  const experiences = d.food_experiences ?? [];
  const weatherDining = d.weather_dining_impact ?? {};

  return (
    <div className="space-y-5">
      {d.destination && (
        <div className="flex items-center gap-2.5 flex-wrap">
          <MapPin className="w-4 h-4 text-[#1F4F5B]" />
          <span className="font-display font-bold text-lg text-[#163E48]">{d.destination}</span>
          {d.currency_used && <Badge variant="outline" className="text-xs border-[#1F4F5B]/45 bg-[#FFF8E0]">{d.currency_used}</Badge>}
          {d.overall_food_rating && (
            <Badge className="text-xs capitalize bg-[#4C9DB0] text-[#163E48] border border-[#1F4F5B]">
              {d.overall_food_rating}
            </Badge>
          )}
        </div>
      )}

      {overview.food_culture && (
        <Card className="bg-[#4C9DB0]/20 border-[1.5px] border-[#1F4F5B] shadow-[3px_3px_0_#1F4F5B] rounded-2xl">
          <CardContent className="p-5 text-sm sm:text-base leading-relaxed text-[#163E48]">
            {overview.food_culture}
          </CardContent>
        </Card>
      )}

      {/* Signature Ingredients */}
      {overview.signature_ingredients?.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center font-note text-xs text-[#2A5C69]">
          <span className="font-bold text-[#163E48]">Key ingredients:</span>
          <span>{overview.signature_ingredients.join(" · ")}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {overview.eating_customs && (
          <Card className="paper-card-soft rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="font-display text-base font-bold text-[#163E48]">Eating Customs</CardTitle></CardHeader>
            <CardContent className="text-sm text-[#2A5C69] space-y-2">
              <p>{overview.eating_customs}</p>
              {overview.tipping_at_restaurants && (
                <p><span className="font-semibold text-[#163E48]">Tipping:</span> {overview.tipping_at_restaurants}</p>
              )}
            </CardContent>
          </Card>
        )}
        {overview.meal_timings && (
          <Card className="paper-card-soft rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="font-display text-base font-bold text-[#163E48]">Meal Timings</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1.5">
              {Object.entries(overview.meal_timings).map(([meal, time]) => (
                <div key={meal} className="flex justify-between border-b border-[#4C9DB0]/35 pb-1 last:border-0">
                  <span className="text-[#2A5C69] capitalize">{meal}</span>
                  <span className="font-medium text-[#163E48]">{String(time)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Must-Try Dishes */}
      {dishes.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Star className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Must-Try Dishes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dishes.map((dish: any, i: number) => (
              <div key={i} className="border-b border-[#4C9DB0]/35 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-[#163E48]">{dish.dish_name}</span>
                    {dish.local_name && dish.local_name !== dish.dish_name && (
                      <span className="font-note text-xs text-[#2A5C69] ml-2">({dish.local_name})</span>
                    )}
                  </div>
                  {(dish.estimated_cost_local ?? dish.estimated_cost_usd) && (
                    <span className="text-xs font-note font-bold bg-[#FFEBAF]/65 border border-[#4C9DB0]/55 px-2.5 py-0.5 rounded-full shrink-0 tabular-nums">
                      {dish.estimated_cost_local ?? `$${dish.estimated_cost_usd}`}
                    </span>
                  )}
                </div>
                {dish.description && <p className="text-sm text-[#2A5C69] mt-1">{dish.description}</p>}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {dish.dietary_tags?.map((tag: string) => (
                    <span key={tag} className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${dietColors[tag] ?? "bg-[#FFF3CC] text-[#163E48] border-[#4C9DB0]/55"}`}>
                      {tag.replace(/_/g, " ")}
                    </span>
                  ))}
                  {dish.where_to_find && <Badge variant="outline" className="text-xs border-[#1F4F5B]/45">{dish.where_to_find}</Badge>}
                  {dish.seasonal_availability && <Badge variant="outline" className="text-xs capitalize border-[#1F4F5B]/45">{dish.seasonal_availability.replace(/_/g, " ")}</Badge>}
                </div>
                {dish.ordering_tip && <p className="font-note text-xs text-[#1F4F5B] mt-1.5">Tip: {dish.ordering_tip}</p>}
                {dish.allergy_flag && dish.allergy_flag !== "none" && (
                  <p className="font-note text-xs text-[#163E48] font-bold mt-1">Allergy alert: {dish.allergy_flag}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended Restaurants */}
      {restaurants.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Utensils className="w-4 h-4 text-[#1F4F5B]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Recommended Restaurants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {restaurants.map((r: any, i: number) => (
              <div key={i} className="border-b border-[#4C9DB0]/35 pb-3.5 last:border-0 last:pb-0 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-[#163E48]">{r.name}</span>
                  {r.estimated_cost_per_person_local && (
                    <span className="text-xs font-note font-bold bg-[#FFEBAF]/65 border border-[#4C9DB0]/55 px-2.5 py-0.5 rounded-full shrink-0 tabular-nums">
                      {r.estimated_cost_per_person_local}
                    </span>
                  )}
                </div>
                {r.address && <p className="font-note text-xs text-[#2A5C69] mt-0.5">{r.address}</p>}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {r.cuisine_type && <Badge variant="secondary" className="text-xs capitalize bg-[#FFF3CC] text-[#163E48]">{r.cuisine_type.replace(/;/g, " / ")}</Badge>}
                  {r.best_for && <Badge variant="outline" className="text-xs border-[#1F4F5B]/45">{r.best_for}</Badge>}
                  {r.dietary_options?.map((d: string) => (
                    <span key={d} className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${dietColors[d] ?? "bg-[#FFF3CC] text-[#163E48] border-[#4C9DB0]/55"}`}>
                      {d.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
                {r.must_order?.length > 0 && (
                  <p className="text-xs font-semibold text-[#1F4F5B] mt-1.5">Order: {r.must_order.join(", ")}</p>
                )}
                {r.insider_tip && <p className="font-note text-xs text-[#2A5C69] mt-0.5">Note: {r.insider_tip}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Street Food Guide */}
      {Object.keys(street).length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <MapPin className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Street Food Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm">
            {street.best_areas?.length > 0 && (
              <div>
                <p className="font-note text-[#2A5C69] text-xs mb-1">Best Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {street.best_areas.map((a: string) => <Badge key={a} variant="secondary" className="text-xs bg-[#FFF3CC] text-[#163E48]">{a}</Badge>)}
                </div>
              </div>
            )}
            {street.best_time_to_visit && <p><span className="text-[#2A5C69]">Best Time:</span> {street.best_time_to_visit}</p>}
            {street.safety_rating && <p><span className="text-[#2A5C69]">Safety:</span> <span className="capitalize font-semibold">{street.safety_rating}</span></p>}
            {street.average_meal_cost_local && <p><span className="text-[#2A5C69]">Avg cost:</span> {street.average_meal_cost_local}</p>}
            {street.must_try_street_foods?.length > 0 && (
              <div>
                <p className="font-note text-[#2A5C69] text-xs mb-1">Must Try</p>
                <div className="flex flex-wrap gap-1.5">
                  {street.must_try_street_foods.map((f: string) => <Badge key={f} variant="outline" className="text-xs border-[#1F4F5B]/45">{f}</Badge>)}
                </div>
              </div>
            )}
            {street.hygiene_tips?.length > 0 && (
              <div className="pt-1">
                <p className="font-note text-[#2A5C69] text-xs mb-1">Hygiene Tips</p>
                <ul className="space-y-1">
                  {street.hygiene_tips.map((t: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-[#2A5C69]"><span className="text-[#4C9DB0] font-bold mt-0.5">•</span>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Food Markets */}
      {markets.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Food Markets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {markets.map((m: any, i: number) => (
              <div key={i} className="border-b border-[#4C9DB0]/35 pb-2.5 last:border-0 last:pb-0 text-sm">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-[#163E48]">{m.name}</span>
                  {m.best_time && <span className="font-note text-xs text-[#2A5C69]">{m.best_time}</span>}
                </div>
                {m.address && <p className="font-note text-xs text-[#2A5C69] mt-0.5">{m.address}</p>}
                {m.what_to_buy?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {m.what_to_buy.map((item: string) => <Badge key={item} variant="secondary" className="text-xs bg-[#FFF3CC] text-[#163E48]">{item}</Badge>)}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weather Dining Impact */}
      {Object.keys(weatherDining).length > 0 && (
        <Card className="border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0]/15 rounded-2xl">
          <CardHeader className="pb-2"><CardTitle className="font-display text-base font-bold text-[#163E48]">Weather & Dining</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1.5">
            {weatherDining.note && <p className="text-[#2A5C69]">{weatherDining.note}</p>}
            {weatherDining.street_food_warning && <p className="text-[#1F4F5B] font-medium text-xs">{weatherDining.street_food_warning}</p>}
            {weatherDining.indoor_alternatives && <p className="text-xs text-[#163E48]">Indoor backup: {weatherDining.indoor_alternatives}</p>}
            {weatherDining.seasonal_dish_recommendation && <p className="text-[#1F4F5B] font-medium text-xs">Seasonal pick: {weatherDining.seasonal_dish_recommendation}</p>}
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {Object.keys(dietary).length > 0 && (
          <Card className="paper-card-soft rounded-2xl">
            <CardHeader className="pb-2 flex-row items-center gap-2">
              <Leaf className="w-4 h-4 text-[#4C9DB0]" />
              <CardTitle className="font-display text-base font-bold text-[#163E48]">Dietary Accommodation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1.5">
              {dietary.vegetarian_friendly !== undefined && (
                <p><span className="text-[#2A5C69]">Vegetarian:</span> {dietary.vegetarian_friendly ? "Friendly" : "Limited"}</p>
              )}
              {dietary.vegan_options && <p><span className="text-[#2A5C69]">Vegan:</span> {dietary.vegan_options}</p>}
              {dietary.halal_availability && <p><span className="text-[#2A5C69]">Halal:</span> {dietary.halal_availability}</p>}
              {dietary.gluten_free_options && <p><span className="text-[#2A5C69]">Gluten-Free:</span> {dietary.gluten_free_options}</p>}
              {dietary.allergy_warning && (
                <p className="text-[#1F4F5B] font-medium text-xs pt-1">{dietary.allergy_warning}</p>
              )}
            </CardContent>
          </Card>
        )}

        {Object.keys(drinks).length > 0 && (
          <Card className="paper-card-soft rounded-2xl">
            <CardHeader className="pb-2 flex-row items-center gap-2">
              <Droplets className="w-4 h-4 text-[#4C9DB0]" />
              <CardTitle className="font-display text-base font-bold text-[#163E48]">Local Drinks</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              {drinks.water_safety && (
                <p className={`font-semibold ${drinks.water_safety?.toLowerCase() === "safe" ? "text-[#1F4F5B]" : "text-[#163E48]"}`}>
                  Water: {drinks.water_safety?.toLowerCase() === "safe" ? "Tap safe" : drinks.water_safety?.toLowerCase().includes("bottle") ? "Bottled only" : drinks.water_safety}
                </p>
              )}
              {drinks.best_local_cafe && <p><span className="text-[#2A5C69]">Best Cafe:</span> {drinks.best_local_cafe}</p>}
              {drinks.non_alcoholic?.length > 0 && (
                <div>
                  <p className="font-note text-[#2A5C69] text-xs">Non-alcoholic</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {drinks.non_alcoholic.map((d: string) => <Badge key={d} variant="secondary" className="text-xs bg-[#FFF3CC] text-[#163E48]">{d}</Badge>)}
                  </div>
                </div>
              )}
              {drinks.alcoholic?.length > 0 && (
                <div>
                  <p className="font-note text-[#2A5C69] text-xs">Alcoholic</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {drinks.alcoholic.map((d: string) => <Badge key={d} variant="outline" className="text-xs border-[#1F4F5B]/45">{d}</Badge>)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Seasonal Specials */}
      {d.seasonal_specials?.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center font-note text-xs text-[#2A5C69]">
          <span className="font-bold text-[#163E48]">Seasonal now:</span>
          <span>{d.seasonal_specials.join(" · ")}</span>
        </div>
      )}

      {/* Tourist Trap Foods */}
      {traps.length > 0 && (
        <Card className="border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0]/15 rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#1F4F5B]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Tourist Trap Foods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {traps.map((t: any, i: number) => (
              <div key={i} className="text-sm border-b border-[#4C9DB0]/35 pb-2.5 last:border-0 last:pb-0">
                <p className="font-bold text-[#163E48]">{t.item} <span className="font-note text-[#2A5C69] text-xs font-normal">@ {t.location}</span></p>
                <p className="text-[#163E48] text-xs mt-0.5">{t.warning}</p>
                {t.better_alternative && <p className="text-[#1F4F5B] text-xs font-medium mt-0.5">Better: {t.better_alternative}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Budget Meal Plan */}
      {Object.keys(budget).length > 0 && (
        <Card className="paper-card-soft rounded-2xl bg-[#FFF3CC]">
          <CardHeader className="pb-2"><CardTitle className="font-display text-base font-bold text-[#163E48]">Budget Meal Plan</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            {budget.breakfast_options?.length > 0 && (
              <p><span className="font-semibold text-[#163E48]">Breakfast:</span> {budget.breakfast_options.join(" / ")}</p>
            )}
            {budget.lunch_options?.length > 0 && (
              <p><span className="font-semibold text-[#163E48]">Lunch:</span> {budget.lunch_options.join(" / ")}</p>
            )}
            {budget.dinner_options?.length > 0 && (
              <p><span className="font-semibold text-[#163E48]">Dinner:</span> {budget.dinner_options.join(" / ")}</p>
            )}
            {budget.daily_food_budget_estimate_local && (
              <p className="pt-2 border-t border-[#4C9DB0]/55"><span className="text-[#2A5C69]">Daily estimate:</span> <strong>{budget.daily_food_budget_estimate_local}</strong></p>
            )}
            {budget.money_saving_tips?.length > 0 && (
              <ul className="pt-1 space-y-1">
                {budget.money_saving_tips.map((t: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-[#2A5C69] text-xs"><span className="text-[#4C9DB0] font-bold mt-0.5">•</span>{t}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Food Experiences */}
      {experiences.length > 0 && (
        <Card className="paper-card-soft rounded-2xl">
          <CardHeader className="pb-2 flex-row items-center gap-2">
            <Coffee className="w-4 h-4 text-[#4C9DB0]" />
            <CardTitle className="font-display text-base font-bold text-[#163E48]">Food Experiences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {experiences.map((e: any, i: number) => (
              <div key={i} className="text-sm border-b border-[#4C9DB0]/35 pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-[#163E48]">{e.experience}</span>
                  <div className="flex gap-2 font-note text-xs text-[#2A5C69]">
                    {e.duration && <span>{e.duration}</span>}
                    {e.estimated_cost_local && <span className="tabular-nums font-bold text-[#163E48]">{e.estimated_cost_local}</span>}
                  </div>
                </div>
                {e.description && <p className="text-[#2A5C69] text-xs mt-0.5">{e.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {d.emergency_food && (
        <p className="font-note text-xs text-[#2A5C69] px-1">Emergency food note: {d.emergency_food}</p>
      )}
    </div>
  );
}

export default function AgentCuisine() {
  return (
    <AgentPage
      title="Cuisine Guide"
      description="Must-try dishes, street food map, dietary accommodation, local drinks, and tourist food traps."
      icon={Utensils}
      fetchData={fetchCuisine}
      formatData={(data) => <CuisineDisplay data={data} />}
    />
  );
}
