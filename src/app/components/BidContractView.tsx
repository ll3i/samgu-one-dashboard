import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BriefcaseBusiness, CheckCircle2, ExternalLink, FileCheck2, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { analyzeNotice, sampleNotices } from "../lib/bidData";
import { contractCosts, readOperations, won, writeOperations, type BidNotice, type BidOpportunity, type BidStage, type Contract, type OperationsState } from "../lib/operationsStore";
import { PageHeader, ProgressBar, SectionCard, StatCard, StatusPill } from "./shared";
import { Button } from "./ui/button";

const STAGES: BidStage[] = ["발굴", "검토", "제안 준비", "입찰 제출", "낙찰", "탈락"];
type Feed = { notices: BidNotice[]; source: string; cached: boolean; fetchedAt: string };

function margin(c: Contract, actual = false) { return c.amount - contractCosts(c, actual); }
function marginRate(c: Contract, actual = false) { return Math.round(margin(c, actual) / c.amount * 1000) / 10; }
const noticeAmount = (value: number) => value > 0 ? won(value) : "공고문 참조";

export function BidContractView() {
  const [feed, setFeed] = useState<Feed>({ notices: sampleNotices, source: "예시 데이터 (불러오는 중)", cached: false, fetchedAt: new Date().toISOString() });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(sampleNotices[0].id);
  const [state, setState] = useState<OperationsState>(() => readOperations());
  const load = async (force = false) => {
    setLoading(true);
    try { const response = await fetch(`/api/g2b/notices${force ? "?refresh=1" : ""}`); if (!response.ok) throw new Error(); const data = await response.json(); setFeed(data); setSelected((id) => data.notices.some((n: BidNotice) => n.id === id) ? id : data.notices[0]?.id); if (force) toast.success("공고를 새로 불러왔습니다."); }
    catch { setFeed({ notices: sampleNotices, source: "예시 데이터 (프록시 연결 불가)", cached: false, fetchedAt: new Date().toISOString() }); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const persist = (next: OperationsState) => { setState(next); writeOperations(next); };
  const notice = feed.notices.find(n => n.id === selected) ?? feed.notices[0];
  const analysis = notice ? analyzeNotice(notice) : null;

  const approve = () => {
    if (!notice || !analysis) return;
    if (state.opportunities.some(o => o.id === notice.id)) { toast.info("이미 파이프라인에 등록된 공고입니다."); return; }
    const opportunity: BidOpportunity = { ...notice, analysis, stage: "검토", owner: "김대영", readiness: 25, documents: ["사업자등록증", "수행실적증명서", "인력운영계획서"], approvedBy: "김대영 매니저", approvedAt: new Date().toLocaleString("ko-KR") };
    persist({ ...state, opportunities: [opportunity, ...state.opportunities] }); toast.success("담당자 승인 후 입찰 파이프라인에 등록했습니다.");
  };
  const setStage = (id: string, stage: BidStage) => {
    const next = { ...state, opportunities: state.opportunities.map(o => o.id === id ? { ...o, stage, readiness: stage === "입찰 제출" ? 100 : Math.max(o.readiness, STAGES.indexOf(stage) * 23) } : o) };
    persist(next);
  };
  const convert = (o: BidOpportunity) => {
    if (state.contracts.some(c => c.opportunityId === o.id)) { toast.info("이미 계약으로 전환되었습니다."); return; }
    const c: Contract = { id: `contract-${Date.now()}`, opportunityId: o.id, client: o.agency, site: o.title.replace(" 용역", ""), amount: o.analysis.targetBid, start: "2026-08-01", end: "2027-07-31", sla: 95, headcount: Math.max(10, Math.round(o.analysis.labor / 42_000_000)), expectedLabor: o.analysis.labor, expectedOvertime: Math.round(o.analysis.labor * .06), expectedSupplies: o.analysis.supplies, expectedFacility: Math.round(o.analysis.targetBid * .025), actualLabor: 0, actualOvertime: 0, actualSupplies: 0, actualFacility: 0 };
    persist({ ...state, opportunities: state.opportunities.map(x => x.id === o.id ? { ...x, stage: "낙찰" } : x), contracts: [c, ...state.contracts] }); toast.success("낙찰 정보를 계약 및 현장 손익으로 전환했습니다.");
  };
  const updateCost = (id: string, key: keyof Contract, value: number) => persist({ ...state, contracts: state.contracts.map(c => c.id === id ? { ...c, [key]: value } : c) });
  const atRisk = state.contracts.filter(c => marginRate(c) < 8 || c.sla < 92).length;
  const pipelineValue = state.opportunities.filter(o => o.stage !== "탈락").reduce((s, o) => s + o.amount, 0);

  return <div>
    <PageHeader title="사업 수주·계약 관리" subtitle="나라장터 용역 공고 분석부터 입찰 승인, 계약 전환과 현장 손익까지 연결합니다." action={<Button onClick={() => load(true)} variant="outline" disabled={loading}><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> 새로고침</Button>} />
    <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard label="관련 신규 공고" value={feed.notices.length} unit="건" icon={BriefcaseBusiness} tone="blue" hint="최근 7일" />
      <StatCard label="진행 파이프라인" value={state.opportunities.filter(o => !["낙찰", "탈락"].includes(o.stage)).length} unit="건" icon={FileCheck2} tone="navy" hint={won(pipelineValue)} />
      <StatCard label="관리 계약" value={state.contracts.length} unit="건" icon={CheckCircle2} tone="green" />
      <StatCard label="손익·SLA 경고" value={atRisk} unit="건" icon={AlertTriangle} tone={atRisk ? "red" : "green"} hint="사전 경고" />
    </div>

    <div className="mb-5 grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <SectionCard title="나라장터 관련 용역 공고" description={`${feed.source} · ${feed.cached ? "30분 캐시" : "방금 갱신"}`} icon={BriefcaseBusiness}>
        <div className="space-y-2">{feed.notices.map(n => <button key={n.id} onClick={() => setSelected(n.id)} className={`w-full rounded-lg border p-3 text-left ${selected === n.id ? "border-[var(--brand-blue)] bg-[var(--brand-blue-soft)]" : "border-border hover:bg-muted/50"}`}>
          <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{n.title}</p><p className="mt-1 text-xs text-muted-foreground">{n.agency} · {n.region} · {n.id}</p></div><b className="shrink-0 text-sm">{noticeAmount(n.amount)}</b></div>
          <div className="mt-2 flex justify-between text-xs"><span className="text-muted-foreground">마감 {n.deadline}</span><span className="text-[var(--brand-blue)]">AI 분석 보기</span></div>
        </button>)}</div>
      </SectionCard>
      {notice && analysis && <SectionCard title="AI 공고 분석" description="추천은 담당자 승인 전까지 확정되지 않습니다." icon={Sparkles} action={<StatusPill tone={analysis.fit >= 85 ? "green" : "amber"}>{analysis.recommendation}</StatusPill>}>
        <div className="flex items-center justify-between rounded-lg bg-muted/60 p-4"><div><p className="text-xs text-muted-foreground">회사 적합도</p><p className="text-3xl font-bold">{analysis.fit}<small className="text-sm text-muted-foreground"> / 100</small></p></div><div className="text-right text-xs text-muted-foreground">AI 신뢰도 <b className="text-foreground">{analysis.confidence}%</b><p className="mt-1 max-w-[260px]">{analysis.rationale}</p></div></div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">{[["목표 투찰가", notice.amount > 0 ? won(analysis.targetBid) : "공고문 참조"], ["예상 인건비", notice.amount > 0 ? won(analysis.labor) : "금액 확인 필요"], ["관리·소모품", notice.amount > 0 ? won(analysis.overhead + analysis.supplies) : "금액 확인 필요"], ["예상 마진", notice.amount > 0 ? won(analysis.margin) : "산출 대기"]].map(([k,v]) => <div key={k} className="rounded-lg border border-border p-3"><p className="text-muted-foreground">{k}</p><b className="mt-1 block text-sm">{v}</b></div>)}</div>
        <div className="mt-4 text-xs"><b>필수 요건·서류</b><p className="mt-1 text-muted-foreground">{analysis.requirements.join(" · ")}</p><b className="mt-3 block text-[var(--danger)]">탈락 위험</b><p className="mt-1 text-muted-foreground">{analysis.risks.join(" · ")}</p></div>
        <div className="mt-4 flex gap-2"><Button onClick={approve} className="flex-1 bg-[var(--brand-navy)]">참여 승인 및 등록</Button><Button variant="outline" asChild><a href={notice.url} target="_blank" rel="noopener noreferrer">{notice.url.includes("/single/") ? "나라장터 원문" : "나라장터"} <ExternalLink className="size-3.5" /></a></Button></div>
      </SectionCard>}
    </div>

    <SectionCard title="수주 파이프라인" description="발굴 → 검토 → 제안 준비 → 입찰 제출 → 낙찰·탈락" icon={TrendingUp} className="mb-5">
      {state.opportunities.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">공고 분석에서 참여 승인하면 파이프라인이 시작됩니다.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="pb-3">공고</th><th>단계</th><th>담당자</th><th>필수 서류 준비율</th><th>승인 이력</th><th>처리</th></tr></thead><tbody>{state.opportunities.map(o => <tr key={o.id} className="border-b last:border-0"><td className="py-3"><b>{o.title}</b><p className="text-xs text-muted-foreground">마감 {o.deadline}</p></td><td><select value={o.stage} onChange={e => setStage(o.id, e.target.value as BidStage)} className="rounded-md border bg-card px-2 py-1">{STAGES.map(s => <option key={s}>{s}</option>)}</select></td><td>{o.owner}</td><td className="w-40"><div className="mb-1 flex justify-between text-xs"><span>{o.documents.length}종</span><b>{o.readiness}%</b></div><ProgressBar value={o.readiness} tone={o.readiness === 100 ? "green" : "blue"} /></td><td className="text-xs">{o.approvedBy}<p className="text-muted-foreground">{o.approvedAt}</p></td><td><Button size="sm" disabled={!["입찰 제출", "낙찰"].includes(o.stage)} onClick={() => convert(o)}>낙찰·계약 전환</Button></td></tr>)}</tbody></table></div>}
    </SectionCard>

    <SectionCard title="계약·현장 손익" description="원가를 수정하면 예상 마진과 적자 위험이 즉시 재계산됩니다." icon={TrendingUp}>
      <div className="space-y-4">{state.contracts.map(c => { const rate = marginRate(c); return <div key={c.id} className={`rounded-lg border p-4 ${rate < 8 ? "border-[var(--danger)]" : "border-border"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><b>{c.site}</b><p className="text-xs text-muted-foreground">{c.client} · {c.start} ~ {c.end} · {c.headcount}명 · SLA {c.sla}%</p></div><StatusPill tone={rate < 0 ? "red" : rate < 8 ? "amber" : "green"}>{rate < 0 ? "적자 전환" : rate < 8 ? "마진 주의" : "수익 안정"} {rate}%</StatusPill></div>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-6"><div><p className="text-[11px] text-muted-foreground">계약 매출</p><b>{won(c.amount)}</b></div>{([['expectedLabor','급여'],['expectedOvertime','초과근무'],['expectedSupplies','소모품'],['expectedFacility','시설비']] as [keyof Contract,string][]).map(([key,label]) => <label key={key} className="text-[11px] text-muted-foreground">{label}<input type="number" value={Number(c[key]) / 10000} onChange={e => updateCost(c.id, key, Number(e.target.value) * 10000)} className="mt-1 h-8 w-full rounded border px-2 text-xs text-foreground" /><span>만원</span></label>)}<div><p className="text-[11px] text-muted-foreground">예상 마진</p><b className={margin(c) < 0 ? "text-[var(--danger)]" : "text-[var(--success)]"}>{won(margin(c))}</b><p className="text-[11px] text-muted-foreground">실제 집행 {won(contractCosts(c, true))}</p></div></div>
      </div>})}</div>
    </SectionCard>
  </div>;
}
