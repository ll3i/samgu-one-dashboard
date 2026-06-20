import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, Bot, CheckCircle2, ChevronRight, CircleDot, Clock3, Filter,
  Layers3, LocateFixed, MapPinned, Navigation, Pause, Play, Route, Search,
  ShieldAlert, Sparkles, UserRoundCheck, UsersRound, Warehouse, X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard, StatCard, StatusPill } from "./shared";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { SiteMap } from "./SiteMap";
import { sites, STATUS_META, type Site, type SiteStatus } from "../lib/siteData";
import { readOperations, type Asset } from "../lib/operationsStore";

type ActionStatus = "대기" | "진행" | "완료";
type FieldAction = { id: number; siteId: string; title: string; assignee: string; priority: "긴급" | "높음" | "보통"; due: string; status: ActionStatus };

const initialActions: FieldAction[] = [
  { id: 1, siteId: "site-5", title: "소화기 통로 적치물 제거", assignee: "박정수", priority: "긴급", due: "오늘 14:00", status: "진행" },
  { id: 2, siteId: "site-7", title: "미보고 현장 점검 독촉", assignee: "이현아", priority: "높음", due: "오늘 17:00", status: "대기" },
];

const layerOptions: { key: SiteStatus; label: string }[] = [
  { key: "attendance", label: "근태" }, { key: "safety", label: "안전" },
  { key: "labor", label: "노무" }, { key: "unreported", label: "미보고" },
];

function SiteRow({ site, selected, onClick }: { site: Site; selected: boolean; onClick: () => void }) {
  const meta = STATUS_META[site.status];
  return (
    <button onClick={onClick} className={`w-full rounded-lg border p-3 text-left transition-colors ${selected ? "border-[var(--brand-blue)] bg-[var(--brand-blue-soft)]" : "border-border bg-card hover:bg-muted/60"}`}>
      <div className="flex items-start gap-2">
        <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: meta.color }} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{site.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{site.region} · {site.client} · {site.headcount}명</p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px]">
        <span className="rounded-full px-2 py-0.5 font-semibold" style={{ color: meta.color, background: meta.soft }}>{meta.label}</span>
        <span className="text-muted-foreground">출근 {site.attendanceRate}%</span>
        <span className="text-muted-foreground">안전 {site.safetyGrade}</span>
      </div>
    </button>
  );
}

function DetailPanel({ site, onClose, onAction }: { site: Site; onClose: () => void; onAction: () => void }) {
  const meta = STATUS_META[site.status];
  return (
    <aside className="h-full overflow-y-auto border-l border-border bg-card p-4 xl:w-[330px]">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg" style={{ color: meta.color, background: meta.soft }}><MapPinned className="size-5" /></span>
        <div className="min-w-0 flex-1"><h3 className="font-semibold">{site.name}</h3><p className="text-xs text-muted-foreground">{site.address}</p></div>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-muted"><X className="size-4" /></button>
      </div>
      <div className="my-4 flex items-center gap-2"><span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ color: meta.color, background: meta.soft }}>{meta.label}</span><StatusPill tone={site.sla < 90 ? "red" : "green"}>SLA {site.sla}%</StatusPill></div>
      <dl className="grid grid-cols-2 gap-2">
        {[["담당 매니저", site.manager], ["고객사", site.client], ["업종", site.industry], ["근무 인원", `${site.headcount}명`], ["출근율", `${site.attendanceRate}%`], ["설문 응답", `${site.surveyRate}%`], ["안전등급", site.safetyGrade], ["GPS 반경", `${site.geofenceRadius}m`]].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-muted/60 p-2.5"><dt className="text-[11px] text-muted-foreground">{k}</dt><dd className="mt-1 text-sm font-semibold">{v}</dd></div>
        ))}
      </dl>
      <div className="mt-4 rounded-lg border border-border p-3">
        <p className="mb-2 text-xs font-semibold">현재 알림</p>
        {site.alerts.length ? site.alerts.map((alert) => <div key={alert} className="flex gap-2 text-xs leading-5 text-[var(--danger)]"><AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{alert}</div>) : <p className="text-xs text-muted-foreground">감지된 이상이 없습니다.</p>}
      </div>
      <div className="mt-4 rounded-lg border border-border p-3 text-xs">
        <p className="font-semibold">최근 이력</p>
        <ul className="mt-2 space-y-2 text-muted-foreground">
          <li>오늘 {site.lastInspection} · 현장 사진 AI 점검</li>
          <li>어제 18:12 · 일일보고서 제출 완료</li>
          <li>06.15 09:04 · GPS 출근 집계 완료</li>
        </ul>
      </div>
      <Button onClick={onAction} className="mt-4 w-full bg-[var(--brand-navy)] hover:bg-[var(--brand-navy)]/90"><CircleDot className="size-4" /> 조치 배정</Button>
    </aside>
  );
}

export function MapView() {
  const [selectedId, setSelectedId] = useState(sites[0].id);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("전체");
  const [grade, setGrade] = useState("전체");
  const [manager, setManager] = useState("전체");
  const [activeLayers, setActiveLayers] = useState<Set<SiteStatus>>(new Set(["attendance", "safety", "labor", "unreported"]));
  const [heatmap, setHeatmap] = useState(false);
  const [hour, setHour] = useState(10);
  const [playing, setPlaying] = useState(false);
  const [showAssetRisk, setShowAssetRisk] = useState(true);
  const [riskAssets, setRiskAssets] = useState<Asset[]>(() => readOperations().assets.filter((a) => a.risk >= 70 || a.status === "고장"));
  const [actions, setActions] = useState<FieldAction[]>(initialActions);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionTitle, setActionTitle] = useState("");
  const [assignee, setAssignee] = useState("김대영");

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setHour((value) => value >= 18 ? 7 : value + 1), 900);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    const sync = () => setRiskAssets(readOperations().assets.filter((a) => a.risk >= 70 || a.status === "고장"));
    window.addEventListener("operations-change", sync);
    return () => window.removeEventListener("operations-change", sync);
  }, []);

  const filtered = useMemo(() => sites.filter((site) => {
    const term = query.trim().toLowerCase();
    return (!term || [site.name, site.address, site.client, site.manager].some((v) => v.toLowerCase().includes(term)))
      && (region === "전체" || site.region === region)
      && (grade === "전체" || site.safetyGrade === grade)
      && (manager === "전체" || site.manager === manager)
      && (site.status === "normal" || activeLayers.has(site.status));
  }), [query, region, grade, manager, activeLayers]);

  const selected = sites.find((site) => site.id === selectedId);
  const selectSite = useCallback((id: string) => setSelectedId(id), []);
  const regions = ["전체", ...new Set(sites.map((s) => s.region))];
  const managers = ["전체", ...new Set(sites.map((s) => s.manager))];
  const dangerCount = sites.filter((s) => s.status === "safety").length;
  const issueCount = sites.filter((s) => s.status !== "normal").length;

  const toggleLayer = (key: SiteStatus) => setActiveLayers((current) => {
    const next = new Set(current); next.has(key) ? next.delete(key) : next.add(key); return next;
  });

  const createAction = () => {
    if (!selected || !actionTitle.trim()) { toast.error("조치 내용을 입력해 주세요."); return; }
    setActions((current) => [...current, { id: Date.now(), siteId: selected.id, title: actionTitle.trim(), assignee, priority: selected.status === "safety" ? "긴급" : "높음", due: "오늘 18:00", status: "대기" }]);
    setActionTitle(""); setActionOpen(false); toast.success(`${selected.name} 조치를 배정했습니다.`);
  };

  const advanceAction = (id: number) => setActions((current) => current.map((action) => action.id === id ? { ...action, status: action.status === "대기" ? "진행" : "완료" } : action));

  return (
    <div>
      <PageHeader title="현장 통합지도" subtitle="전국 현장의 근태·안전·노무·미보고 상태를 공간 기반으로 확인하고 즉시 조치합니다" action={<span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--success)]"><span className="size-1.5 animate-pulse rounded-full bg-[var(--success)]" /> 실시간 관제</span>} />

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="관리 현장" value={sites.length} unit="곳" icon={MapPinned} tone="navy" hint="전국 6개 권역" />
        <StatCard label="이상 감지" value={issueCount} unit="곳" icon={AlertTriangle} tone="amber" hint="근태·안전·노무" />
        <StatCard label="안전 위험" value={dangerCount} unit="곳" icon={ShieldAlert} tone="red" hint="즉시 조치 대상" />
        <StatCard label="진행 중 조치" value={actions.filter((a) => a.status !== "완료").length} unit="건" icon={UserRoundCheck} tone="green" hint="담당자 배정 완료" />
      </div>

      <div className="mb-5 rounded-[var(--radius)] border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-lg bg-input-background px-3"><Search className="size-4 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="현장·주소·고객사·담당자 검색" /></div>
          {[{ value: region, set: setRegion, options: regions, label: "지역" }, { value: grade, set: setGrade, options: ["전체", "A", "B", "C"], label: "등급" }, { value: manager, set: setManager, options: managers, label: "담당자" }].map((item) => (
            <select key={item.label} value={item.value} onChange={(e) => item.set(e.target.value)} className="h-9 rounded-lg border border-border bg-card px-2.5 text-xs outline-none"><option disabled>{item.label}</option>{item.options.map((v) => <option key={v}>{v}</option>)}</select>
          ))}
          <Button variant="outline" size="sm" onClick={() => { setQuery(""); setRegion("전체"); setGrade("전체"); setManager("전체"); }}><Filter className="size-3.5" /> 초기화</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Layers3 className="size-4 text-muted-foreground" />
          {layerOptions.map(({ key, label }) => <button key={key} onClick={() => toggleLayer(key)} className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${activeLayers.has(key) ? "border-transparent text-white" : "border-border text-muted-foreground"}`} style={activeLayers.has(key) ? { background: STATUS_META[key].color } : undefined}>{label}</button>)}
          <button onClick={() => setHeatmap((v) => !v)} className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${heatmap ? "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]" : "border-border text-muted-foreground"}`}>위험 히트맵</button>
          <button onClick={() => setShowAssetRisk((v) => !v)} className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${showAssetRisk ? "border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]" : "border-border text-muted-foreground"}`}><Warehouse className="mr-1 inline size-3.5" />시설 위험 {riskAssets.length}</button>
          <div className="ml-auto flex min-w-[250px] items-center gap-2 text-xs"><button onClick={() => setPlaying((v) => !v)} className="grid size-7 place-items-center rounded-md bg-muted">{playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}</button><span className="font-semibold">{String(hour).padStart(2, "0")}:00</span><input type="range" min="7" max="18" value={hour} onChange={(e) => setHour(Number(e.target.value))} className="flex-1" /></div>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-[var(--radius)] border border-border bg-card shadow-sm">
        <div className="grid min-h-[620px] grid-cols-1 xl:grid-cols-[285px_minmax(0,1fr)_auto]">
          <div className="max-h-[620px] overflow-y-auto border-r border-border p-3">
            <div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold">현장 목록</p><span className="text-xs text-muted-foreground">{filtered.length}곳</span></div>
            <div className="space-y-2">{filtered.map((site) => <SiteRow key={site.id} site={site} selected={selectedId === site.id} onClick={() => selectSite(site.id)} />)}</div>
          </div>
          <div className="relative min-h-[420px]"><SiteMap sites={filtered} selectedId={selectedId} onSelect={selectSite} heatmap={heatmap} />{showAssetRisk && riskAssets.length > 0 && <div className="absolute bottom-3 left-3 max-w-[310px] rounded-lg border border-red-200 bg-white/95 p-3 text-xs shadow-lg"><p className="font-bold text-[var(--danger)]"><Warehouse className="mr-1 inline size-4" />시설 위험 현장 레이어</p>{riskAssets.map(a => <div key={a.id} className="mt-2 border-t pt-2"><b>{a.site}</b><p className="text-muted-foreground">{a.name} · 위험 {a.risk}%</p></div>)}</div>}<div className="absolute right-3 top-3 rounded-lg bg-white/95 px-3 py-2 text-xs shadow"><b>{String(hour).padStart(2, "0")}:00 관제 스냅샷</b><p className="mt-0.5 text-muted-foreground">필터 결과 {filtered.length}개 현장</p></div></div>
          {selected && <DetailPanel site={selected} onClose={() => setSelectedId("")} onAction={() => { setActionTitle(selected.alerts[0] ?? "현장 운영 상태 확인"); setActionOpen(true); }} />}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <SectionCard title="AI 운영 브리핑" description="현재 관제 데이터 기반 우선순위" icon={Bot} className="xl:col-span-2">
          <div className="rounded-lg bg-[var(--brand-blue-soft)] p-4 text-sm leading-6"><Sparkles className="mr-2 inline size-4 text-[var(--brand-blue)]" /><b>오전 {hour}시 기준</b> 안전 위험 {dangerCount}곳과 미보고 현장을 우선 확인하세요. 강서 사업장은 C등급과 낮은 SLA가 동시에 감지돼 즉시 방문 대상입니다.</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">{[["1순위", "강서 사업장", "안전 C · SLA 위험"], ["2순위", "판교 물류센터", "근골격계 신호"], ["추천", "김포→고양→강서", "순회 54분 단축"]].map(([rank, title, text]) => <div key={rank} className="rounded-lg border border-border p-3"><span className="text-[11px] font-bold text-[var(--brand-blue)]">{rank}</span><p className="mt-1 text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{text}</p></div>)}</div>
        </SectionCard>
        <SectionCard title="인력·경로 추천" description="거리와 가용시간 기반" icon={Route}>
          <div className="space-y-3 text-sm"><div className="flex gap-3 rounded-lg border border-border p-3"><UsersRound className="size-5 text-[var(--success)]" /><div><b>대체인력 3명 가용</b><p className="text-xs text-muted-foreground">최근접 2.4km · 유사업무 숙련</p></div></div><div className="flex gap-3 rounded-lg border border-border p-3"><Navigation className="size-5 text-[var(--brand-blue)]" /><div><b>오후 순회 4개 현장</b><p className="text-xs text-muted-foreground">예상 2시간 35분 · 18km</p></div></div></div>
        </SectionCard>
      </div>

      <SectionCard title="조치 관리" description="현장 이상 감지부터 완료까지 담당자별 추적" icon={CheckCircle2}>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="pb-3">현장</th><th className="pb-3">조치</th><th className="pb-3">담당자</th><th className="pb-3">우선순위</th><th className="pb-3">기한</th><th className="pb-3">상태</th></tr></thead><tbody>{actions.map((action) => { const site = sites.find((s) => s.id === action.siteId); return <tr key={action.id} className="border-b border-border last:border-0"><td className="py-3 font-semibold">{site?.name}</td><td className="py-3">{action.title}</td><td className="py-3">{action.assignee}</td><td className="py-3"><StatusPill tone={action.priority === "긴급" ? "red" : "amber"}>{action.priority}</StatusPill></td><td className="py-3 text-muted-foreground">{action.due}</td><td className="py-3"><button disabled={action.status === "완료"} onClick={() => advanceAction(action.id)} className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold disabled:text-[var(--success)]">{action.status}{action.status !== "완료" && " →"}</button></td></tr>; })}</tbody></table></div>
      </SectionCard>

      <Dialog open={actionOpen} onOpenChange={setActionOpen}><DialogContent><DialogHeader><DialogTitle>현장 조치 배정</DialogTitle><DialogDescription>{selected?.name}의 이상 항목을 담당자에게 배정합니다.</DialogDescription></DialogHeader><div className="space-y-3"><label className="block text-sm font-semibold">조치 내용<input value={actionTitle} onChange={(e) => setActionTitle(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border px-3 font-normal outline-none" /></label><label className="block text-sm font-semibold">담당자<select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-card px-3 font-normal">{managers.slice(1).map((m) => <option key={m}>{m}</option>)}</select></label></div><DialogFooter><Button variant="outline" onClick={() => setActionOpen(false)}>취소</Button><Button onClick={createAction} className="bg-[var(--brand-navy)]">배정</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}
