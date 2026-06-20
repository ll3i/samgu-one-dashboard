import { useEffect, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export type ReportType = "daily" | "inspection-results";

const REPORT_DATE = "2026-06-17";

const inspections = [
  ["강서 사업장 B1", "박소장", "58", "C", "소화기 적치·미끄럼 위험", "즉시 조치"],
  ["코엑스 3F", "이소장", "81", "B", "정돈 상태 개선 필요", "확인 중"],
  ["삼성생명 A동 2F", "최소장", "96", "A", "이상 없음", "완료"],
  ["판교 물류센터 1F", "정소장", "92", "A", "이상 없음", "완료"],
];

function Grade({ value }: { value: string }) {
  const color = value === "A" ? "#3f8f48" : value === "B" ? "#2d6cdf" : "#d64545";
  return <span style={{ color, fontWeight: 800 }}>{value}</span>;
}

function ReportPage({ type }: { type: ReportType }) {
  const daily = type === "daily";
  return (
    <article
      data-report-page
      style={{
        width: 794,
        minHeight: 1123,
        padding: "58px 62px",
        background: "#fff",
        color: "#20262e",
        fontFamily: "Pretendard, 'Malgun Gothic', sans-serif",
        boxSizing: "border-box",
      }}
    >
      <header style={{ borderBottom: "3px solid #35373a", paddingBottom: 22, marginBottom: 28 }}>
        <div style={{ color: "#78be20", fontSize: 14, fontWeight: 800, letterSpacing: 1 }}>SAMGU ONE</div>
        <h1 style={{ margin: "8px 0 5px", fontSize: 30, lineHeight: 1.25 }}>
          {daily ? "일일 안전·미화 보고서" : "현장 점검 결과보고서"}
        </h1>
        <p style={{ margin: 0, color: "#667085", fontSize: 13 }}>
          기준일 {REPORT_DATE} · 수도권 142개 현장 · AI 분석 1,486장
        </p>
      </header>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, margin: "0 0 14px" }}>{daily ? "오늘의 운영 요약" : "점검 결과 요약"}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            ["점검 사진", "1,486장"],
            ["평균 등급", "B+"],
            ["C등급 현장", "143곳"],
            ["미점검 현장", "14곳"],
          ].map(([label, value]) => (
            <div key={label} style={{ border: "1px solid #dfe4ea", borderRadius: 10, padding: "14px 12px" }}>
              <div style={{ color: "#667085", fontSize: 11 }}>{label}</div>
              <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800 }}>{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, margin: "0 0 12px" }}>{daily ? "등급 분포 및 주요 알림" : "현장별 판독 결과"}</h2>
        {daily ? (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 15 }}>
              {[["A", "612곳", "#3f8f48"], ["B", "731곳", "#2d6cdf"], ["C", "143곳", "#d64545"]].map(([g, count, color]) => (
                <div key={g} style={{ flex: 1, padding: 12, background: `${color}12`, borderLeft: `4px solid ${color}`, borderRadius: 7 }}>
                  <b style={{ color }}>{g}등급</b><span style={{ float: "right", fontWeight: 700 }}>{count}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff1f1", border: "1px solid #f2c5c5", borderRadius: 9, padding: 14, fontSize: 13, lineHeight: 1.6 }}>
              <b>즉시 확인:</b> 강서 사업장 B1에서 소화기 적치 불량과 바닥 미끄럼 위험이 감지되었습니다. 현장 소장에게 조치 요청을 발송했습니다.
            </div>
          </>
        ) : null}

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: daily ? 18 : 0, fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#f3f5f7" }}>
              {(["현장", "점검자", "점수", "등급", "AI 판독", "조치 상태"] as const).map((h) => (
                <th key={h} style={{ padding: "10px 8px", textAlign: "left", borderBottom: "1px solid #dfe4ea" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inspections.map((row) => (
              <tr key={row[0]}>
                {row.map((value, index) => (
                  <td key={index} style={{ padding: "11px 8px", borderBottom: "1px solid #e7eaee" }}>
                    {index === 3 ? <Grade value={value} /> : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, margin: "0 0 12px" }}>{daily ? "AI 권고사항" : "후속 조치 및 보고서 상태"}</h2>
        <ol style={{ margin: 0, paddingLeft: 22, fontSize: 13, lineHeight: 1.8 }}>
          <li>강서 사업장 C등급 항목은 금일 중 조치 후 사진을 재등록합니다.</li>
          <li>미점검 14개 현장은 18시 마감 전에 현장 소장에게 재알림합니다.</li>
          <li>{daily ? "주간 등급 추세에서 B·C등급 반복 현장을 우선 실사합니다." : "조치 전·후 판독 결과를 고객사 공유본에 포함합니다."}</li>
        </ol>
      </section>

      <footer style={{ marginTop: 40, paddingTop: 14, borderTop: "1px solid #dfe4ea", color: "#7a8491", fontSize: 10, lineHeight: 1.6 }}>
        본 문서는 삼구 ONE 시제품의 예시 데이터를 기반으로 자동 생성되었습니다.<br />
        출처: 현장 사진 AI 판독 · 안전등급 집계 · 조치 상태 기록
      </footer>
    </article>
  );
}

export function ReportPreviewDialog({
  type,
  open,
  onOpenChange,
}: {
  type: ReportType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.75);
  const daily = type === "daily";

  useEffect(() => {
    if (!open) return;
    const resize = () => {
      const heightScale = (window.innerHeight - 210) / 1123;
      const widthScale = (window.innerWidth - 80) / 794;
      setPreviewScale(Math.max(0.42, Math.min(0.9, heightScale, widthScale)));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [open]);

  const downloadPdf = async () => {
    if (!reportRef.current || downloading) return;
    setDownloading(true);
    let captureRoot: HTMLDivElement | null = null;
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const page = reportRef.current.querySelector<HTMLElement>("[data-report-page]");
      if (!page) throw new Error("보고서 페이지를 찾을 수 없습니다.");

      // 미리보기에는 화면 맞춤 transform이 적용되어 있으므로 PDF는 원본 A4 크기의
      // 독립 복제본을 캡처한다. 조상 transform의 영향을 받으면 한글 줄바꿈과 셀 폭이 틀어진다.
      captureRoot = document.createElement("div");
      Object.assign(captureRoot.style, {
        position: "fixed",
        left: "-10000px",
        top: "0",
        width: "794px",
        height: "1123px",
        overflow: "hidden",
        background: "#ffffff",
        zIndex: "-1",
      });
      const capturePage = page.cloneNode(true) as HTMLElement;
      capturePage.style.transform = "none";
      capturePage.style.width = "794px";
      capturePage.style.minWidth = "794px";
      capturePage.style.height = "1123px";
      capturePage.style.minHeight = "1123px";
      captureRoot.appendChild(capturePage);
      document.body.appendChild(captureRoot);

      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      const canvas = await html2canvas(capturePage, {
        scale: 2,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: "#ffffff",
        useCORS: false,
        logging: false,
      });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const image = canvas.toDataURL("image/png");
      pdf.addImage(image, "PNG", 0, 0, 210, 297, undefined, "FAST");
      const filename = daily
        ? `samgu-one-daily-report-${REPORT_DATE}.pdf`
        : `samgu-one-inspection-results-${REPORT_DATE}.pdf`;
      pdf.save(filename);
      toast.success("PDF 보고서를 생성했습니다.");
    } catch (error) {
      console.error(error);
      toast.error("PDF 생성에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      captureRoot?.remove();
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[96vh] w-[calc(100vw-2rem)] max-w-[1100px] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-5">
        <DialogHeader>
          <DialogTitle>{daily ? "일일 보고서 미리보기" : "결과보고서 미리보기"}</DialogTitle>
          <DialogDescription>내용을 확인한 뒤 PDF로 다운로드할 수 있습니다.</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 items-start justify-center overflow-auto rounded-lg bg-muted p-4">
          <div
            className="shrink-0"
            style={{ width: 794 * previewScale, height: 1123 * previewScale }}
          >
            <div
              ref={reportRef}
              className="w-[794px] origin-top-left shadow-lg"
              style={{ transform: `scale(${previewScale})` }}
            >
              <ReportPage type={type} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={downloading}>취소</Button>
          <Button onClick={downloadPdf} disabled={downloading} className="bg-[var(--brand-navy)] hover:bg-[var(--brand-navy)]/90">
            {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {downloading ? "PDF 생성 중…" : "PDF 다운로드"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
