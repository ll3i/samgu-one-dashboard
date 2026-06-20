import type { Site } from "./siteData";

export type AIRole = "site-manager" | "ops-manager" | "client";
export type ModuleStatus = "active" | "review" | "inactive";
export type InsightSeverity = "critical" | "warning" | "info";

export type AISolutionModule = {
  id: string;
  name: string;
  description: string;
  input: string;
  impact: string;
  status: ModuleStatus;
};

export type AISolutionPackage = {
  industry: Site["industry"];
  title: string;
  summary: string;
  modules: AISolutionModule[];
};

export type AIInsight = {
  id: string;
  title: string;
  summary: string;
  severity: InsightSeverity;
  confidence: number;
  evidence: string[];
  action: string;
};

const common = (industry: string): AISolutionModule[] => [
  { id: `${industry}-copilot`, name: "운영 코파일럿", description: "현장 데이터를 요약하고 오늘의 우선 업무를 추천합니다.", input: "근태·점검·조치", impact: "판단시간 35% 단축", status: "active" },
  { id: `${industry}-report`, name: "AI 보고서", description: "일일·주간 운영 결과와 개선 근거를 자동 작성합니다.", input: "KPI·사진·조치이력", impact: "작성시간 70% 단축", status: "active" },
];

export const solutionPackages: AISolutionPackage[] = [
  {
    industry: "오피스", title: "스마트 오피스 운영 AI", summary: "미화 품질과 VOC를 연결해 고객 만족도를 높입니다.",
    modules: [...common("office"),
      { id: "office-quality", name: "미화 품질 분석", description: "구역별 사진 점검과 반복 불량을 분석합니다.", input: "현장사진·점검표", impact: "재작업 22% 감소", status: "active" },
      { id: "office-voc", name: "VOC 자동 분류", description: "민원 내용과 긴급도를 분류해 담당자에게 배정합니다.", input: "VOC·고객문의", impact: "응답시간 40% 단축", status: "review" },
      { id: "office-staff", name: "결원 대응 추천", description: "출근 예외와 업무량을 반영해 대체인력을 추천합니다.", input: "근태·스케줄·급여", impact: "결원시간 30% 감소", status: "active" },
    ],
  },
  {
    industry: "물류", title: "물류 안전·인력 최적화 AI", summary: "작업량, 근태와 건강 신호를 결합해 사고와 지연을 줄입니다.",
    modules: [...common("logistics"),
      { id: "logistics-demand", name: "작업량 예측", description: "입출고 추세로 시간대별 필요 인원을 예측합니다.", input: "WMS·근태·스케줄", impact: "초과근무 18% 감소", status: "review" },
      { id: "logistics-health", name: "근골격계 위험 탐지", description: "통증 설문과 작업시간 누적 패턴을 분석합니다.", input: "설문·근태·산재", impact: "고위험 조기발견", status: "active" },
      { id: "logistics-sla", name: "SLA 지연 예측", description: "결원과 작업량으로 마감 지연 가능성을 예측합니다.", input: "WMS·계약·근태", impact: "지연 15% 감소", status: "inactive" },
    ],
  },
  {
    industry: "생산", title: "생산 현장 안전 AI", summary: "공정 인력과 작업지시 변화를 추적해 안전한 운영을 지원합니다.",
    modules: [...common("production"),
      { id: "production-staff", name: "공정 인력 배치", description: "숙련도와 가동계획에 맞는 교대 배치를 추천합니다.", input: "MES·근태·자격", impact: "배치시간 45% 단축", status: "review" },
      { id: "production-safety", name: "안전 점검 AI", description: "점검 사진과 반복 위험 항목을 자동 판독합니다.", input: "사진·점검·산재", impact: "누락 60% 감소", status: "active" },
      { id: "production-order", name: "작업지시 변경 분석", description: "계약 외 지시와 잦은 공정 변경 신호를 탐지합니다.", input: "작업지시·계약·VOC", impact: "노무 리스크 조기탐지", status: "active" },
    ],
  },
  {
    industry: "리테일", title: "리테일 품질·비용 AI", summary: "점포별 품질, VOC와 비용 편차를 비교합니다.",
    modules: [...common("retail"),
      { id: "retail-staff", name: "시간대 인력 추천", description: "매출과 방문 추세에 맞춰 근무 인원을 추천합니다.", input: "POS·근태·스케줄", impact: "인건비 12% 절감", status: "review" },
      { id: "retail-voc", name: "고객 불만 분석", description: "점포별 불만 원인과 반복 이슈를 분류합니다.", input: "VOC·점검·매출", impact: "반복민원 25% 감소", status: "active" },
      { id: "retail-cost", name: "비용 이상 탐지", description: "점포 간 인건비·소모품 비용 편차를 감지합니다.", input: "ERP·급여·재고", impact: "이상비용 조기발견", status: "inactive" },
    ],
  },
  {
    industry: "공공", title: "공공 계약·민원 AI", summary: "SLA와 감사 근거를 자동 관리하고 민원 처리를 지원합니다.",
    modules: [...common("public"),
      { id: "public-sla", name: "계약·SLA 준수", description: "계약 조건과 현장 KPI를 대조해 위반 위험을 찾습니다.", input: "계약·ERP·점검", impact: "위반 사전예방", status: "active" },
      { id: "public-civil", name: "민원 자동 분류", description: "민원 유형, 기관과 긴급도를 분류합니다.", input: "민원·VOC·조치", impact: "배정시간 50% 단축", status: "review" },
      { id: "public-audit", name: "감사 보고서", description: "점검·조치 증빙을 감사 형식으로 자동 정리합니다.", input: "계약·점검·전자결재", impact: "감사준비 65% 단축", status: "active" },
    ],
  },
];

export const connectorStatus = [
  { name: "ERP", status: "정상", synced: "5분 전", coverage: 98 },
  { name: "급여", status: "정상", synced: "12분 전", coverage: 100 },
  { name: "근로계약", status: "정상", synced: "1시간 전", coverage: 96 },
  { name: "근태", status: "정상", synced: "방금", coverage: 99 },
  { name: "VOC", status: "지연", synced: "3시간 전", coverage: 84 },
  { name: "시설관리", status: "검토", synced: "연동 준비", coverage: 62 },
];

export function insightsFor(site: Site): AIInsight[] {
  const primary: AIInsight = site.status === "safety" ? {
    id: `${site.id}-safety`, title: "안전 위험 즉시 조치 필요", summary: "사진 점검에서 통로 적치와 미끄럼 위험이 반복 감지됐습니다.", severity: "critical", confidence: 91,
    evidence: [`안전등급 ${site.safetyGrade}`, `미처리 조치 ${site.openActions}건`, `최근 점검 ${site.lastInspection}`], action: "현장소장에게 제거 조치와 재촬영을 배정하세요.",
  } : site.status === "attendance" ? {
    id: `${site.id}-attendance`, title: "출근 결원 가능성", summary: "예정 인원 대비 GPS 출근 인증률이 낮습니다.", severity: "warning", confidence: 87,
    evidence: [`출근율 ${site.attendanceRate}%`, `근무인원 ${site.headcount}명`, "미인증 3명"], action: "가용 대체인력 2명을 확인하고 현장소장에게 배정하세요.",
  } : {
    id: `${site.id}-quality`, title: "운영 상태 안정", summary: "현재 핵심 KPI가 정상 범위에 있습니다.", severity: "info", confidence: 94,
    evidence: [`출근율 ${site.attendanceRate}%`, `설문 ${site.surveyRate}%`, `SLA ${site.sla}%`], action: "현재 운영을 유지하고 다음 정기점검을 진행하세요.",
  };
  return [primary, {
    id: `${site.id}-trend`, title: "주간 운영 추세 분석", summary: `${site.industry} 유사 현장 대비 SLA가 ${site.sla >= 90 ? "양호" : "낮은"} 수준입니다.`, severity: site.sla >= 90 ? "info" : "warning", confidence: 82,
    evidence: [`SLA ${site.sla}%`, `동종 현장 평균 91%`, `설문 응답 ${site.surveyRate}%`], action: site.sla >= 90 ? "우수 운영사례로 공유하세요." : "미달 KPI의 개선계획을 고객사와 공유하세요.",
  }];
}
