import { Link } from "wouter";
import { FlowButton } from "@/components/ui/flow-button";
import { ScrapbookSticker } from "@/components/ScrapbookStickers";
import { PageFloatingStickers } from "@/components/PageFloatingStickers";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden min-h-screen paper-texture text-[#163E48] flex flex-col items-center justify-center p-6 text-center">
      <PageFloatingStickers variant="notfound" />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div className="w-28 -rotate-6">
          <ScrapbookSticker variant="statue" />
        </div>
        <h1 className="font-display text-6xl font-extrabold text-[#163E48]">404</h1>
        <p className="font-note text-sm text-[#2A5C69]">This page isn&apos;t pinned on our map.</p>
        <Link href="/">
          <FlowButton size="md" variant="primary" text="Go Home" />
        </Link>
      </div>
    </div>
  );
}
