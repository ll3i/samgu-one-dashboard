import { useState } from "react";
import { AlertTriangle, ClipboardCheck, PackagePlus, ShieldCheck, Wrench } from "lucide-react";
import { toast } from "sonner";
import { readOperations, won, writeOperations, type Asset, type MaintenanceOrder, type OperationsState } from "../lib/operationsStore";
import { PageHeader, SectionCard, StatCard, StatusPill } from "./shared";
import { Button } from "./ui/button";

export function AssetManagementView() {
  const [state, setState] = useState<OperationsState>(() => readOperations());
  const [assetForm, setAssetForm] = useState(false);
  const [orderAsset, setOrderAsset] = useState<string | null>(null);
  const [name, setName] = useState(""); const [site, setSite] = useState("김포 스마트물류센터"); const [type, setType] = useState("시설장비");
  const [symptom, setSymptom] = useState(""); const [cost, setCost] = useState(0);
  const persist = (next: OperationsState) => { setState(next); writeOperations(next); };
  const addAsset = () => {
    if (!name.trim()) return toast.error("자산명을 입력하세요.");
    const asset: Asset = { id: `asset-${Date.now()}`, site, name: name.trim(), type, location: "위치 미지정", owner: "김대영", status: "정상", inspectionCycle: 30, lastInspection: new Date().toISOString().slice(0,10), warrantyEnd: "2027-06-30", risk: 15, replacement: "점검 데이터 축적 후 추천" };
    persist({ ...state, assets: [asset, ...state.assets] }); setName(""); setAssetForm(false); toast.success("자산대장에 등록했습니다.");
  };
  const inspect = (id: string) => {
    persist({ ...state, assets: state.assets.map(a => a.id === id ? { ...a, lastInspection: new Date().toISOString().slice(0,10), risk: Math.max(8, a.risk - 18), status: a.status === "점검 필요" ? "정상" : a.status } : a) });
    toast.success("정기점검 결과와 사진 분석 결과를 저장했습니다.");
  };
  const createOrder = () => {
    const asset = state.assets.find(a => a.id === orderAsset); if (!asset || !symptom.trim()) return toast.error("고장 증상을 입력하세요.");
    const order: MaintenanceOrder = { id: `order-${Date.now()}`, assetId: asset.id, symptom: symptom.trim(), risk: asset.risk >= 75 ? "높음" : "보통", owner: asset.owner, due: "2026-06-24", cost: cost * 10000, status: "대기", createdAt: new Date().toISOString().slice(0,10) };
    persist({ ...state, assets: state.assets.map(a => a.id === asset.id ? { ...a, status: "고장", risk: Math.max(a.risk, 72) } : a), orders: [order, ...state.orders] }); setOrderAsset(null); setSymptom(""); setCost(0); toast.success("고장 작업지시를 생성했습니다.");
  };
  const advance = (order: MaintenanceOrder) => {
    if (order.status === "대기") { persist({ ...state, orders: state.orders.map(o => o.id === order.id ? { ...o, status: "진행" } : o) }); return; }
    if (order.status === "진행") {
      const asset = state.assets.find(a => a.id === order.assetId);
      const contracts = state.contracts.map(c => asset && c.site === asset.site ? { ...c, actualFacility: c.actualFacility + order.cost } : c);
      persist({ ...state, contracts, assets: state.assets.map(a => a.id === order.assetId ? { ...a, status: "정상", risk: 22, lastInspection: new Date().toISOString().slice(0,10) } : a), orders: state.orders.map(o => o.id === order.id ? { ...o, status: "완료" } : o) });
      toast.success(`${won(order.cost)}을 해당 현장 계약의 실제 시설비에 반영했습니다.`);
    }
  };
  const dangerSites = new Set(state.assets.filter(a => a.risk >= 70 || a.status === "고장").map(a => a.site));
  const openOrders = state.orders.filter(o => o.status !== "완료");
  const warrantyAlerts = state.assets.filter(a => a.warrantyEnd <= "2026-09-20");

  return <div>
    <PageHeader title="시설·자산 관리" subtitle="현장 자산대장, 정기점검, 고장 작업지시와 계약 비용을 하나의 흐름으로 관리합니다." action={<Button onClick={() => setAssetForm(v => !v)} className="bg-[var(--brand-navy)]"><PackagePlus className="size-4" /> 자산 등록</Button>} />
    <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard label="등록 자산" value={state.assets.length} unit="대" icon={PackagePlus} tone="blue" />
      <StatCard label="위험 자산" value={state.assets.filter(a => a.risk >= 70).length} unit="대" icon={AlertTriangle} tone="red" hint={`${dangerSites.size}개 현장`} />
      <StatCard label="미처리 작업" value={openOrders.length} unit="건" icon={Wrench} tone="amber" />
      <StatCard label="보증 만료 예정" value={warrantyAlerts.length} unit="대" icon={ShieldCheck} tone="navy" hint="90일 이내" />
    </div>

    {assetForm && <SectionCard title="신규 자산 등록" description="설치 위치·담당자·점검주기는 등록 후 자산대장에서 관리합니다." icon={PackagePlus} className="mb-5"><div className="grid gap-3 md:grid-cols-4"><input value={name} onChange={e => setName(e.target.value)} placeholder="자산명" className="h-10 rounded-lg border px-3 text-sm" /><select value={site} onChange={e => setSite(e.target.value)} className="h-10 rounded-lg border bg-card px-3 text-sm"><option>김포 스마트물류센터</option><option>강서 사업장</option><option>용인 반도체사업장</option></select><select value={type} onChange={e => setType(e.target.value)} className="h-10 rounded-lg border bg-card px-3 text-sm"><option>시설장비</option><option>승강설비</option><option>공조설비</option><option>미화장비</option><option>소모품</option></select><Button onClick={addAsset}>등록 완료</Button></div></SectionCard>}

    <SectionCard title="현장 자산대장" description="AI 위험도는 점검 사진·고장 이력·보증기간을 종합한 참고 지표입니다." icon={ClipboardCheck} className="mb-5">
      <div className="overflow-x-auto"><table className="w-full min-w-[950px] text-sm"><thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="pb-3">자산 / 현장</th><th>유형·위치</th><th>담당자</th><th>점검</th><th>보증기간</th><th>AI 위험·교체 추천</th><th>처리</th></tr></thead><tbody>{state.assets.map(a => <tr key={a.id} className="border-b last:border-0"><td className="py-3"><b>{a.name}</b><p className="text-xs text-muted-foreground">{a.site}</p></td><td>{a.type}<p className="text-xs text-muted-foreground">{a.location}</p></td><td>{a.owner}</td><td>{a.inspectionCycle}일 주기<p className="text-xs text-muted-foreground">최근 {a.lastInspection}</p></td><td>{a.warrantyEnd}</td><td className="max-w-[240px]"><StatusPill tone={a.risk >= 70 ? "red" : a.risk >= 40 ? "amber" : "green"}>위험 {a.risk}% · {a.status}</StatusPill><p className="mt-1 text-xs text-muted-foreground">{a.replacement}</p><p className="text-[11px] text-muted-foreground">신뢰도 {Math.min(94, 72 + Math.round(a.risk / 5))}%</p></td><td><div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => inspect(a.id)}>점검</Button><Button size="sm" onClick={() => { setOrderAsset(a.id); setSymptom(""); }}>작업지시</Button></div></td></tr>)}</tbody></table></div>
    </SectionCard>

    {orderAsset && <SectionCard title="고장·수리 작업지시" description={`${state.assets.find(a => a.id === orderAsset)?.name} · 최종 등록은 담당자가 승인합니다.`} icon={Wrench} className="mb-5"><div className="grid gap-3 md:grid-cols-[1fr_180px_120px]"><input value={symptom} onChange={e => setSymptom(e.target.value)} placeholder="고장 증상과 점검 결과" className="h-10 rounded-lg border px-3 text-sm" /><label className="flex items-center gap-2 rounded-lg border px-3 text-xs">예상 비용<input type="number" value={cost} onChange={e => setCost(Number(e.target.value))} className="w-full outline-none" />만원</label><Button onClick={createOrder}>승인·발행</Button></div></SectionCard>}

    <SectionCard title="유지보수 작업 및 비용" description="작업 완료 시 비용이 동일 현장의 계약 실제 시설비에 자동 반영됩니다." icon={Wrench}>
      <div className="space-y-2">{state.orders.map(o => { const a = state.assets.find(x => x.id === o.assetId); return <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3"><div className="min-w-[250px] flex-1"><b className="text-sm">{a?.name}</b><p className="text-xs text-muted-foreground">{o.symptom} · 담당 {o.owner} · 기한 {o.due}</p></div><StatusPill tone={o.risk === "높음" ? "red" : "amber"}>{o.risk} 위험</StatusPill><b className="text-sm">{won(o.cost)}</b><button disabled={o.status === "완료"} onClick={() => advance(o)} className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold disabled:text-[var(--success)]">{o.status}{o.status !== "완료" && " →"}</button></div>})}</div>
    </SectionCard>
  </div>;
}
