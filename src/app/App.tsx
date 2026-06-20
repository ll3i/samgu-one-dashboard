import { useState } from "react";
import { Sidebar, type ViewKey } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { DashboardView } from "./components/DashboardView";
import { MapView } from "./components/MapView";
import { AiSolutionCenter } from "./components/AiSolutionCenter";
import { AttendanceView } from "./components/AttendanceView";
import { LaborView } from "./components/LaborView";
import { SitePhotoView } from "./components/SitePhotoView";
import { MobileView } from "./components/MobileView";
import { Toaster } from "./components/ui/sonner";
import { BidContractView } from "./components/BidContractView";
import { AssetManagementView } from "./components/AssetManagementView";
import { VocSlaView } from "./components/VocSlaView";

export default function App() {
  const validViews: ViewKey[] = ["dashboard", "map", "ai", "attendance", "labor", "site", "mobile", "bids", "assets", "voc"];
  const hashView = window.location.hash.replace("#", "") as ViewKey;
  const [view, setViewState] = useState<ViewKey>(validViews.includes(hashView) ? hashView : "dashboard");
  const [mobileNav, setMobileNav] = useState(false);

  const setView = (next: ViewKey) => {
    setViewState(next);
    window.history.replaceState(null, "", `#${next}`);
  };

  return (
    <div className="h-screen w-full flex bg-background text-foreground overflow-hidden">
      <Sidebar active={view} onChange={(v) => { setView(v); setMobileNav(false); }} />

      {/* Mobile nav drawer */}
      {mobileNav && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNav(false)} />
          <div className="relative z-50">
            <Sidebar active={view} mobile onChange={(v) => { setView(v); setMobileNav(false); }} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenu={() => setMobileNav(true)} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="max-w-[1400px] mx-auto">
            {view === "dashboard" && <DashboardView onNavigate={setView} />}
            {view === "map" && <MapView />}
            {view === "ai" && <AiSolutionCenter />}
            {view === "attendance" && <AttendanceView />}
            {view === "labor" && <LaborView />}
            {view === "site" && <SitePhotoView />}
            {view === "mobile" && <MobileView />}
            {view === "bids" && <BidContractView />}
            {view === "assets" && <AssetManagementView />}
            {view === "voc" && <VocSlaView />}
          </div>
        </main>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
