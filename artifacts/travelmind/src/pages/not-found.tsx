import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrapbookSticker } from "@/components/ScrapbookStickers";

export default function NotFound() {
  return (
    <div className="min-h-screen paper-texture text-[#163E48] flex flex-col items-center justify-center gap-5 p-6 text-center">
      <div className="w-28 -rotate-6">
        <ScrapbookSticker variant="statue" />
      </div>
      <h1 className="font-display text-6xl font-extrabold text-[#163E48]">404</h1>
      <p className="font-note text-sm text-[#2A5C69]">This page isn&apos;t pinned on our map.</p>
      <Link href="/">
        <Button className="rounded-full bg-[#4C9DB0] text-[#163E48] border-[1.5px] border-[#1F4F5B] shadow-[3px_3px_0_#1F4F5B] font-bold hover:bg-[#3F8C9E] cursor-pointer">
          Go Home
        </Button>
      </Link>
    </div>
  );
}
