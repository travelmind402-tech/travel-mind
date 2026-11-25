import { Sidebar } from "@/components/Sidebar";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full paper-texture text-[#163E48] overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
