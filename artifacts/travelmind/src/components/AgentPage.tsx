import { ReactNode, useState, useEffect } from "react";
import { useTrip } from "@/context/TripContext";
import { useLocation } from "wouter";
import { Button } from "./ui/button";
import { ScrapbookSticker } from "./ScrapbookStickers";
import { RefreshCw, LucideIcon, Zap } from "lucide-react";

interface AgentPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  fetchData: (tripId: string) => Promise<any>;
  formatData?: (data: any) => ReactNode;
}

const AGENT_LOADING_MESSAGES = [
  "Shuffling field notes into place...",
  "Checking local signals and timing...",
  "Formatting your scannable briefing...",
];

export function AgentPage({ title, description, icon: Icon, fetchData, formatData }: AgentPageProps) {
  const { tripId } = useTrip();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    if (!tripId) setLocation("/plan");
  }, [tripId, setLocation]);

  useEffect(() => {
    if (!loading) {
      setStatusIdx(0);
      return;
    }
    const id = window.setInterval(() => {
      setStatusIdx((i) => (i + 1) % AGENT_LOADING_MESSAGES.length);
    }, 2000);
    return () => window.clearInterval(id);
  }, [loading]);

  if (!tripId) return null;

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchData(tripId);
      setData(res);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5 sm:p-8 md:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dashed border-[#4C9DB0]/65 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4C9DB0] border-[1.5px] border-[#1F4F5B] shadow-[2px_2px_0_#1F4F5B] flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-[#163E48]" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#163E48]">
              {title}
            </h1>
          </div>
          <p className="text-sm sm:text-base text-[#2A5C69] sm:pl-13">{description}</p>
        </div>

        {data && !loading && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            className="self-start sm:self-auto rounded-full border-[1.5px] border-[#1F4F5B] bg-[#FFF8E0] text-[#163E48] hover:bg-[#4C9DB0] font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        )}
      </div>

      <div className="min-h-[380px]">
        {loading && (
          <div className="paper-card rounded-3xl flex flex-col items-center justify-center py-20 px-6 space-y-6 text-center">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 animate-sticker-shuffle">
                <ScrapbookSticker variant="newsbird" />
              </div>
              <div className="w-16 animate-sticker-shuffle [animation-delay:0.3s]">
                <ScrapbookSticker variant="speech" />
              </div>
              <div className="w-16 animate-sticker-shuffle [animation-delay:0.6s]">
                <ScrapbookSticker variant="star" />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="font-display text-xl font-bold text-[#163E48]">
                Putting your briefing together...
              </p>
              <p className="font-note text-sm font-bold text-[#1F4F5B]">
                {AGENT_LOADING_MESSAGES[statusIdx]}
              </p>
              <p className="font-note text-xs text-[#2A5C69]">
                This can take up to 30 seconds while live intelligence compiles.
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="paper-card rounded-3xl flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#4C9DB0]/25 border border-[#1F4F5B] flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-[#1F4F5B]" />
            </div>
            <div className="space-y-1">
              <p className="font-display font-bold text-lg text-[#163E48]">Analysis Failed</p>
              <p className="text-sm text-[#2A5C69] max-w-sm">{error}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleAnalyze}
              className="rounded-full border-[1.5px] border-[#1F4F5B] bg-[#4C9DB0] text-[#163E48] font-bold hover:bg-[#3F8C9E] cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && data && (
          formatData ? (
            <div className="animate-step-enter">{formatData(data)}</div>
          ) : (
            <div className="paper-card-soft rounded-2xl p-6">
              <pre className="text-sm text-[#2A5C69] whitespace-pre-wrap font-note">
                {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )
        )}

        {!loading && !error && !data && (
          <div className="paper-card rounded-3xl flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-16 -rotate-6">
                <ScrapbookSticker variant="swallow" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-[#FFEBAF] border-[1.5px] border-[#1F4F5B] flex items-center justify-center">
                <Icon className="w-8 h-8 text-[#1F4F5B]" />
              </div>
            </div>
            <div className="space-y-2 max-w-sm">
              <p className="font-display text-xl font-bold text-[#163E48]">Ready to brief you</p>
              <p className="text-sm text-[#2A5C69]">
                Run this desk to turn your trip brief into a scannable, practical guide.
              </p>
            </div>
            <Button
              onClick={handleAnalyze}
              size="lg"
              className="gap-2 px-8 h-12 rounded-full bg-[#4C9DB0] text-[#163E48] hover:bg-[#3F8C9E] border-[1.5px] border-[#1F4F5B] shadow-[4px_4px_0_#1F4F5B] hover:shadow-[2px_2px_0_#1F4F5B] hover:translate-x-[2px] hover:translate-y-[2px] font-extrabold transition-all duration-150 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              Run Analysis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
