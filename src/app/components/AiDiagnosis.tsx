import { useState } from "react";
import { Sparkles, Search, Wrench, Check, ArrowRight } from "lucide-react";
import { SectionCard, StatusPill } from "./shared";
import { Button } from "./ui/button";

type Priority = "긴급" | "높음" | "중간";
const priorityTone: Record<Priority, "red" | "amber" | "blue"> = {
  긴급: "red",
  높음: "amber",
  중간: "blue",
};

type Row = {
  id: string;
  site: string;
  type: string;
  priority: Priority;
  problem: string;
  cause: string;
  solution: string;
};

/* 우선순위 순으로 정렬된 현장 진단 결과 */
const rows: Row[] = [
  { id: "B", site: "B 생산 현장", type: "제조", priority: "긴급", problem: "통증 설문 증가", cause: "특정 작업자의 근골격계 부담 집중", solution: "작업환경 개선 · 인력 교대 조정" },
  { id: "C", site: "C 물류센터", type: "물류", priority: "긴급", problem: "출고 지연", cause: "피크 시간대 인력 부족", solution: "인력 추가 배치 · 동선 재설계" },
  { id: "A", site: "A FM 현장", type: "시설관리", priority: "높음", problem: "청결 민원 증가", cause: "특정 구역 청소 누락 반복", solution: "청소 동선 조정 · 점검 빈도 증가" },
  { id: "D", site: "D F&B 매장", type: "식음", priority: "높음", problem: "위생 점검 등급 하락", cause: "조리 공간 정리 미흡", solution: "위생 점검 강화 · 교육 실시" },
  { id: "E", site: "E 서비스 현장", type: "서비스", priority: "중간", problem: "고객 불만 증가", cause: "특정 시간대 응대 지연", solution: "교대 시간 조정 · 서비스 교육" },
];

export function AiDiagnosis() {
  const [applied, setApplied] = useState<Record<string, boolean>>({});

  return (
    <SectionCard
      title="AI 진단 · 조치 우선순위"
      description="단순 수치가 아니라 문제 원인과 조치 우선순위를 함께 제시합니다"
      icon={Sparkles}
      className="mb-6"
      action={<StatusPill tone="red">조치 필요 {rows.filter((r) => !applied[r.id]).length}건</StatusPill>}
    >
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="min-w-[860px]">
          {/* header */}
          <div
            className="grid items-center gap-3 px-3 pb-2.5 text-muted-foreground"
            style={{ gridTemplateColumns: "84px 1.1fr 1fr 1.5fr 1.6fr 104px", fontSize: "0.75rem", fontWeight: 600 }}
          >
            <span>우선순위</span>
            <span>현장</span>
            <span className="flex items-center gap-1"><Search className="size-3.5" /> 감지된 문제</span>
            <span className="flex items-center gap-1"><Sparkles className="size-3.5" /> AI 분석 결과</span>
            <span className="flex items-center gap-1"><Wrench className="size-3.5" /> 제안 솔루션</span>
            <span className="text-right">조치</span>
          </div>

          <ul className="space-y-2">
            {rows.map((r, i) => {
              const done = applied[r.id];
              return (
                <li
                  key={r.id}
                  className="grid items-center gap-3 rounded-lg border border-border bg-card px-3 py-3"
                  style={{ gridTemplateColumns: "84px 1.1fr 1fr 1.5fr 1.6fr 104px", opacity: done ? 0.65 : 1 }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground" style={{ fontSize: "0.75rem", fontFamily: "var(--font-heading)", fontWeight: 700 }}>
                      P{i + 1}
                    </span>
                    <StatusPill tone={priorityTone[r.priority]}>{r.priority}</StatusPill>
                  </div>

                  <div className="min-w-0">
                    <p style={{ fontSize: "0.875rem", fontWeight: 600 }} className="truncate">{r.site}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "0.6875rem" }}>{r.type}</p>
                  </div>

                  <p style={{ fontSize: "0.8125rem", fontWeight: 500 }} className="leading-snug">{r.problem}</p>

                  <p className="text-muted-foreground leading-snug" style={{ fontSize: "0.8125rem" }}>{r.cause}</p>

                  <div className="flex items-start gap-1.5">
                    <Sparkles className="size-3.5 text-[var(--brand-blue)] mt-0.5 shrink-0" />
                    <p className="leading-snug" style={{ fontSize: "0.8125rem" }}>{r.solution}</p>
                  </div>

                  <div className="flex justify-end">
                    {done ? (
                      <StatusPill tone="green">조치중</StatusPill>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-[var(--brand-navy)] hover:bg-[var(--brand-navy)]/90"
                        onClick={() => setApplied((s) => ({ ...s, [r.id]: true }))}
                      >
                        적용 <ArrowRight className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 rounded-lg bg-[var(--brand-blue-soft)] px-4 py-3">
        <Check className="size-4 text-[var(--brand-blue)] shrink-0" />
        <p style={{ fontSize: "0.8125rem", lineHeight: 1.5 }}>
          AI가 근태·설문·점검 데이터를 교차 분석해 <b>원인과 솔루션</b>을 자동 도출합니다. 우선순위 순으로 조치하면 현장 리스크를 가장 빠르게 줄일 수 있습니다.
        </p>
      </div>
    </SectionCard>
  );
}
