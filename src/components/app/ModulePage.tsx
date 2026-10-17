import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PageHeader, KpiCard, StatusPill } from "./PageParts";
import { DemoBadge, FutureNotice } from "./DemoBadge";

export type Column = { key: string; label: string; status?: boolean; align?: "right" };
export type ModuleKpi = { label: string; value: string; hint?: string; icon: LucideIcon; tone?: "default" | "warning" | "success" | "danger" };

/** Página genérica de módulo: KPIs, tabela filtrável e aviso de etapas futuras. */
export function ModulePage({ title, description, kpis = [], tableTitle, columns, rows, future, actions }: {
  title: string; description: string; kpis?: ModuleKpi[]; tableTitle: string;
  columns: Column[]; rows: Record<string, string>[]; future?: string; actions?: string[];
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => rows.filter((r) => Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase())),
    [rows, q],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={actions?.map((a) => (
          <Button key={a} variant="outline" size="sm" disabled title="Disponível em etapa futura">{a}</Button>
        ))}
      />
      {kpis.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
        </div>
      )}
      <Card className="shadow-none">
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">{tableTitle}</CardTitle>
            <DemoBadge label="Demo" />
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.key} className={c.align === "right" ? "text-right" : ""}>{c.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, i) => (
                <TableRow key={i}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.align === "right" ? "text-right tabular-nums" : "whitespace-nowrap"}>
                      {c.status ? <StatusPill value={r[c.key] ?? ""} /> : r[c.key] ?? ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">Nenhum registro encontrado.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {future && <FutureNotice>{future}</FutureNotice>}
    </div>
  );
}
