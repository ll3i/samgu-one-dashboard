import {
  MapPin,
  ClipboardList,
  ShieldCheck,
  FileWarning,
  Camera,
  HeartPulse,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  CircleAlert,
  FileBarChart,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useState } from "react";
import { SectionCard, StatusPill, PageHeader } from "./shared";
import { AiDiagnosis } from "./AiDiagnosis";
import type { ViewKey } from "./Sidebar";
import { ReportPreviewDialog } from "./ReportPreviewDialog";

const trend = [
  { day: "월", 출근율: 95.4, 설문: 84 },
  { day: "화", 출근율: 96.1, 설문: 86 },
  { day: "수", 출근율: 96.2, 설문: 88.5 },
  { day: "목", 출근율: 95.8, 설문: 87 },
  { day: "금", 출근율: 94.9, 설문: 90 },
  { day: "토", 출근율: 92.3, 설문: 79 },
  { day: "일", 출근율: 90.1, 설문: 71 },
];

const flow = [
  { role: "현장 직원", icon: MapPin, tone: "blue" as const, desc: "GPS 출퇴근 태깅 · 1분 건강·노무 설문" },
  { role: "현장 소장", icon: Camera, tone: "amber" as const, desc: "현장 사진 촬영 → AI 안전·미화 점검" },
  { role: "운영 매니저", icon: LayoutDashboard, tone: "navy" as const, desc: "실시간 대시보드 · AI 일일 운영 보고서" },
];

const alerts = [
  { id: "a1", tone: "red" as const, title: "미보고 현장 14곳 — 18시 마감 임박", time: "방금", module: "현장 점검", view: "site" as ViewKey },
  { id: "a2", tone: "amber" as const, title: "근골격계 통증 응답 집중 — 판교 물류센터", time: "오늘 집계", module: "건강·노무", view: "labor" as ViewKey },
  { id: "a3", tone: "red" as const, title: "안전등급 C — 강서 사업장 소화기 적치 불량", time: "09:12", module: "현장 점검", view: "site" as ViewKey },
  { id: "a4", tone: "amber" as const, title: "GPS 태깅 누락 6명 — 출근 미인증", time: "08:40", module: "근태", view: "attendance" as ViewKey },
];

export function DashboardView({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  const [reportOpen, setReportOpen] = useState(false);
  return (
    <div>
      <PageHeader
        title="통합 운영 대시보드"
        subtitle="55,000명 직원 · 3,000개 현장의 근태·건강·안전 데이터를 한 화면에서"
        action={
          <div className="text-right">
            <p className="text-muted-foreground" style={{ fontSize: "0.8125rem" }}>
              2026년 6월 17일 (수)
            </p>
            <p style={{ fontSize: "0.9375rem", fontWeight: 600 }}>실시간 자동 집계 중</p>
          </div>
        }
      />

      {/* 데이터가 위로 흐르는 구조 */}
      <div className="bg-card rounded-[var(--radius)] border border-border shadow-sm p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="size-4 text-[var(--brand-blue)]" />
          <h3 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>현장 데이터가 운영팀까지 자동으로 연결됩니다</h3>
        </div>
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          {flow.map((f, i) => {
            const Icon = f.icon;
            const color = f.tone === "blue" ? "var(--brand-blue)" : f.tone === "amber" ? "var(--warning)" : "var(--brand-navy)";
            const soft = f.tone === "blue" ? "var(--brand-blue-soft)" : f.tone === "amber" ? "var(--warning-soft)" : "#eef2fb";
            return (
              <div key={f.role} className="flex items-center gap-3 flex-1">
                <div className="flex-1 rounded-lg border border-border px-4 py-3.5 flex items-center gap-3">
                  <span className="size-10 rounded-lg grid place-items-center shrink-0" style={{ background: soft }}>
                    <Icon className="size-5" style={{ color }} />
                  </span>
                  <div className="min-w-0">
                    <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>{f.role}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{f.desc}</p>
                  </div>
                </div>
                {i < flow.length - 1 && (
                  <ArrowRight className="size-5 text-muted-foreground shrink-0 rotate-90 md:rotate-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 운영 매니저 KPI — 실제 관제 시스템처럼 한 패널 안에 조밀하게 구성 */}
      <section className="mb-6 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div><p className="text-sm font-semibold">오늘의 운영 현황</p><p className="mt-0.5 text-[11px] text-muted-foreground">06월 17일 16:40 기준 · 5분 단위 자동 갱신</p></div>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--success)]"><span className="size-1.5 rounded-full bg-[var(--success)]" />데이터 정상</span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-border md:grid-cols-4 md:divide-y-0">
          {[
            { label: "현장 출근율", value: "96.2", unit: "%", note: "GPS 태깅 기준", icon: MapPin, status: "정상", color: "var(--success)" },
            { label: "건강·노무 설문", value: "88.5", unit: "%", note: "응답 48,675명", icon: ClipboardList, status: "목표 85%", color: "var(--brand-blue)" },
            { label: "평균 안전등급", value: "B+", unit: "", note: "사진 점검 1,486건", icon: ShieldCheck, status: "전일 동일", color: "var(--warning)" },
            { label: "미보고 현장", value: "14", unit: "곳", note: "18시 제출 마감", icon: FileWarning, status: "확인 필요", color: "var(--danger)" },
          ].map((item) => { const Icon = item.icon; return <div key={item.label} className="relative min-h-[142px] px-5 py-4">
            <div className="flex items-center justify-between"><span className="text-xs font-medium text-muted-foreground">{item.label}</span><Icon className="size-4 text-muted-foreground/70" /></div>
            <div className="mt-4 flex items-baseline gap-1"><strong className="text-[2rem] leading-none tracking-tight">{item.value}</strong>{item.unit && <span className="text-sm font-medium text-muted-foreground">{item.unit}</span>}</div>
            <div className="absolute inset-x-5 bottom-4 flex items-center justify-between border-t border-border/70 pt-2.5 text-[11px]"><span className="text-muted-foreground">{item.note}</span><span className="font-semibold" style={{ color: item.color }}>{item.status}</span></div>
          </div>; })}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <SectionCard
          title="주간 운영 추이"
          description="현장 출근율 · 건강·노무 설문 응답률"
          className="xl:col-span-2"
          icon={MapPin}
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-blue)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--brand-blue)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f7" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6b7689" }} />
                <YAxis domain={[60, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6b7689" }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e3e8f2", fontSize: 13 }} />
                <Area type="monotone" dataKey="출근율" stroke="var(--brand-blue)" strokeWidth={2.5} fill="url(#g1)" />
                <Area type="monotone" dataKey="설문" stroke="var(--success)" strokeWidth={2.5} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* AI 일일 운영 보고서 */}
        <SectionCard
          title="AI 일일 운영 보고서"
          description="출퇴근·설문·점검 데이터 종합 자동 작성"
          icon={FileBarChart}
          action={<StatusPill tone="green">자동생성</StatusPill>}
        >
          <p className="text-muted-foreground mb-3" style={{ fontSize: "0.8125rem", lineHeight: 1.6 }}>
            오늘 3,000개 현장 중 <b className="text-foreground">96.2%</b>가 정상 출근했으며, 건강·노무 설문 응답률은 <b className="text-foreground">88.5%</b>입니다. 평균 안전등급은 <b className="text-foreground">B+</b>로 전일 대비 안정적입니다.
          </p>
          <div className="rounded-lg bg-[var(--warning-soft)] px-4 py-3 mb-3">
            <p className="flex items-center gap-1.5 mb-1 text-[var(--warning)]" style={{ fontSize: "0.75rem", fontWeight: 700 }}>
              <HeartPulse className="size-3.5" /> AI 개선 권고
            </p>
            <p style={{ fontSize: "0.8125rem", lineHeight: 1.5 }}>
              <b>판교 물류센터</b>에서 근골격계 통증 응답이 집중되어 작업환경 개선(중량물 분담·휴게 주기 조정)을 권고합니다.
            </p>
          </div>
          <button
            onClick={() => setReportOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy)]/90 transition-colors"
            style={{ fontSize: "0.875rem", fontWeight: 600 }}
          >
            <FileBarChart className="size-4" /> 전체 보고서 보기
          </button>
        </SectionCard>
      </div>

      <AiDiagnosis />

      <SectionCard
        title="실시간 알림 센터"
        description="역할·모듈별 이상감지 — 클릭하면 해당 업무로 이동"
        icon={CircleAlert}
      >
        <ul className="divide-y divide-border -my-2">
          {alerts.map((a) => (
            <li key={a.id}>
              <button onClick={() => onNavigate(a.view)} className="w-full flex items-center gap-4 py-3.5 text-left group">
                <CircleAlert
                  className="size-5 shrink-0"
                  style={{ color: a.tone === "red" ? "var(--danger)" : "var(--warning)" }}
                />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "0.9375rem", fontWeight: 500 }} className="truncate">
                    {a.title}
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: "0.8125rem" }}>
                    {a.module} · {a.time}
                  </p>
                </div>
                <StatusPill tone={a.tone}>{a.tone === "red" ? "긴급" : "주의"}</StatusPill>
                <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </button>
            </li>
          ))}
        </ul>
      </SectionCard>
      <ReportPreviewDialog type="daily" open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  );
}
