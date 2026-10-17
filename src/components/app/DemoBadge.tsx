import { FlaskConical } from "lucide-react";

export function DemoBadge({ label = "Dados de demonstração" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning/15 px-2.5 py-1 text-xs font-medium text-warning-foreground">
      <FlaskConical className="size-3.5" />
      {label}
    </span>
  );
}

export function FutureNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-info/40 bg-info/5 p-4 text-sm text-foreground">
      <p className="font-semibold text-info">Em preparação</p>
      <p className="mt-1 text-muted-foreground">{children}</p>
    </div>
  );
}
