import { Sidebar } from "@/components/Sidebar";
import { PageFloatingStickers } from "@/components/PageFloatingStickers";
import { useRef, type ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const mainRef = useRef<HTMLElement | null>(null);

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full paper-texture text-[#163E48] overflow-hidden">
      <Sidebar />
      <main ref={mainRef} className="flex-1 h-full overflow-y-auto overflow-x-hidden">
        <div className="relative min-h-full">
          <PageFloatingStickers variant="dashboard" scrollContainerRef={mainRef} />
          <div className="relative z-10">{children}</div>
        </div>
      </main>
    </div>
  );
}
