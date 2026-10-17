import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, StatusPill } from "@/components/app/PageParts";
import { DemoBadge, FutureNotice } from "@/components/app/DemoBadge";
import { funcionarios, CARGOS, DEPARTAMENTOS, lojaVigente } from "@/lib/demo-data";
import { useScope, useUnidadeLabel } from "@/lib/scope-context";
import { RestrictedNotice } from "@/components/app/RestrictedNotice";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios · Pessoas360" },
      { name: "description", content: "Relatórios de RH com filtros por loja, período, cargo e departamento." },
      { property: "og:title", content: "Relatórios · Pessoas360" },
      { property: "og:description", content: "Relatórios de RH filtráveis por loja, período, cargo e departamento." },
    ],
  }),
  component: Relatorios,
});

const TODOS = "todos";

function Filtro({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todos</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function Relatorios() {
  const { perfil, lojas, lojasNoEscopo } = useScope();
  const unidade = useUnidadeLabel();
  const [cargo, setCargo] = useState(TODOS);
  const [dep, setDep] = useState(TODOS);
  const [periodo, setPeriodo] = useState("Outubro/2026");

  const rows = useMemo(() => funcionarios.filter((f) =>
    lojasNoEscopo.includes(lojaVigente(f) ?? "") && (cargo === TODOS || f.cargo === cargo) && (dep === TODOS || f.departamento === dep)), [lojasNoEscopo, cargo, dep]);

  if (!perfil.dadosPessoais) {
    return <div className="space-y-6"><PageHeader title="Relatórios" /><RestrictedNotice /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        unidade={unidade}
        title="Relatórios"
        description="A loja vem do seletor no topo. Filtre também por período, cargo e departamento."
        actions={<>
          <Button variant="outline" size="sm" disabled title="Exportação ainda não implementada"><FileDown /> PDF</Button>
          <Button variant="outline" size="sm" disabled title="Exportação ainda não implementada"><FileSpreadsheet /> Excel</Button>
        </>}
      />
      <Card className="shadow-none">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Período</p>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Outubro/2026", "Setembro/2026", "3º trimestre/2026", "Ano de 2026"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Filtro label="Cargo" value={cargo} onChange={setCargo} options={CARGOS} />
          <Filtro label="Departamento" value={dep} onChange={setDep} options={DEPARTAMENTOS} />
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <CardTitle className="text-base">Quadro de pessoal · {periodo}</CardTitle>
          <DemoBadge label="Demo" />
          <span className="ml-auto text-sm text-muted-foreground">{rows.length} registros</span>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Nome</TableHead><TableHead>Cargo</TableHead><TableHead>Loja</TableHead><TableHead>Departamento</TableHead><TableHead>Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rows.map((f) => (
                <TableRow key={f.matricula}>
                  <TableCell className="whitespace-nowrap">{f.nome}</TableCell><TableCell className="whitespace-nowrap">{f.cargo}</TableCell>
                  <TableCell className="whitespace-nowrap">{lojas.find((l) => l.id === lojaVigente(f))?.nome}</TableCell><TableCell>{f.departamento}</TableCell>
                  <TableCell><StatusPill value={f.status} /></TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Nenhum registro para os filtros escolhidos.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <FutureNotice>A exportação em PDF e Excel será gerada no servidor, respeitando as permissões do perfil (ex.: salários só para diretoria).</FutureNotice>
    </div>
  );
}
