import type { Site } from "./siteData";

export type AnalysisPeriod = "오늘" | "7일" | "30일";
export type AnalysisScenario = "정상" | "주의" | "위험";
export type AnalysisKind = "safety" | "staff" | "health" | "sla" | "quality" | "voc" | "cost" | "report";
export type AnalysisResult = {
  kind: AnalysisKind; score: number; label: string; confidence: number; summary: string;
  evidence: string[]; recommendation: string; metrics: { label: string; value: string; delta?: string }[];
  series: { label: string; value: number; compare?: number }[];
};

const exactKinds: Record<string, AnalysisKind> = {
  "production-safety": "safety", "office-staff": "staff", "logistics-health": "health",
  "logistics-sla": "sla", "office-quality": "quality", "office-voc": "voc", "retail-voc": "voc",
  "retail-cost": "cost",
};

export function analysisKindFor(moduleId: string): AnalysisKind | null {
  if (moduleId.endsWith("-report")) return "report";
  return exactKinds[moduleId] ?? null;
}

export const analysisMeta: Record<AnalysisKind, { title: string; input: string; iconLabel: string }> = {
  safety: { title: "안전 사진 판독", input: "점검 사진·안전 체크리스트", iconLabel: "사진 위험영역" },
  staff: { title: "결원 대응 추천", input: "GPS 근태·스케줄·숙련도", iconLabel: "필요/가용 인원" },
  health: { title: "근골격계 위험 탐지", input: "익명 통증 설문·누적 작업시간", iconLabel: "통증 위험분포" },
  sla: { title: "SLA 지연 예측", input: "작업량·결원·계약 마감", iconLabel: "완료율 예측" },
  quality: { title: "미화 품질 분석", input: "구역 사진·점검표·재작업", iconLabel: "구역별 품질" },
  voc: { title: "VOC 자동 분류", input: "민원 내용·처리 이력", iconLabel: "유형/감정 분류" },
  cost: { title: "비용 이상 탐지", input: "ERP·급여·소모품·동종현장", iconLabel: "비용 편차" },
  report: { title: "AI 운영보고서", input: "근태·점검·SLA·조치 이력", iconLabel: "종합 운영요약" },
};

const scenarioOffset = { 정상: 12, 주의: -5, 위험: -24 } as const;
const periodBoost = { 오늘: 0, "7일": 2, "30일": 5 } as const;
const clamp = (n: number) => Math.max(4, Math.min(99, Math.round(n)));

export function runAnalysis(kind: AnalysisKind, site: Site, period: AnalysisPeriod, scenario: AnalysisScenario): AnalysisResult {
  const seed = Number(site.id.replace(/\D/g, "")) || 1;
  const positive = clamp((site.attendanceRate + site.sla + site.surveyRate) / 3 + scenarioOffset[scenario]);
  const risk = 100 - positive;
  const confidence = clamp(83 + periodBoost[period] + seed % 7);
  const severity = positive >= 85 ? "정상" : positive >= 68 ? "주의" : "위험";
  const base = { kind, score: positive, label: severity, confidence };
  const days = period === "오늘" ? ["09시", "11시", "13시", "15시", "17시"] : period === "7일" ? ["월", "화", "수", "목", "금", "토", "일"] : ["1주", "2주", "3주", "4주"];
  const series = days.map((label, i) => ({ label, value: clamp(positive - 7 + ((i * 7 + seed) % 14)), compare: clamp(84 + ((i + seed) % 7)) }));
  switch (kind) {
    case "safety": return { ...base, score: positive, summary: `${site.name} 점검 사진에서 ${scenario === "위험" ? "통로 적치와 미끄럼" : scenario === "주의" ? "정돈 미흡" : "특이 위험 없음"} 패턴을 판독했습니다.`, evidence: [`사진 24장 분석`, `반복 위험 ${Math.max(0, risk - 8)}%`, `미처리 조치 ${site.openActions}건`], recommendation: scenario === "위험" ? "위험구역 통제 후 적치물 제거와 재촬영을 배정하세요." : "정기점검 주기를 유지하세요.", metrics: [{ label: "안전점수", value: `${positive}점` }, { label: "위험 객체", value: `${Math.round(risk / 13)}개` }, { label: "판독 사진", value: "24장" }], series };
    case "staff": { const shortage = scenario === "정상" ? 0 : scenario === "주의" ? 3 : 7; return { ...base, score: clamp(100 - shortage * 9), summary: `예정 ${site.headcount}명 대비 피크 시간대 ${shortage}명 결원이 예상됩니다.`, evidence: [`GPS 출근율 ${site.attendanceRate}%`, `예정인원 ${site.headcount}명`, `가용 대체인력 ${Math.max(1, 6 - shortage)}명`], recommendation: shortage ? `인접 현장의 숙련 대체인력 ${Math.min(shortage, 3)}명을 14시 이전 배정하세요.` : "현재 배치를 유지하세요.", metrics: [{ label: "예상 결원", value: `${shortage}명` }, { label: "필요 인원", value: `${site.headcount}명` }, { label: "배치 가능", value: `${Math.max(1, 6 - shortage)}명` }], series: days.map((label, i) => ({ label, value: site.headcount - shortage + i % 3, compare: site.headcount })) }; }
    case "health": return { ...base, score: risk, label: risk >= 55 ? "고위험" : risk >= 30 ? "관찰" : "낮음", summary: `익명 설문에서 허리·어깨 통증과 연속 작업시간의 상관 신호를 확인했습니다.`, evidence: [`설문 응답 ${site.surveyRate}%`, `통증 응답 ${Math.round(risk * .7)}명`, `평균 연속작업 ${scenario === "위험" ? 154 : 98}분`], recommendation: "중량물 2인 작업과 90분 단위 회복 휴식을 편성하세요.", metrics: [{ label: "위험군", value: `${Math.round(risk * .7)}명` }, { label: "허리", value: `${clamp(risk + 8)}%` }, { label: "어깨", value: `${clamp(risk - 7)}%` }], series };
    case "sla": return { ...base, score: clamp(positive - 5), label: positive < 70 ? "지연 가능" : "달성 예상", summary: `현재 작업량과 출근 인원을 기준으로 SLA 달성률 ${clamp(positive - 5)}%를 예측했습니다.`, evidence: [`현재 SLA ${site.sla}%`, `출근율 ${site.attendanceRate}%`, `잔여 작업 ${Math.round(risk * 1.8)}건`], recommendation: positive < 70 ? "마감 2시간 전 지원인력 3명을 투입하고 고객사에 사전 공유하세요." : "현재 처리속도를 유지하세요.", metrics: [{ label: "달성 예측", value: `${clamp(positive - 5)}%` }, { label: "지연 확률", value: `${risk}%` }, { label: "예상 완료", value: positive < 70 ? "19:40" : "17:25" }], series };
    case "quality": return { ...base, summary: `${period} 사진 점검 결과 화장실·로비·공용부 품질을 비교했습니다.`, evidence: [`점검 사진 ${period === "오늘" ? 38 : 186}장`, `재작업 ${Math.round(risk / 12)}건`, `동종 평균 86점`], recommendation: positive < 75 ? "저점 구역을 재청소하고 동일 각도의 완료 사진을 요청하세요." : "우수 작업 기준을 인접 현장에 공유하세요.", metrics: [{ label: "종합 품질", value: `${positive}점` }, { label: "최저 구역", value: scenario === "위험" ? "B1 화장실" : "3F 로비" }, { label: "재작업", value: `${Math.round(risk / 12)}건` }], series: ["로비", "화장실", "공용부", "외곽"].map((label, i) => ({ label, value: clamp(positive - 10 + i * 5), compare: 86 })) };
    case "voc": { const urgent = Math.max(1, Math.round(risk / 14)); return { ...base, score: 100 - risk, summary: `${period} 접수 VOC를 미화·응대·시설·안전 유형과 긴급도로 자동 분류했습니다.`, evidence: [`총 ${34 + seed}건`, `부정 감성 ${risk}%`, `반복 민원 ${Math.round(risk / 9)}건`], recommendation: `긴급 VOC ${urgent}건을 시설 담당자에게 우선 배정하고 2시간 이내 답변하세요.`, metrics: [{ label: "긴급", value: `${urgent}건` }, { label: "부정 감성", value: `${risk}%` }, { label: "자동분류", value: `${confidence}%` }], series: ["미화", "응대", "시설", "안전"].map((label, i) => ({ label, value: clamp((risk + 18 + i * 13) % 72), compare: 25 })) }; }
    case "cost": return { ...base, score: risk, label: risk >= 45 ? "이상 비용" : "정상 범위", summary: `동종 현장 대비 급여·초과근무·소모품 비용 편차를 탐지했습니다.`, evidence: [`동종 현장 18곳 비교`, `초과근무 +${Math.round(risk * .8)}%`, `소모품 +${Math.round(risk * .45)}%`], recommendation: risk >= 45 ? "초과근무 승인 내역과 소모품 발주 단가를 재검토하세요." : "현재 예산 집행을 유지하세요.", metrics: [{ label: "이상지수", value: `${risk}점` }, { label: "예상 초과", value: `${Math.round(risk * 12)}만원` }, { label: "비교 현장", value: "18곳" }], series: ["급여", "초과근무", "소모품", "시설비"].map((label, i) => ({ label, value: clamp(72 + risk / 3 + i * 4), compare: 76 })) };
    case "report": return { ...base, summary: `${site.name}의 ${period} 운영 데이터를 종합해 핵심 성과와 위험을 자동 요약했습니다.`, evidence: [`출근율 ${site.attendanceRate}%`, `안전등급 ${site.safetyGrade}`, `SLA ${site.sla}%`, `미처리 ${site.openActions}건`], recommendation: positive < 75 ? "결원·안전 미처리 항목을 오늘의 우선 조치로 승인하세요." : "정상 운영을 유지하고 우수 사례로 공유하세요.", metrics: [{ label: "운영점수", value: `${positive}점` }, { label: "SLA", value: `${site.sla}%` }, { label: "미처리", value: `${site.openActions}건` }], series };
  }
}
