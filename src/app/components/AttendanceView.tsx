import { useState } from "react";
import {
  CalendarClock,
  UserMinus,
  Banknote,
  Check,
  X,
  MapPin,
  Sparkles,
  Clock,
} from "lucide-react";
import { StatCard, SectionCard, StatusPill, PageHeader } from "./shared";
import { Button } from "./ui/button";

const exceptions = [
  { id: "e1", name: "이정숙", site: "역삼타워 B1", type: "결근", tone: "red" as const, detail: "GPS 미인증 · 연락 두절", time: "08:00 ~" },
  { id: "e2", name: "박성호", site: "코엑스 3F", type: "조퇴", tone: "amber" as const, detail: "13:20 조기 퇴근 태깅", time: "09:00~13:20" },
  { id: "e3", name: "최영미", site: "삼성생명 A동", type: "지각", tone: "amber" as const, detail: "32분 지각 출근", time: "08:32~" },
  { id: "e4", name: "정해권", site: "역삼타워 7F", type: "결근", tone: "red" as const, detail: "병가 사유 미등록", time: "08:00 ~" },
];

const replacementPool = [
  { id: "r1", name: "한미경", site: "선릉 그랜드 (1.2km)", dist: 1.2, status: "대기", rating: 4.8, exp: "미화 6년" },
  { id: "r2", name: "오수진", site: "역삼 센터필드 (0.8km)", dist: 0.8, status: "대기", rating: 4.9, exp: "미화 9년" },
  { id: "r3", name: "강복순", site: "테헤란 N타워 (2.1km)", dist: 2.1, status: "근무중", rating: 4.6, exp: "미화 3년" },
];

export function AttendanceView() {
  const [resolved, setResolved] = useState<Record<string, "approve" | "reject">>({});
  const [assigned, setAssigned] = useState<string | null>(null);

  // 최저임금 변동 대응 — 인상률 입력 시 급여 자동 재계산
  const [rate, setRate] = useState(2.5);
  const baseHourly = 10030; // 2026 기준 시급 (예시)
  const monthlyHours = 209;
  const headcount = 188;
  const newHourly = Math.round(baseHourly * (1 + rate / 100));
  const perPersonMonthly = newHourly * monthlyHours;
  const totalDelta = (newHourly - baseHourly) * monthlyHours * headcount;

  const pending = exceptions.filter((e) => !resolved[e.id]).length;

  return (
    <div>
      <PageHeader
        title="근태 관리 (GPS 태깅)"
        subtitle="현장 반경 내 GPS 인증으로 대리출근·기록누락을 차단 — 매니저는 예외건만 확인합니다"
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="GPS 출근 인증" value="96.2" unit="%" icon={MapPin} tone="green" delta={{ value: "현장 반경 내 인증", up: true, good: true }} />
        <StatCard label="확인 필요 예외" value={pending} unit="건" icon={Clock} tone="amber" hint="결근·조퇴·지각·미인증" />
        <StatCard label="결원 대체 필요" value="2" unit="건" icon={UserMinus} tone="red" hint="결근 자동 감지" />
        <StatCard label="이번 달 인건비" value="₩3.94억" icon={Banknote} tone="navy" hint="근태 기반 정산" />
      </div>

      {/* 1. 근태 자동집계 — 예외 처리 */}
      <SectionCard
        title="GPS 태깅 자동집계 · 예외 확인"
        description="현장 반경 안에서만 출퇴근이 인증되며, 예외건만 매니저 승인이 필요합니다"
        icon={MapPin}
        className="mb-6"
        action={<StatusPill tone="green">GPS 인증 ON</StatusPill>}
      >
        <ul className="space-y-2.5">
          {exceptions.map((e) => {
            const r = resolved[e.id];
            return (
              <li
                key={e.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3"
                style={{ opacity: r ? 0.6 : 1 }}
              >
                <span className="size-10 rounded-full bg-muted grid place-items-center shrink-0" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                  {e.name.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <p style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                    {e.name} <span className="text-muted-foreground" style={{ fontWeight: 400, fontSize: "0.8125rem" }}>· {e.site}</span>
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: "0.8125rem" }}>
                    {e.detail} · {e.time}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <StatusPill tone={e.tone}>{e.type}</StatusPill>
                  {r ? (
                    <StatusPill tone={r === "approve" ? "green" : "slate"}>
                      {r === "approve" ? "승인됨" : "반려됨"}
                    </StatusPill>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        className="bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90"
                        onClick={() => setResolved((s) => ({ ...s, [e.id]: "approve" }))}
                      >
                        <Check className="size-4" /> 승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setResolved((s) => ({ ...s, [e.id]: "reject" }))}
                      >
                        <X className="size-4" /> 반려
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </SectionCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 2. 결원 발생 대응 — 대체인력 풀 추천 */}
        <SectionCard
          title="결원 대응 · 대체인력 자동 추천"
          description="결근 감지 시 인근 사업장 유휴 인력을 거리순으로 추천"
          icon={UserMinus}
          action={<StatusPill tone="red">결근 2건</StatusPill>}
        >
          <div className="rounded-lg bg-[var(--danger-soft)] px-4 py-3 mb-4 flex items-center gap-3">
            <UserMinus className="size-5 text-[var(--danger)] shrink-0" />
            <p style={{ fontSize: "0.875rem" }}>
              <b>역삼타워 B1</b> 미화 결원 발생 — AI가 인근 대체인력을 추천했습니다
            </p>
          </div>
          <ul className="space-y-2.5">
            {replacementPool.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                <span className="size-10 rounded-full bg-[var(--brand-blue-soft)] text-[var(--brand-blue)] grid place-items-center shrink-0" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                  {p.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                    {p.name} <span className="text-muted-foreground" style={{ fontWeight: 400, fontSize: "0.75rem" }}>· {p.exp} · ★{p.rating}</span>
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1" style={{ fontSize: "0.8125rem" }}>
                    <MapPin className="size-3.5" /> {p.site}
                  </p>
                </div>
                {p.status === "대기" ? (
                  assigned === p.id ? (
                    <StatusPill tone="green">배정완료</StatusPill>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-[var(--brand-navy)] hover:bg-[var(--brand-navy)]/90"
                      onClick={() => setAssigned(p.id)}
                    >
                      배정
                    </Button>
                  )
                ) : (
                  <StatusPill tone="slate">근무중</StatusPill>
                )}
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* 3. 최저임금 변동 대응 — 급여 자동 재계산 */}
        <SectionCard
          title="최저임금 변동 대응"
          description="인상률 입력 시 근태 데이터 기반으로 급여를 자동 재계산"
          icon={Banknote}
        >
          <div className="mb-5">
            <label style={{ fontSize: "0.875rem", fontWeight: 600 }} className="flex items-center justify-between mb-2">
              <span>최저임금 인상률</span>
              <span className="text-[var(--brand-blue)]" style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.125rem" }}>
                +{rate.toFixed(1)}%
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full accent-[var(--brand-blue)]"
            />
            <div className="flex justify-between text-muted-foreground mt-1" style={{ fontSize: "0.6875rem" }}>
              <span>0%</span>
              <span>10%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>기존 시급</p>
              <p style={{ fontSize: "1.125rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
                ₩{baseHourly.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--brand-blue-soft)] px-4 py-3">
              <p className="text-[var(--brand-blue)]" style={{ fontSize: "0.75rem" }}>재계산 시급</p>
              <p className="text-[var(--brand-blue)]" style={{ fontSize: "1.125rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
                ₩{newHourly.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border divide-y divide-border">
            <Row label="1인 월급여 (209h 기준)" value={`₩${perPersonMonthly.toLocaleString()}`} />
            <Row label="대상 근무자" value={`${headcount}명`} />
            <Row
              label="월 인건비 추가 부담"
              value={`+₩${totalDelta.toLocaleString()}`}
              highlight
            />
          </div>

          <Button className="w-full mt-4 bg-[var(--brand-navy)] hover:bg-[var(--brand-navy)]/90">
            <Sparkles className="size-4" /> 재계산 결과 급여대장 반영
          </Button>
        </SectionCard>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>{label}</span>
      <span
        style={{
          fontSize: highlight ? "1.0625rem" : "0.9375rem",
          fontWeight: highlight ? 700 : 600,
          fontFamily: "var(--font-heading)",
          color: highlight ? "var(--danger)" : "inherit",
        }}
      >
        {value}
      </span>
    </div>
  );
}
