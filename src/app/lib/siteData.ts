export type SiteStatus = "normal" | "attendance" | "safety" | "labor" | "unreported";
export type SafetyGrade = "A" | "B" | "C";

export type Site = {
  id: string;
  name: string;
  address: string;
  region: string;
  client: string;
  manager: string;
  industry: string;
  lat: number;
  lng: number;
  headcount: number;
  attendanceRate: number;
  surveyRate: number;
  safetyGrade: SafetyGrade;
  status: SiteStatus;
  alerts: string[];
  openActions: number;
  sla: number;
  geofenceRadius: number;
  lastInspection: string;
};

const bases = [
  ["서울", 37.5665, 126.978, ["시그니처타워", "강서 사업장", "코엑스", "삼성생명 A동", "여의도 센터", "상암 DMC"]],
  ["경기", 37.3943, 127.1112, ["판교 물류센터", "광교 업무단지", "김포 허브", "평택 생산동", "수원 R&D센터", "고양 복합몰"]],
  ["인천", 37.4563, 126.7052, ["송도 컨벤시아", "인천공항 T1", "남동산단", "청라 물류동"]],
  ["충청", 36.3504, 127.3845, ["대전 연구단지", "천안 생산센터", "청주 물류센터", "세종 정부청사"]],
  ["영남", 35.1796, 129.0756, ["부산 센텀센터", "울산 생산동", "창원 산업단지", "대구 유통센터"]],
  ["호남", 35.1595, 126.8526, ["광주 첨단센터", "전주 생산동", "여수 산업단지", "목포 물류센터"]],
] as const;

const clients = ["삼구FS", "에스원", "한빛자산", "코리아리테일", "대한물류"];
const managers = ["김대영", "박정수", "이현아", "최민석", "정수진"];
const industries = ["오피스", "물류", "생산", "리테일", "공공"];
const statuses: SiteStatus[] = ["normal", "normal", "normal", "attendance", "safety", "labor", "unreported"];

export const sites: Site[] = bases.flatMap(([region, lat, lng, names], regionIndex) =>
  names.map((name, index) => {
    const n = regionIndex * 7 + index;
    const status = statuses[n % statuses.length];
    const safetyGrade: SafetyGrade = status === "safety" ? "C" : n % 4 === 0 ? "B" : "A";
    const alerts = status === "normal" ? [] : [
      status === "attendance" ? "GPS 출근 미인증 3명" :
      status === "safety" ? "소화기 통로 적치·미끄럼 위험" :
      status === "labor" ? "근골격계 통증 응답 증가" : "일일 점검 미보고",
    ];
    return {
      id: `site-${n + 1}`,
      name,
      address: `${region} ${name} 운영 현장`,
      region,
      client: clients[n % clients.length],
      manager: managers[n % managers.length],
      industry: industries[n % industries.length],
      lat: lat + ((index % 3) - 1) * 0.055 + regionIndex * 0.002,
      lng: lng + ((index % 4) - 1.5) * 0.06,
      headcount: 18 + (n * 17) % 142,
      attendanceRate: status === "attendance" ? 82 + (n % 6) : 94 + (n % 6),
      surveyRate: status === "labor" ? 61 + (n % 8) : 82 + (n % 16),
      safetyGrade,
      status,
      alerts,
      openActions: status === "normal" ? 0 : 1 + (n % 3),
      sla: status === "normal" ? 96 + (n % 4) : 78 + (n % 16),
      geofenceRadius: 100 + (n % 4) * 50,
      lastInspection: `${String(7 + (n % 4)).padStart(2, "0")}:${String((n * 7) % 60).padStart(2, "0")}`,
    };
  }),
);

export const STATUS_META: Record<SiteStatus, { label: string; color: string; soft: string }> = {
  normal: { label: "정상", color: "#3f8f48", soft: "#e9f6eb" },
  attendance: { label: "근태 이상", color: "#d99016", soft: "#fff4dc" },
  safety: { label: "안전 위험", color: "#d64545", soft: "#fdeaea" },
  labor: { label: "노무 신호", color: "#7c5ce0", soft: "#eeeafd" },
  unreported: { label: "미보고", color: "#64748b", soft: "#eef1f5" },
};
