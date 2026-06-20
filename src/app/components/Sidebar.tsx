import { LayoutDashboard, BrainCircuit, MapPinned, MapPin, HeartPulse, Camera, Smartphone, Settings, LifeBuoy, BriefcaseBusiness, Warehouse, MessagesSquare, type LucideIcon } from "lucide-react";
import samkooLogo from "../../imports/Samkooinc_logo.jpg";

export type ViewKey = "dashboard" | "map" | "ai" | "attendance" | "labor" | "site" | "mobile" | "bids" | "assets" | "voc";
const NAV: { key: ViewKey; label: string; sub: string; icon: LucideIcon }[] = [
  { key: "dashboard", label: "통합 운영 대시보드", sub: "운영 매니저", icon: LayoutDashboard },
  { key: "map", label: "현장 통합지도", sub: "전국 현장 실시간 관제", icon: MapPinned },
  { key: "bids", label: "사업 수주·계약 관리", sub: "공고 분석·입찰·손익", icon: BriefcaseBusiness },
  { key: "assets", label: "시설·자산 관리", sub: "점검·고장·유지보수", icon: Warehouse },
  { key: "voc", label: "고객 VOC·SLA 관리", sub: "접수·조치·고객 회신", icon: MessagesSquare },
  { key: "ai", label: "AI 솔루션 센터", sub: "현장별 AI 패키지", icon: BrainCircuit },
  { key: "attendance", label: "근태 관리 (GPS)", sub: "출퇴근·스케줄 자동 정산", icon: MapPin },
  { key: "labor", label: "건강·노무 케어", sub: "설문·리스크 감지", icon: HeartPulse },
  { key: "site", label: "현장 AI 안전·미화", sub: "사진 점검·등급 관리", icon: Camera },
  { key: "mobile", label: "모바일 프로토타입", sub: "직원·소장·매니저 앱", icon: Smartphone },
];

export function Sidebar({ active, onChange, mobile = false }: { active: ViewKey; onChange: (v: ViewKey) => void; mobile?: boolean }) {
  return <aside className={`${mobile ? "flex" : "hidden lg:flex"} h-full w-[268px] shrink-0 flex-col bg-sidebar text-sidebar-foreground`}>
    <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5"><div className="flex h-9 shrink-0 items-center justify-center overflow-hidden rounded bg-white px-2"><img src={samkooLogo} alt="Samkoo Logo" className="h-6 w-auto object-contain" /></div><div className="leading-tight"><p className="text-[1.0625rem] font-bold text-white">삼구 ONE</p><p className="text-[.6875rem] text-sidebar-foreground/70">현장 운영 통합 플랫폼</p></div></div>
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5"><p className="mb-2 px-3 text-[.6875rem] font-semibold tracking-wider text-sidebar-foreground/50">업무 모듈</p>{NAV.map(item => { const Icon = item.icon; const activeItem = active === item.key; return <button key={item.key} onClick={() => onChange(item.key)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${activeItem ? "bg-[var(--brand-blue)] text-white" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}><Icon className="size-[18px] shrink-0" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{item.label}</span><span className={`block truncate text-[.6875rem] ${activeItem ? "text-white/70" : "text-sidebar-foreground/55"}`}>{item.sub}</span></span></button>})}</nav>
    <div className="px-4 pb-4"><div className="rounded-lg bg-sidebar-accent/60 px-4 py-3"><p className="text-[.6875rem] font-semibold text-sidebar-foreground/60">연결 규모</p><p className="text-[.9375rem] font-bold text-white">55,000 <small className="font-normal text-sidebar-foreground/70">직원</small> · 3,000 <small className="font-normal text-sidebar-foreground/70">현장</small></p></div></div>
    <div className="space-y-1 border-t border-sidebar-border px-3 pb-5 pt-4"><button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-sidebar-accent"><Settings className="size-[18px]" /> 환경설정</button><button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-sidebar-accent"><LifeBuoy className="size-[18px]" /> 고객지원</button></div>
  </aside>;
}
