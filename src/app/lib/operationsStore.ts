export type BidStage = "발굴" | "검토" | "제안 준비" | "입찰 제출" | "낙찰" | "탈락";

export interface BidNotice {
  id: string; agency: string; title: string; region: string; amount: number;
  deadline: string; url: string; period: string; industry: string;
}

export interface BidAnalysis {
  fit: number; recommendation: "참여 추천" | "조건부 검토" | "참여 비추천";
  requirements: string[]; risks: string[]; labor: number; overhead: number;
  supplies: number; targetBid: number; margin: number; confidence: number; rationale: string;
}

export interface BidOpportunity extends BidNotice {
  stage: BidStage; owner: string; readiness: number; documents: string[];
  analysis: BidAnalysis; approvedBy?: string; approvedAt?: string;
}

export interface Contract {
  id: string; opportunityId: string; client: string; site: string; amount: number;
  start: string; end: string; sla: number; headcount: number;
  expectedLabor: number; expectedOvertime: number; expectedSupplies: number; expectedFacility: number;
  actualLabor: number; actualOvertime: number; actualSupplies: number; actualFacility: number;
}

export interface Asset {
  id: string; site: string; name: string; type: string; location: string; owner: string;
  status: "정상" | "점검 필요" | "고장"; inspectionCycle: number; lastInspection: string;
  warrantyEnd: string; risk: number; replacement: string;
}

export interface MaintenanceOrder {
  id: string; assetId: string; symptom: string; risk: "낮음" | "보통" | "높음";
  owner: string; due: string; cost: number; status: "대기" | "진행" | "완료";
  createdAt: string;
}

export type VocChannel = "전화" | "이메일" | "앱" | "고객 포털";
export type VocStatus = "접수" | "분석 완료" | "담당 배정" | "처리 중" | "고객 확인" | "종료";
export interface VocTicket {
  id: string; channel: VocChannel; client: string; site: string; title: string; content: string;
  category: "미화" | "시설" | "안전" | "근태" | "서비스"; urgency: "일반" | "주의" | "긴급";
  sentiment: "긍정" | "중립" | "부정"; status: VocStatus; owner: string; receivedAt: string;
  responseDue: string; resolutionDue: string; confidence: number; repeated: boolean; evidence: string[];
  recommendation: string; linkedModule?: string; linkedOrderId?: string; cost?: number;
  responseDraft?: string; responseApprovedBy?: string; responseSentAt?: string; satisfaction?: number;
}

export interface OperationsState { opportunities: BidOpportunity[]; contracts: Contract[]; assets: Asset[]; orders: MaintenanceOrder[]; vocTickets: VocTicket[] }

const seed: OperationsState = {
  opportunities: [],
  contracts: [{
    id: "contract-1", opportunityId: "seed", client: "한국스마트물류", site: "김포 스마트물류센터",
    amount: 1480000000, start: "2026-01-01", end: "2026-12-31", sla: 96, headcount: 42,
    expectedLabor: 920000000, expectedOvertime: 78000000, expectedSupplies: 61000000, expectedFacility: 42000000,
    actualLabor: 465000000, actualOvertime: 47000000, actualSupplies: 35000000, actualFacility: 31000000,
  }],
  assets: [
    { id: "asset-1", site: "김포 스마트물류센터", name: "화물용 승강기 2호", type: "승강설비", location: "B동 출하장", owner: "박정호", status: "고장", inspectionCycle: 30, lastInspection: "2026-05-12", warrantyEnd: "2026-08-31", risk: 91, replacement: "즉시 정밀진단 후 2026년 3분기 교체" },
    { id: "asset-2", site: "강서 사업장", name: "냉난방기 AHU-03", type: "공조설비", location: "3층 기계실", owner: "이현수", status: "점검 필요", inspectionCycle: 90, lastInspection: "2026-03-10", warrantyEnd: "2026-07-15", risk: 76, replacement: "베어링 교체 후 6개월 추적 관찰" },
    { id: "asset-3", site: "용인 반도체사업장", name: "보행식 청소장비", type: "미화장비", location: "1층 장비실", owner: "최서윤", status: "정상", inspectionCycle: 30, lastInspection: "2026-06-10", warrantyEnd: "2027-11-30", risk: 18, replacement: "2028년 교체 권장" },
  ],
  orders: [{ id: "order-1", assetId: "asset-1", symptom: "운행 중 진동 및 정지 오류 반복", risk: "높음", owner: "박정호", due: "2026-06-21", cost: 4200000, status: "진행", createdAt: "2026-06-18" }],
  vocTickets: [
    { id: "VOC-260620-018", channel: "고객 포털", client: "한국스마트물류", site: "김포 스마트물류센터", title: "화물용 승강기 반복 정지", content: "B동 승강기가 오늘 세 차례 멈췄습니다. 출하 일정에 영향이 있어 긴급 확인 바랍니다.", category: "시설", urgency: "긴급", sentiment: "부정", status: "분석 완료", owner: "박정호", receivedAt: "2026-06-20T14:18:00+09:00", responseDue: "2026-06-20T14:48:00+09:00", resolutionDue: "2026-06-20T18:18:00+09:00", confidence: 96, repeated: true, evidence: ["승강기·정지 키워드", "최근 7일 동일 민원 2건", "출하 일정 영향 표현"], recommendation: "시설 긴급 작업지시를 발행하고 30분 내 1차 회신하세요." },
    { id: "VOC-260620-017", channel: "이메일", client: "삼구FS", site: "강서 사업장", title: "로비 바닥 미끄럼 재발", content: "우천 시 로비 바닥이 다시 미끄럽습니다. 안전표지와 수시 점검을 요청합니다.", category: "안전", urgency: "주의", sentiment: "부정", status: "담당 배정", owner: "이현아", receivedAt: "2026-06-20T13:42:00+09:00", responseDue: "2026-06-20T14:42:00+09:00", resolutionDue: "2026-06-20T17:42:00+09:00", confidence: 92, repeated: true, evidence: ["미끄럼 위험 표현", "동일 구역 반복", "안전표지 요청"], recommendation: "현장 안전점검과 완료 사진 재촬영을 배정하세요.", linkedModule: "현장 AI 안전·미화" },
    { id: "VOC-260620-016", channel: "앱", client: "대한물류", site: "판교 물류센터", title: "오후 미화 품질 개선 요청", content: "15시 이후 공용구역 쓰레기통 정리가 늦습니다.", category: "미화", urgency: "일반", sentiment: "중립", status: "처리 중", owner: "김대영", receivedAt: "2026-06-20T11:20:00+09:00", responseDue: "2026-06-20T13:20:00+09:00", resolutionDue: "2026-06-21T11:20:00+09:00", confidence: 89, repeated: false, evidence: ["공용구역 미화", "시간대 지정", "개선 요청"], recommendation: "15시 순회 미화 일정을 추가하고 3일간 품질점수를 추적하세요.", linkedModule: "현장 AI 안전·미화" },
    { id: "VOC-260620-015", channel: "전화", client: "한빛자산", site: "시그니처타워", title: "방문객 안내 응대 지연", content: "점심시간 안내데스크 연결이 오래 걸렸습니다.", category: "서비스", urgency: "일반", sentiment: "부정", status: "고객 확인", owner: "정수진", receivedAt: "2026-06-20T09:05:00+09:00", responseDue: "2026-06-20T11:05:00+09:00", resolutionDue: "2026-06-20T15:05:00+09:00", confidence: 86, repeated: false, evidence: ["응대 지연", "점심시간", "안내데스크"], recommendation: "점심 교대시간을 조정하고 안내데스크 응답 목표를 점검하세요.", responseDraft: "고객님, 안내데스크 응대 지연을 확인하여 점심 교대 인력을 보강했습니다. 불편을 드려 죄송합니다.", responseApprovedBy: "정수진 매니저", responseSentAt: "2026-06-20T13:40:00+09:00" },
  ],
};

const KEY = "samkoo-operations-v1";
const cloneSeed = () => JSON.parse(JSON.stringify(seed)) as OperationsState;
export function readOperations(): OperationsState {
  try { const saved = localStorage.getItem(KEY); if (!saved) return cloneSeed(); const parsed = JSON.parse(saved); return { ...cloneSeed(), ...parsed, vocTickets: parsed.vocTickets ?? cloneSeed().vocTickets }; }
  catch { return cloneSeed(); }
}
export function writeOperations(next: OperationsState) {
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("operations-change"));
}
export const won = (value: number) => `${Math.round(value / 10000).toLocaleString("ko-KR")}만원`;
export const contractCosts = (c: Contract, actual = false) => actual
  ? c.actualLabor + c.actualOvertime + c.actualSupplies + c.actualFacility
  : c.expectedLabor + c.expectedOvertime + c.expectedSupplies + c.expectedFacility;
