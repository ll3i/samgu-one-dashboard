import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function Topbar({ onMenu }: { onMenu?: () => void }) {
  return (
    <header className="h-16 shrink-0 bg-card border-b border-border flex items-center gap-4 px-5">
      <button onClick={onMenu} className="lg:hidden size-9 rounded-lg grid place-items-center hover:bg-muted">
        <Menu className="size-5" />
      </button>

      <div className="hidden md:flex items-center gap-2 h-10 px-3.5 rounded-lg bg-input-background w-[340px] max-w-full">
        <Search className="size-4 text-muted-foreground" />
        <input
          placeholder="현장·직원·점검 검색"
          className="bg-transparent outline-none flex-1 placeholder:text-muted-foreground"
          style={{ fontSize: "0.875rem" }}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-[var(--success-soft)] text-[var(--success)]"
          style={{ fontSize: "0.75rem", fontWeight: 600 }}
        >
          <span className="size-1.5 rounded-full bg-[var(--success)] animate-pulse" />
          실시간 데이터 수집 중
        </span>

        <button className="relative size-10 rounded-lg grid place-items-center hover:bg-muted">
          <Bell className="size-[18px]" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-[var(--danger)] ring-2 ring-card" />
        </button>

        <button className="flex items-center gap-2 h-10 pl-1.5 pr-2.5 rounded-lg hover:bg-muted">
          <Avatar className="size-7">
            <AvatarFallback className="bg-[var(--brand-navy)] text-white" style={{ fontSize: "0.75rem" }}>
              김
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-left leading-tight">
            <span className="block" style={{ fontSize: "0.8125rem", fontWeight: 600 }}>
              김운영 매니저
            </span>
            <span className="block text-muted-foreground" style={{ fontSize: "0.6875rem" }}>
              수도권 142개 현장 담당
            </span>
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
