import type { BidAnalysis, BidNotice } from "./operationsStore";

export function g2bNoticeUrl(noticeNo: string, order = "000") {
  const [rawNo, rawOrder] = noticeNo.split("-");
  return `https://www.g2b.go.kr/link/PNPE027_01/single/?bidPbancNo=${encodeURIComponent(rawNo)}&bidPbancOrd=${encodeURIComponent(rawOrder || order)}`;
}

export const sampleNotices: BidNotice[] = [
  { id: "R26BK01593335-000", agency: "서울올림픽기념국민체육진흥공단 경륜경정총괄본부", title: "서울올림픽기념 마라톤대회 운영 대행 용역(긴급)", region: "서울", amount: 120000000, deadline: "2026-07-07 10:00", url: g2bNoticeUrl("R26BK01593335-000"), period: "공고문 참조", industry: "일반용역·행사운영" },
  { id: "R25BK00631114-000", agency: "한국공항공사", title: "물류시설 특수경비 및 출입관리 용역", region: "인천", amount: 2460000000, deadline: "2026-06-30 14:00", url: g2bNoticeUrl("R25BK00631114-000"), period: "착수일로부터 24개월", industry: "경비·인력운영" },
  { id: "R25BK00611875-000", agency: "경기도경제과학진흥원", title: "산업단지 통합 시설·주차 운영 용역", region: "경기", amount: 870000000, deadline: "2026-07-02 11:00", url: g2bNoticeUrl("R25BK00611875-000"), period: "2026.09~2027.08", industry: "시설관리" },
  { id: "R26BK01593367-000", agency: "제주특별자치도", title: "2026년도 제주특별자치도 중요 종이기록물 DB구축(수의시담)", region: "제주", amount: 0, deadline: "2026-06-22 12:00", url: g2bNoticeUrl("R26BK01593367-000"), period: "공고문 참조", industry: "일반용역·DB구축" },
];

export function analyzeNotice(notice: BidNotice): BidAnalysis {
  const strongRegion = ["서울", "경기", "인천"].includes(notice.region);
  const fit = Math.min(96, 72 + (strongRegion ? 12 : 2) + (notice.amount >= 1_000_000_000 ? 5 : 0));
  const labor = Math.round(notice.amount * 0.66);
  const overhead = Math.round(notice.amount * 0.07);
  const supplies = Math.round(notice.amount * 0.05);
  const targetBid = Math.round(notice.amount * 0.91);
  const margin = targetBid - labor - overhead - supplies;
  return {
    fit, recommendation: fit >= 85 ? "참여 추천" : fit >= 70 ? "조건부 검토" : "참여 비추천",
    requirements: ["관련 용역 수행실적", "업종 등록 및 사업자등록", "현장 책임자 배치", "입찰보증서"],
    risks: strongRegion ? ["예상 인원 확약서 사전 확보 필요"] : ["지역 제한 충족 여부 확인", "예상 인원 확약서 사전 확보 필요"],
    labor, overhead, supplies, targetBid, margin, confidence: 87,
    rationale: `수행실적 4건, ${notice.region} 운영권역, ${notice.industry} 등록정보와 예상 투입인원을 비교했습니다.`,
  };
}
