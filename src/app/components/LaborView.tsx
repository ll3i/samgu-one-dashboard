import { useState } from "react";
import {
  ClipboardList,
  HeartPulse,
  Activity,
  ShieldAlert,
  TrendingDown,
  ShieldCheck,
  FileSignature,
  Siren,
  CheckCircle2,
  Clock,
  PenLine,
  FileText,
  MessageSquareWarning,
  Lightbulb,
} from "lucide-react";
import { StatCard, SectionCard, StatusPill, ProgressBar, PageHeader } from "./shared";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";

/* 컨디션 분포 (오늘 익명 설문) */
const condition = [
  { label: "좋음", value: 62, tone: "green" as const },
  { label: "보통", value: 28, tone: "blue" as const },
  { label: "나쁨", value: 10, tone: "red" as const },
];

/* 근골격계 통증 응답 — 부위별 */
const pain = [
  { part: "허리", value: 34, site: "판교 물류센터 집중", tone: "red" as const },
  { part: "어깨", value: 22, site: "강남 오피스", tone: "amber" as const },
  { part: "무릎", value: 18, site: "수도권 전반", tone: "amber" as const },
  { part: "손목", value: 11, site: "콜센터", tone: "blue" as const },
];

/* 안전 우려 · 처우 건의 */
const voices = [
  { id: "v1", type: "안전 우려", site: "강서 사업장", text: "지하주차장 조명 어두움 — 야간 미끄럼 우려", tone: "red" as const },
  { id: "v2", type: "처우 건의", site: "판교 물류센터", text: "중량물 작업 휴게 주기 조정 요청", tone: "amber" as const },
  { id: "v3", type: "안전 우려", site: "삼성동 타워", text: "고소작업 안전벨트 추가 필요", tone: "red" as const },
];

/* 이탈·산재 징후 (설문 + 근태 종합) */
const riskSites = [
  { id: "r1", site: "판교 물류센터", level: 76, label: "산재·이탈 위험", tone: "red" as const, note: "근골격계 통증 + 처우 불만 동시 누적" },
  { id: "r2", site: "강서 사업장", level: 58, label: "안전 리스크", tone: "amber" as const, note: "안전 우려 응답 반복 — 조명·시설 개선 필요" },
  { id: "r3", site: "강남 오피스", level: 24, label: "양호", tone: "green" as const, note: "특이 패턴 없음" },
];

const insurance = [
  { id: "i1", name: "김도현", date: "06/16 입사", status: "신고완료", tone: "green" as const },
  { id: "i2", name: "이서윤", date: "06/16 입사", status: "신고완료", tone: "green" as const },
  { id: "i3", name: "박민재", date: "06/17 입사", status: "신고중", tone: "amber" as const },
];
const contracts = [
  { id: "c1", name: "박민재", role: "미화원 / 역삼타워", status: "서명완료", tone: "green" as const },
  { id: "c2", name: "정유진", role: "미화원 / 코엑스", status: "서명대기", tone: "amber" as const },
];

export function LaborView() {
  const [signed, setSigned] = useState<Record<string, boolean>>({});

  return (
    <div>
      <PageHeader
        title="건강·노무 케어"
        subtitle="하루 1분 익명 설문으로 직원 컨디션·통증·안전 신호를 모아 산재·이탈을 조기에 감지합니다"
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="오늘 설문 응답률" value="88.5" unit="%" icon={ClipboardList} tone="blue" delta={{ value: "익명 1분 설문", up: true, good: true }} />
        <StatCard label="컨디션 '나쁨'" value="10" unit="%" icon={HeartPulse} tone="amber" hint="조기 케어 대상" />
        <StatCard label="근골격계 통증 응답" value="85" unit="건" icon={Activity} tone="red" hint="허리 통증 최다" />
        <StatCard label="산재·이탈 위험 현장" value="1" unit="곳" icon={ShieldAlert} tone="red" hint="판교 물류센터" />
      </div>

      <Tabs defaultValue="survey">
        <TabsList className="mb-5 bg-muted">
          <TabsTrigger value="survey">건강·노무 설문</TabsTrigger>
          <TabsTrigger value="risk">산재·이탈 리스크</TabsTrigger>
          <TabsTrigger value="admin">4대보험·근로계약</TabsTrigger>
        </TabsList>

        {/* 건강·노무 설문 */}
        <TabsContent value="survey">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <SectionCard
              title="오늘의 컨디션 분포"
              description="직원이 익명으로 응답한 컨디션 집계"
              icon={HeartPulse}
              action={<StatusPill tone="blue">익명 집계</StatusPill>}
            >
              <div className="space-y-4">
                {condition.map((c) => (
                  <div key={c.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>{c.label}</span>
                      <span style={{ fontSize: "0.875rem", fontFamily: "var(--font-heading)", fontWeight: 700 }}>{c.value}%</span>
                    </div>
                    <ProgressBar value={c.value} tone={c.tone} />
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground mt-4" style={{ fontSize: "0.75rem" }}>
                ※ 개별 응답은 익명 처리되어 직원이 부담 없이 의견을 낼 수 있습니다.
              </p>
            </SectionCard>

            <SectionCard
              title="근골격계 통증 응답 (부위별)"
              description="통증 신호가 집중된 현장을 자동 식별"
              icon={Activity}
              action={<StatusPill tone="red">허리 통증 집중</StatusPill>}
            >
              <ul className="space-y-3">
                {pain.map((p) => (
                  <li key={p.part}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                        {p.part} <span className="text-muted-foreground" style={{ fontWeight: 400, fontSize: "0.75rem" }}>· {p.site}</span>
                      </span>
                      <span style={{ fontSize: "0.8125rem", fontFamily: "var(--font-heading)", fontWeight: 700 }}>{p.value}건</span>
                    </div>
                    <ProgressBar value={p.value * 2.5} tone={p.tone} />
                  </li>
                ))}
              </ul>
              <div className="rounded-lg bg-[var(--warning-soft)] px-4 py-3 mt-4 flex items-start gap-2.5">
                <Lightbulb className="size-4 text-[var(--warning)] mt-0.5 shrink-0" />
                <p style={{ fontSize: "0.8125rem", lineHeight: 1.5 }}>
                  <b>판교 물류센터</b> 허리 통증 집중 → 중량물 분담·휴게 주기 조정 권고
                </p>
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="안전 우려 · 처우 건의 접수"
            description="직원이 설문으로 남긴 현장 신호 — 운영팀이 즉시 확인"
            icon={MessageSquareWarning}
          >
            <ul className="space-y-2.5">
              {voices.map((v) => (
                <li key={v.id} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                  <StatusPill tone={v.tone}>{v.type}</StatusPill>
                  <div className="min-w-0 flex-1">
                    <p style={{ fontSize: "0.9375rem", fontWeight: 500 }} className="truncate">{v.text}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{v.site}</p>
                  </div>
                  <Button size="sm" variant="outline">조치 배정</Button>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        {/* 산재·이탈 리스크 */}
        <TabsContent value="risk">
          <SectionCard
            title="산재·이탈 징후 감지"
            description="설문 데이터와 근태 데이터를 종합해 현장별 위험도를 산출합니다"
            icon={TrendingDown}
            action={<StatusPill tone="red">위험 1곳</StatusPill>}
          >
            <ul className="space-y-3">
              {riskSites.map((r) => (
                <li key={r.id} className="rounded-lg border border-border px-4 py-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert
                        className="size-4"
                        style={{ color: r.tone === "red" ? "var(--danger)" : r.tone === "amber" ? "var(--warning)" : "var(--success)" }}
                      />
                      <span style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{r.site}</span>
                    </div>
                    <StatusPill tone={r.tone}>{r.label}</StatusPill>
                  </div>
                  <p className="text-muted-foreground mb-2.5" style={{ fontSize: "0.8125rem" }}>{r.note}</p>
                  <div className="flex items-center gap-3">
                    <ProgressBar value={r.level} tone={r.tone} />
                    <span style={{ fontSize: "0.8125rem", fontWeight: 600, fontFamily: "var(--font-heading)" }}>위험도 {r.level}</span>
                  </div>
                  {r.tone === "red" && (
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="bg-[var(--danger)] hover:bg-[var(--danger)]/90">현장 점검 배정</Button>
                      <Button size="sm" variant="outline">작업환경 개선 계획</Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-4" style={{ fontSize: "0.75rem" }}>
              ※ 메신저 감성분석 + 통증·처우 응답을 종합하며, 개별 메시지 원문은 노출되지 않습니다.
            </p>
          </SectionCard>
        </TabsContent>

        {/* 4대보험·근로계약 */}
        <TabsContent value="admin">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
            <SectionCard
              title="4대보험 자동신고"
              description="입사처리 시 국민·건강·고용·산재를 자동 신고"
              icon={ShieldCheck}
              action={<StatusPill tone="green">연동</StatusPill>}
            >
              <ul className="space-y-2.5">
                {insurance.map((i) => (
                  <li key={i.id} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                    <span className="size-9 rounded-full bg-muted grid place-items-center shrink-0" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                      {i.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{i.name}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{i.date} · 국민·건강·고용·산재</p>
                    </div>
                    {i.status === "신고완료" ? <CheckCircle2 className="size-4 text-[var(--success)]" /> : <Clock className="size-4 text-[var(--warning)]" />}
                    <StatusPill tone={i.tone}>{i.status}</StatusPill>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard
              title="근로계약 자동화"
              description="표준 근로계약서 자동 생성 + 전자서명"
              icon={FileSignature}
            >
              <ul className="space-y-2.5">
                {contracts.map((c) => {
                  const isSigned = c.status === "서명완료" || signed[c.id];
                  return (
                    <li key={c.id} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                      <span className="size-9 rounded-lg bg-[var(--brand-blue-soft)] grid place-items-center shrink-0">
                        <FileText className="size-4 text-[var(--brand-blue)]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{c.name}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>{c.role}</p>
                      </div>
                      {isSigned ? (
                        <StatusPill tone="green">서명완료</StatusPill>
                      ) : (
                        <Button size="sm" className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90" onClick={() => setSigned((s) => ({ ...s, [c.id]: true }))}>
                          <PenLine className="size-4" /> 서명요청
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          </div>

          <SectionCard
            title="산재 보고 지원"
            description="사고 키워드 감지 시 골든타임 5분 보고 절차 안내 + 산재조사표 자동생성"
            icon={Siren}
          >
            <div className="rounded-lg bg-[var(--danger-soft)] px-4 py-3.5 flex items-center gap-3">
              <Siren className="size-5 text-[var(--danger)] shrink-0" />
              <div className="flex-1">
                <p style={{ fontSize: "0.9375rem", fontWeight: 600 }}>사고 키워드 감지 — 강서 사업장</p>
                <p className="text-muted-foreground" style={{ fontSize: "0.8125rem" }}>"미끄러져 넘어짐" 설문 응답 접수 · 09:03</p>
              </div>
              <Button size="sm" className="bg-[var(--brand-navy)] hover:bg-[var(--brand-navy)]/90">
                <FileText className="size-4" /> 산재조사표 생성
              </Button>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
