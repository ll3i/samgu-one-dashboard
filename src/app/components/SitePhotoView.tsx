import { useState } from "react";
import {
  Camera,
  ShieldCheck,
  Flame,
  Footprints,
  ScanLine,
  FileBarChart,
  Bell,
  Download,
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { StatCard, SectionCard, StatusPill, PageHeader } from "./shared";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ReportPreviewDialog, type ReportType } from "./ReportPreviewDialog";

const IMG = {
  restroomClean: "https://images.unsplash.com/photo-1597098540640-0cf6008159a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  urinals: "https://images.unsplash.com/photo-1727464996704-315f2686457a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  wetFloor: "https://images.unsplash.com/photo-1579474670841-89ed79898c81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  lobby: "https://images.unsplash.com/photo-1749310726959-d8fccfef7ee4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
};

type Grade = "A" | "B" | "C";

const checkIcons = {
  소화기: Flame,
  통로: Footprints,
  미끄럼: ScanLine,
  정돈: Sparkles,
} as const;

type Inspection = {
  id: string;
  img: string;
  site: string;
  by: string;
  time: string;
  grade: Grade;
  score: number;
  checks: { key: keyof typeof checkIcons; label: string; ok: boolean }[];
};

const inspections: Inspection[] = [
  {
    id: "p1", img: IMG.wetFloor, site: "강서 사업장 B1", by: "박소장", time: "09:12", grade: "C", score: 58,
    checks: [
      { key: "소화기", label: "소화기 적치", ok: false },
      { key: "통로", label: "통로 확보", ok: true },
      { key: "미끄럼", label: "미끄럼 위험", ok: false },
      { key: "정돈", label: "정돈 상태", ok: true },
    ],
  },
  {
    id: "p2", img: IMG.urinals, site: "역삼타워 3F", by: "이소장", time: "08:40", grade: "B", score: 81,
    checks: [
      { key: "소화기", label: "소화기 적치", ok: true },
      { key: "통로", label: "통로 확보", ok: true },
      { key: "미끄럼", label: "미끄럼 위험", ok: true },
      { key: "정돈", label: "정돈 상태", ok: false },
    ],
  },
  {
    id: "p3", img: IMG.restroomClean, site: "삼성동 타워 2F", by: "최소장", time: "08:20", grade: "A", score: 96,
    checks: [
      { key: "소화기", label: "소화기 적치", ok: true },
      { key: "통로", label: "통로 확보", ok: true },
      { key: "미끄럼", label: "미끄럼 위험", ok: true },
      { key: "정돈", label: "정돈 상태", ok: true },
    ],
  },
  {
    id: "p4", img: IMG.lobby, site: "판교 물류센터 1F", by: "정소장", time: "07:55", grade: "A", score: 92,
    checks: [
      { key: "소화기", label: "소화기 적치", ok: true },
      { key: "통로", label: "통로 확보", ok: true },
      { key: "미끄럼", label: "미끄럼 위험", ok: true },
      { key: "정돈", label: "정돈 상태", ok: true },
    ],
  },
];

const dist = [
  { g: "A", count: 612, tone: "green" as const },
  { g: "B", count: 731, tone: "blue" as const },
  { g: "C", count: 143, tone: "red" as const },
];

export function SitePhotoView() {
  const [resolved, setResolved] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("daily");
  const [reportOpen, setReportOpen] = useState(false);
  const total = dist.reduce((s, d) => s + d.count, 0);

  const openReport = (type: ReportType) => {
    setReportType(type);
    setReportOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="현장 AI 안전·미화 점검"
        subtitle="현장 소장이 올린 사진을 AI가 분석해 소화기·통로·미끄럼·정돈을 판독하고 A·B·C 등급으로 평가합니다"
        action={
          <Button className="bg-[var(--brand-navy)] hover:bg-[var(--brand-navy)]/90" onClick={() => openReport("daily")}>
            <Download className="size-4" /> 일일 보고서 생성
          </Button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="오늘 점검 사진" value="1,486" unit="장" icon={Camera} tone="navy" hint="3,000개 현장" />
        <StatCard label="평균 안전등급" value="B+" icon={ShieldCheck} tone="green" delta={{ value: "전일 대비 안정", up: true, good: true }} />
        <StatCard label="C등급 현장" value="143" unit="곳" icon={XCircle} tone="red" hint="즉시 조치 대상" />
        <StatCard label="미점검 현장" value="14" unit="곳" icon={Camera} tone="amber" hint="18시 마감 임박" />
      </div>

      {/* 등급 분포 + 즉시알림 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <SectionCard title="안전등급 분포" description="AI 정량 평가 (오늘)" icon={ShieldCheck}>
          <div className="space-y-3">
            {dist.map((d) => {
              const pct = Math.round((d.count / total) * 100);
              const color = d.tone === "green" ? "var(--success)" : d.tone === "blue" ? "var(--brand-blue)" : "var(--danger)";
              return (
                <div key={d.g} className="flex items-center gap-3">
                  <span className="size-8 rounded-lg grid place-items-center text-white shrink-0" style={{ background: color, fontFamily: "var(--font-heading)", fontWeight: 700 }}>
                    {d.g}
                  </span>
                  <div className="flex-1">
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                  <span style={{ fontSize: "0.8125rem", fontFamily: "var(--font-heading)", fontWeight: 700, width: 56, textAlign: "right" }}>
                    {d.count}곳
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <div className="xl:col-span-2 rounded-[var(--radius)] border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-5 py-4 flex items-center gap-4">
          <span className="size-10 rounded-lg bg-[var(--danger)] grid place-items-center shrink-0">
            <Bell className="size-5 text-white" />
          </span>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: "0.9375rem", fontWeight: 600 }}>이상감지 즉시알림 — 강서 사업장 안전등급 C</p>
            <p className="text-muted-foreground" style={{ fontSize: "0.8125rem" }}>
              소화기 적치 불량 · 바닥 미끄럼 위험 감지 (AI 신뢰도 88%) · 현장 소장에게 조치 요청 발송됨
            </p>
          </div>
          <StatusPill tone="red">긴급</StatusPill>
        </div>
      </div>

      {/* 사진 점검 그리드 */}
      <SectionCard
        title="현장 사진 AI 점검 결과"
        description="사진별 A·B·C 등급과 항목 판독 — 소화기 / 통로 / 미끄럼 / 정돈"
        icon={Camera}
        className="mb-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {inspections.map((a) => (
            <div key={a.id} className="rounded-[var(--radius)] border border-border overflow-hidden bg-card">
              <div className="relative aspect-[4/3]">
                <ImageWithFallback src={a.img} alt={a.site} className="size-full object-cover" />
                <span
                  className="absolute top-2 right-2 size-9 rounded-lg grid place-items-center text-white shadow"
                  style={{
                    background: a.grade === "A" ? "var(--success)" : a.grade === "B" ? "var(--brand-blue)" : "var(--danger)",
                    fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem",
                  }}
                >
                  {a.grade}
                </span>
              </div>
              <div className="p-3.5">
                <p style={{ fontSize: "0.875rem", fontWeight: 600 }} className="truncate">{a.site}</p>
                <p className="text-muted-foreground mb-3" style={{ fontSize: "0.75rem" }}>{a.by} · {a.time} · {a.score}점</p>
                <ul className="grid grid-cols-2 gap-1.5">
                  {a.checks.map((c) => {
                    const Icon = checkIcons[c.key];
                    return (
                      <li key={c.key} className="flex items-center gap-1.5" style={{ fontSize: "0.75rem" }}>
                        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate text-muted-foreground">{c.label}</span>
                        {c.ok ? (
                          <CheckCircle2 className="size-3.5 ml-auto shrink-0 text-[var(--success)]" />
                        ) : (
                          <XCircle className="size-3.5 ml-auto shrink-0 text-[var(--danger)]" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Before / After */}
        <SectionCard
          title="Before / After 조치 재확인"
          description="조치 전후 사진을 비교해 등급 개선을 자동 검증합니다"
          icon={ArrowLeftRight}
          action={resolved ? <StatusPill tone="green">조치완료 확인</StatusPill> : <StatusPill tone="amber">조치 대기</StatusPill>}
        >
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-muted-foreground mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 600 }}>BEFORE · 등급 C</p>
              <div className="rounded-lg overflow-hidden aspect-[4/3] border border-border relative">
                <ImageWithFallback src={IMG.wetFloor} alt="조치 전" className="size-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-[var(--danger)]/85 text-white text-center py-1" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>
                  소화기 적치 · 미끄럼 위험
                </span>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-1.5" style={{ fontSize: "0.75rem", fontWeight: 600 }}>AFTER · {resolved ? "등급 A" : "대기중"}</p>
              <div className="rounded-lg overflow-hidden aspect-[4/3] border border-border relative bg-muted grid place-items-center">
                {resolved ? (
                  <>
                    <ImageWithFallback src={IMG.lobby} alt="조치 후" className="size-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-[var(--success)]/90 text-white text-center py-1" style={{ fontSize: "0.6875rem", fontWeight: 600 }}>
                      적치 정리 · 건조 완료
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground text-center px-2" style={{ fontSize: "0.75rem" }}>조치 후 사진<br />업로드 대기</span>
                )}
              </div>
            </div>
          </div>
          {resolved ? (
            <div className="rounded-lg bg-[var(--success-soft)] px-4 py-3 flex items-center gap-2.5">
              <CheckCircle2 className="size-5 text-[var(--success)]" />
              <p style={{ fontSize: "0.875rem" }}>AI 비교 결과 <b>등급 C → A 개선 확인</b> — 조치완료 처리되었습니다.</p>
            </div>
          ) : (
            <Button className="w-full bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90" onClick={() => setResolved(true)}>
              <Sparkles className="size-4" /> 조치 후 사진 AI 재평가
            </Button>
          )}
        </SectionCard>

        {/* 결과보고서 자동생성 */}
        <SectionCard
          title="결과보고서 자동생성"
          description="현장·구역별 일일/주간 보고서를 자동으로 작성합니다"
          icon={FileBarChart}
        >
          <div className="rounded-lg border border-border divide-y divide-border mb-4">
            {[
              { t: "수도권 일일 안전·미화 보고서", d: "2026.06.17 · 142개 현장 · 1,486장 분석", tone: "green" as const, s: "생성완료" },
              { t: "강서 사업장 C등급 조치 요약", d: "소화기 적치 1 · 미끄럼 1", tone: "red" as const, s: "확인필요" },
              { t: "전국 주간 안전등급 종합", d: "06.10 ~ 06.16 · 추세 분석 포함", tone: "amber" as const, s: "생성중" },
            ].map((r) => (
              <div key={r.t} className="flex items-center gap-3 px-4 py-3.5">
                <span className="size-10 rounded-lg bg-[var(--brand-blue-soft)] grid place-items-center shrink-0">
                  <FileBarChart className="size-5 text-[var(--brand-blue)]" />
                </span>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "0.9375rem", fontWeight: 600 }} className="truncate">{r.t}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{r.d}</p>
                </div>
                <StatusPill tone={r.tone}>{r.s}</StatusPill>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 bg-[var(--brand-navy)] hover:bg-[var(--brand-navy)]/90" onClick={() => openReport("inspection-results")}>
              <Download className="size-4" /> 전체 PDF 다운로드
            </Button>
            <Button variant="outline" className="flex-1">고객사 자동 공유</Button>
          </div>
        </SectionCard>
      </div>
      <ReportPreviewDialog type={reportType} open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  );
}
