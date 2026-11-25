import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useTrip } from "@/context/TripContext";
import {
  Cloud,
  AlertTriangle,
  Car,
  Utensils,
  Globe,
  Wallet,
  MessageSquare,
  Home,
  Plus,
  PlaneTakeoff,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "./ui/button";

const links = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/weather", label: "Weather", icon: Cloud },
  { href: "/dashboard/disruption", label: "Disruptions", icon: AlertTriangle },
  { href: "/dashboard/driving", label: "Driving", icon: Car },
  { href: "/dashboard/cuisine", label: "Cuisine", icon: Utensils },
  { href: "/dashboard/culture", label: "Culture", icon: Globe },
  { href: "/dashboard/budget", label: "Budget", icon: Wallet },
  { href: "/dashboard/language", label: "Language", icon: MessageSquare },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { tripForm, tripId, clearSession } = useTrip();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Compact Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1F4F5B] text-[#FFEBAF] border-b border-[#4C9DB0]/40 shrink-0">
        <Link href="/" className="flex items-center gap-2 font-display text-lg tracking-wide">
          <span className="w-7 h-7 rounded-full bg-[#FFEBAF] text-[#163E48] flex items-center justify-center">
            <PlaneTakeoff className="w-3.5 h-3.5" />
          </span>
          <span>TRAVELMIND</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              clearSession();
              setLocation("/plan");
            }}
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs rounded-full border-[#FFEBAF]/45 bg-transparent text-[#FFEBAF] hover:bg-[#FFEBAF] hover:text-[#163E48] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Trip
          </Button>
          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileOpen((o) => !o)}
            className="w-9 h-9 rounded-lg border border-[#FFEBAF]/35 flex items-center justify-center text-[#FFEBAF]"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Nav */}
      {mobileOpen && (
        <nav className="md:hidden bg-[#1F4F5B] text-[#FFEBAF] border-b border-[#4C9DB0]/40 px-3 py-2 space-y-1 shrink-0">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = location === href || (href !== "/dashboard" && location.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-sm ${
                    isActive
                      ? "bg-[#FFEBAF] text-[#163E48] font-bold"
                      : "text-[#FFEBAF]/85 hover:bg-[#4C9DB0]/25"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r-[1.5px] border-[#163E48] bg-[#1F4F5B] text-[#FFEBAF] flex-col h-[100dvh] flex-shrink-0">
        <div className="p-5 border-b border-[#4C9DB0]/35">
          <div className="flex items-center gap-2.5 font-display font-extrabold text-lg tracking-tight text-[#FFEBAF]">
            <span className="w-8 h-8 rounded-full bg-[#FFEBAF] text-[#163E48] flex items-center justify-center shrink-0">
              <PlaneTakeoff className="w-4 h-4" />
            </span>
            <span>TravelMind</span>
          </div>
          {tripForm && (
            <div className="mt-3 pt-3 border-t border-[#4C9DB0]/30 space-y-1">
              <div className="font-semibold text-sm text-[#FFEBAF] truncate">
                {tripForm.city}, {tripForm.country}
              </div>
              {tripId && (
                <div className="font-note text-[11px] text-[#FFEBAF]/80">
                  brief #{tripId.split("-")[0]}
                </div>
              )}
            </div>
          )}
        </div>

        <nav aria-label="Dashboard navigation" className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = location === href || (href !== "/dashboard" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <div
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 text-sm ${
                    isActive
                      ? "bg-[#FFEBAF] text-[#163E48] font-bold shadow-[2px_2px_0_#4C9DB0]"
                      : "hover:bg-[#4C9DB0]/25 text-[#FFEBAF]/85 hover:text-[#FFEBAF]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3.5 border-t border-[#4C9DB0]/35 space-y-2.5">
          {user && (
            <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-[#4C9DB0]/20 border border-[#4C9DB0]/40">
              <span className="font-note text-xs text-[#FFEBAF] truncate">{user.name}</span>
              <button
                type="button"
                aria-label="Log out"
                onClick={() => void logout()}
                className="text-xs text-[#FFEBAF]/80 hover:text-[#FFEBAF] inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <Button
            onClick={() => {
              clearSession();
              setLocation("/plan");
            }}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2 rounded-xl border-[#4C9DB0]/60 text-[#FFEBAF] hover:text-[#163E48] bg-transparent hover:bg-[#FFEBAF] hover:border-[#FFEBAF] font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Trip
          </Button>
        </div>
      </aside>
    </>
  );
}
