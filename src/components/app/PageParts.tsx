import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function KpiCard({ label, value, hint, icon: Icon, tone = "default" }: {
  label: string; value: string; hint?: string; icon: LucideIcon; tone?: "default" | "warning" | "success" | "danger";
}) {
  const toneCls = {
    default: "bg-accent text-accent-foreground",
    warning: "bg-warning/20 text-warning-foreground",
    success: "bg-success/15 text-success",
    danger: "bg-destructive/10 text-destructive",
  }[tone];
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", toneCls)}>
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

const statusTone: Record<string, string> = {
  Ativo: "bg-success/15 text-success",
  Aprovado: "bg-success/15 text-success",
  Concluído: "bg-success/15 text-success",
  Válido: "bg-success/15 text-success",
  Férias: "bg-info/10 text-info",
  "Em andamento": "bg-info/10 text-info",
  Experiência: "bg-accent text-accent-foreground",
  Afastado: "bg-warning/20 text-warning-foreground",
  Pendente: "bg-warning/20 text-warning-foreground",
  "A vencer": "bg-warning/20 text-warning-foreground",
  Vencido: "bg-destructive/10 text-destructive",
  "Não conectado": "bg-muted text-muted-foreground",
};

export function StatusPill({ value }: { value: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", statusTone[value] ?? "bg-muted text-muted-foreground")}>
      {value}
    </span>
  );
}
