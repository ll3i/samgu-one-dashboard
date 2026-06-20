import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, Bot, Boxes, BrainCircuit, Building2,
  Check, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, Database,
  FileCheck2, LockKeyhole, Network, Play, Settings2,
  ShieldCheck, Sparkles, Store, Truck, UserCog, X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SectionCard, StatCard, StatusPill, ProgressBar } from "./shared";
import { Button } from "./ui/button";
import { sites } from "../lib/siteData";
import {
  connectorStatus, insightsFor, solutionPackages,
  type AIRole, type AISolutionModule, type InsightSeverity, type ModuleStatus,
} from "../lib/aiSolutionData";
import { analysisKindFor } from "../lib/aiAnalysisData";
import { AiAnalysisWorkspace } from "./AiAnalysisWorkspace";

type WorkOrder = {
  id: number;
  siteId: string;
  title: string;
  owner: string;
  status: "승인대기" | "진행" | "완료" | "반려";
  createdBy: string;
};

const roleMeta: Record<AIRole, { label: string; description: string }> = {
  "site-manager": { label: "현장소장", description: "오늘 실행할 업무와 현장 조치" },
  "ops-manager": { label: "운영매니저", description: "위험 비교·승인·자원 재배치" },
  client: { label: "고객사", description: "SLA·품질·개선 성과 확인" },
};

const industryIcon = { 오피스: Building2, 물류: Truck, 생산: Settings2, 리테일: Store, 공공: ShieldCheck };
const severityTone: Record<InsightSeverity, "red" | "amber" | "green"> = { critical: "red", warning: "amber", info: "green" };
const statusLabel: Record<ModuleStatus, { text: string; tone: "green" | "amber" | "slate" }> = {
  active: { text: "사용 중", tone: "green" }, review: { text: "도입 검토", tone: "amber" }, inactive: { text: "미도입", tone: "slate" },
};

function ModuleCard({ module, status, onChange, onAnalyze }: { module: (typeof solutionPackages)[number]["modules"][number]; status: ModuleStatus; onChange: () => void; onAnalyze?: () => void }) {
  const label = statusLabel[status];
  return (
    <div className={`rounded-lg border p-3.5 ${status === "active" ? "border-[var(--success)]/30 bg-[var(--success-soft)]/35" : "border-border"}`}>
      <div className="flex items-start gap-3">
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${status === "active" ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-muted text-muted-foreground"}`}><BrainCircuit className="size-4.5" /></span>
        <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="font-semibold">{module.name}</p><button onClick={onChange}><StatusPill tone={label.tone}>{label.text}</StatusPill></button></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{module.description}</p></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px]"><span className="rounded bg-muted px-2 py-1">데이터: {module.input}</span><span className="rounded bg-[var(--brand-blue-soft)] px-2 py-1 text-[var(--brand-blue)]">효과: {module.impact}</span></div>
      <div className="mt-3 border-t border-border/70 pt-3">{onAnalyze ? <Button size="sm" variant="outline" onClick={onAnalyze} className="w-full border-[var(--brand-blue)]/40 text-[var(--brand-blue)]"><Play className="size-3.5" />AI 분석 체험</Button> : <div className="rounded-md bg-muted px-2 py-1.5 text-center text-[11px] text-muted-foreground">분석 체험 준비 중</div>}</div>
    </div>
  );
}

export function AiSolutionCenter() {
  const [role, setRole] = useState<AIRole>("ops-manager");
  const [selectedId, setSelectedId] = useState(sites[0].id);
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleStatus>>(() => Object.fromEntries(solutionPackages.flatMap((p) => p.modules.map((m) => [m.id, m.status]))));
  const [orders, setOrders] = useState<WorkOrder[]>([
    { id: 1, siteId: "site-5", title: "안전 위험 재점검", owner: "박정수 소장", status: "진행", createdBy: "AI 추천" },
    { id: 2, siteId: "site-8", title: "결원 대체인력 배정", owner: "김대영 매니저", status: "승인대기", createdBy: "이현아 소장" },
  ]);
  const [audit, setAudit] = useState(["11:02 · 김대영 매니저 · 안전 위험 조치 승인", "10:48 · AI · 물류센터 결원 위험 감지", "09:30 · 박정수 소장 · 현장 점검 완료"]);
  const [analysisModule, setAnalysisModule] = useState<AISolutionModule | null>(null);

  const selected = sites.find((site) => site.id === selectedId) ?? sites[0];
  const solution = solutionPackages.find((item) => item.industry === selected.industry) ?? solutionPackages[0];
  const insights = useMemo(() => insightsFor(selected), [selected]);
  const activeCount = Object.values(moduleStates).filter((status) => status === "active").length;
  const totalModules = solutionPackages.reduce((sum, item) => sum + item.modules.length, 0);
  const roleName = roleMeta[role].label;

  const cycleModule = (id: string) => setModuleStates((current) => {
    const next: Record<ModuleStatus, ModuleStatus> = { inactive: "review", review: "active", active: "inactive" };
    const status = next[current[id]];
    toast.success(`AI 모듈 상태를 '${statusLabel[status].text}'으로 변경했습니다.`);
    return { ...current, [id]: status };
  });

  const createOrder = (title: string) => {
    const order: WorkOrder = { id: Date.now(), siteId: selected.id, title, owner: `${selected.manager} 매니저`, status: "승인대기", createdBy: `${roleName}·AI` };
    setOrders((current) => [order, ...current]);
    setAudit((current) => [`방금 · ${roleName} · '${title}' 승인 요청`, ...current]);
    toast.success("AI 추천을 조치 요청으로 전환했습니다.");
  };

  const decideOrder = (id: number, decision: "진행" | "반려") => {
    const target = orders.find((order) => order.id === id);
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status: decision } : order));
    setAudit((current) => [`방금 · ${roleName} · '${target?.title}' ${decision === "진행" ? "승인" : "반려"}`, ...current]);
    toast.success(decision === "진행" ? "조치를 승인했습니다." : "조치를 반려했습니다.");
  };

  const openAnalysis = (module: AISolutionModule) => {
    setAnalysisModule(module);
    window.setTimeout(() => document.getElementById("ai-analysis-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  return (
    <div>
      <PageHeader
        title="AI 솔루션 센터"
        subtitle="현장 유형과 역할에 맞는 AI 패키지를 배정하고 도입 효과와 조치 과정을 관리합니다"
        action={<span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-blue-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-blue)]"><Sparkles className="size-3.5" /> Human-in-the-loop AI</span>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="AI 적용 현장" value={sites.length} unit="곳" icon={BrainCircuit} tone="navy" hint="5개 현장 유형" />
        <StatCard label="활성 AI 모듈" value={activeCount} unit={`/${totalModules}`} icon={Boxes} tone="green" hint="유형별 패키지" />
        <StatCard label="월 예상 절감" value="1,240" unit="시간" icon={Clock3} tone="blue" hint="보고·배치·분석" />
        <StatCard label="예상 ROI" value="218" unit="%" icon={CircleDollarSign} tone="amber" hint="연간 추정" />
      </div>

      <div className="mb-5 rounded-[var(--radius)] border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-xs font-semibold text-muted-foreground">사용자 화면</span>
          {(Object.keys(roleMeta) as AIRole[]).map((key) => <button key={key} onClick={() => setRole(key)} className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${role === key ? "bg-[var(--brand-navy)] text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{roleMeta[key].label}</button>)}
          <span className="ml-auto text-xs text-muted-foreground">{roleMeta[role].description}</span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
        <SectionCard title="현장 선택" description="유형별 AI 패키지" icon={Building2}>
          <div className="max-h-[610px] space-y-2 overflow-y-auto pr-1">
            {sites.map((site) => { const Icon = industryIcon[site.industry as keyof typeof industryIcon] ?? Building2; return (
              <button key={site.id} onClick={() => { setSelectedId(site.id); setAnalysisModule(null); }} className={`w-full rounded-lg border p-3 text-left ${site.id === selected.id ? "border-[var(--brand-blue)] bg-[var(--brand-blue-soft)]" : "border-border hover:bg-muted/50"}`}>
                <div className="flex items-center gap-2"><Icon className="size-4 text-[var(--brand-blue)]" /><span className="min-w-0 flex-1 truncate text-sm font-semibold">{site.name}</span><ChevronRight className="size-3.5 text-muted-foreground" /></div>
                <p className="mt-1 text-[11px] text-muted-foreground">{site.industry} · {site.client}</p>
              </button>
            ); })}
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title={solution.title} description={`${selected.name} · ${solution.summary}`} icon={Bot} action={<StatusPill tone="blue">{selected.industry} 패키지</StatusPill>}>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["담당", selected.manager], ["인원", `${selected.headcount}명`], ["SLA", `${selected.sla}%`], ["연결 데이터", "6개 시스템"]].map(([label, value]) => <div key={label} className="rounded-lg bg-muted/60 p-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>)}
            </div>
            <div className="grid gap-3 lg:grid-cols-2">{solution.modules.map((module) => <ModuleCard key={module.id} module={module} status={moduleStates[module.id]} onChange={() => cycleModule(module.id)} onAnalyze={analysisKindFor(module.id) ? () => openAnalysis(module) : undefined} />)}</div>
          </SectionCard>

          {analysisModule && <AiAnalysisWorkspace module={analysisModule} site={selected} onCreateOrder={createOrder} onClose={() => setAnalysisModule(null)} />}

          {role === "site-manager" && (
            <SectionCard title="오늘의 AI 업무" description="소장 실행 화면" icon={UserCog}>
              <div className="grid gap-3 md:grid-cols-3">{[
                ["09:00", "출근 예외 3명 확인", "근태 AI"], ["14:00", "안전 위험 재촬영", "점검 AI"], ["17:30", "일일보고서 검토", "보고 AI"],
              ].map(([time, title, source]) => <div key={title} className="rounded-lg border border-border p-3"><p className="text-xs font-semibold text-[var(--brand-blue)]">{time} · {source}</p><p className="mt-2 text-sm font-semibold">{title}</p><Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => createOrder(title)}><Play className="size-3.5" /> 업무 시작</Button></div>)}</div>
            </SectionCard>
          )}

          {role === "ops-manager" && (
            <SectionCard title="AI 인사이트·조치 추천" description="근거 확인 후 담당자에게 배정" icon={Activity}>
              <div className="space-y-3">{insights.map((insight) => <div key={insight.id} className="rounded-lg border border-border p-4"><div className="flex flex-wrap items-start gap-3"><span className={`grid size-9 place-items-center rounded-lg ${insight.severity === "critical" ? "bg-[var(--danger-soft)] text-[var(--danger)]" : insight.severity === "warning" ? "bg-[var(--warning-soft)] text-[var(--warning)]" : "bg-[var(--success-soft)] text-[var(--success)]"}`}><AlertTriangle className="size-4.5" /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="font-semibold">{insight.title}</p><StatusPill tone={severityTone[insight.severity]}>신뢰도 {insight.confidence}%</StatusPill></div><p className="mt-1 text-sm text-muted-foreground">{insight.summary}</p><div className="mt-2 flex flex-wrap gap-1.5">{insight.evidence.map((item) => <span key={item} className="rounded bg-muted px-2 py-1 text-[11px]">{item}</span>)}</div><p className="mt-3 text-sm"><b>AI 권고:</b> {insight.action}</p></div><Button size="sm" onClick={() => createOrder(insight.action)} className="bg-[var(--brand-navy)]">조치 생성 <ArrowRight className="size-3.5" /></Button></div></div>)}</div>
            </SectionCard>
          )}

          {role === "client" && (
            <SectionCard title="고객사 AI 성과 리포트" description="개인정보를 제외한 SLA·품질·개선 성과" icon={FileCheck2} action={<span className="flex items-center gap-1 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" /> 개인정보 비공개</span>}>
              <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">계약 SLA</p><p className="mt-1 text-2xl font-bold">{selected.sla}%</p><ProgressBar value={selected.sla} tone={selected.sla >= 90 ? "green" : "red"} /></div><div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">AI 조치 완료율</p><p className="mt-1 text-2xl font-bold">92%</p><ProgressBar value={92} tone="green" /></div><div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">품질 개선</p><p className="mt-1 text-2xl font-bold">+18%</p><p className="mt-2 text-xs text-[var(--success)]">전월 대비</p></div></div>
              <div className="mt-4 rounded-lg bg-[var(--brand-blue-soft)] p-4 text-sm leading-6"><Sparkles className="mr-2 inline size-4 text-[var(--brand-blue)]" />이번 달 {selected.name}은 주요 SLA를 충족했으며 AI 조치 평균 완료시간이 1.8시간 단축됐습니다.</div>
            </SectionCard>
          )}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="업무시스템 연동" description="통합 데이터 상태와 AI 분석 범위" icon={Network}>
          <div className="grid gap-2 sm:grid-cols-2">{connectorStatus.map((connector) => <div key={connector.name} className="flex items-center gap-3 rounded-lg border border-border p-3"><span className="grid size-9 place-items-center rounded-lg bg-muted"><Database className="size-4 text-muted-foreground" /></span><div className="min-w-0 flex-1"><div className="flex justify-between"><p className="text-sm font-semibold">{connector.name}</p><StatusPill tone={connector.status === "정상" ? "green" : connector.status === "지연" ? "amber" : "slate"}>{connector.status}</StatusPill></div><p className="mt-1 text-[11px] text-muted-foreground">{connector.synced} · 데이터 {connector.coverage}%</p></div></div>)}</div>
        </SectionCard>

        <SectionCard title="승인·감사 로그" description="AI 추천은 사람의 승인 후 실행" icon={ShieldCheck}>
          <div className="space-y-2">{audit.slice(0, 5).map((item, index) => <div key={`${item}-${index}`} className="flex gap-3 rounded-lg bg-muted/50 px-3 py-2.5 text-xs"><span className="mt-1 size-2 shrink-0 rounded-full bg-[var(--brand-blue)]" />{item}</div>)}</div>
        </SectionCard>
      </div>

      <SectionCard title="AI 조치 승인함" description="추천·요청을 검토하고 실행 상태를 추적" icon={CheckCircle2}>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs text-muted-foreground"><th className="pb-3">현장</th><th className="pb-3">조치</th><th className="pb-3">담당</th><th className="pb-3">생성</th><th className="pb-3">상태·승인</th></tr></thead><tbody>{orders.map((order) => { const site = sites.find((item) => item.id === order.siteId); return <tr key={order.id} className="border-b border-border last:border-0"><td className="py-3 font-semibold">{site?.name}</td><td className="py-3">{order.title}</td><td className="py-3">{order.owner}</td><td className="py-3 text-muted-foreground">{order.createdBy}</td><td className="py-3">{order.status === "승인대기" && role === "ops-manager" ? <div className="flex gap-1.5"><Button size="sm" onClick={() => decideOrder(order.id, "진행")}><Check className="size-3.5" /> 승인</Button><Button size="sm" variant="outline" onClick={() => decideOrder(order.id, "반려")}><X className="size-3.5" /> 반려</Button></div> : <StatusPill tone={order.status === "완료" ? "green" : order.status === "반려" ? "red" : "amber"}>{order.status}</StatusPill>}</td></tr>; })}</tbody></table></div>
      </SectionCard>
    </div>
  );
}
