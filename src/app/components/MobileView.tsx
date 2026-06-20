import { Smartphone } from "lucide-react";
import { PageHeader } from "./shared";
// 독립 실행형 모바일 시제품 HTML(브랜드 컬러 적용본)을 그대로 임베드한다.
import mobileHtml from "../../imports/pasted_text/samgu-one-platform.html?raw";

export function MobileView() {
  return (
    <div>
      <PageHeader
        title="모바일 시제품"
        subtitle="현장 직원 · 현장 소장 · 운영 매니저 3개 역할 화면 — 상단 역할 탭으로 전환됩니다"
        action={
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-[var(--brand-blue-soft)] text-[var(--brand-blue)]"
            style={{ fontSize: "0.75rem", fontWeight: 600 }}
          >
            <Smartphone className="size-3.5" /> 인터랙티브 데모
          </span>
        }
      />
      <div className="bg-card rounded-[var(--radius)] border border-border shadow-sm overflow-hidden">
        <iframe
          title="삼구 ONE 모바일 시제품"
          srcDoc={mobileHtml}
          className="w-full"
          style={{ height: "calc(100vh - 220px)", minHeight: 640, border: "none", display: "block" }}
        />
      </div>
    </div>
  );
}
