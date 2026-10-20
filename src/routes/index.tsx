import { createFileRoute, redirect } from "@tanstack/react-router";
import { Users, UserPlus, UserMinus, RefreshCw, CalendarX, Timer, Wallet, BellRing } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, KpiCard } from "@/components/app/PageParts";
import { DemoBadge } from "@/components/app/DemoBadge";
import { kpis, evolucaoMensal, alertas, brl } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useScope, useUnidadeLabel } from "@/lib/scope-context";
import { RestrictedNotice } from "@/components/app/RestrictedNotice";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { verificarTrocaSenha } from '@/lib/verificar-troca-senha'


const PERIODOS = [
  { id: "1", label: "Último mês", meses: 1 },
  { id: "3", label: "Últimos 3 meses", meses: 3 },
  { id: "6", label: "Últimos 6 meses", meses: 6 },
  { id: "12", label: "Últimos 12 meses", meses: 12 },
];

export const Route = createFileRoute("/")({
  loader: async () => {
  const resultado = await verificarTrocaSenha()

  if (!resultado.autenticado) {
    throw redirect({ to: '/login' })
  }

  if (resultado.precisaTrocar) {
    throw redirect({ to: '/trocar-senha' })
  }

  return resultado
},
  head: () => ({
    meta: [
      { title: "Dashboard executivo · Pessoas360" },
      { name: "description", content: "Indicadores de quadro, turnover, absenteísmo, horas extras e custo de pessoal da rede de lojas." },
      { property: "og:title", content: "Dashboard executivo · Pessoas360" },
      { property: "og:description", content: "Painel executivo de RH para redes de lojas." },
    ],
  }),
  component: Dashboard,
});

const sevCls = { alta: "bg-destructive", media: "bg-warning", baixa: "bg-info" };
const axis = { fontSize: 12, fill: "var(--muted-foreground)" };

function Dashboard() {
  const { perfil, lojas, lojasNoEscopo, lojaAtual, fatorDemo: f } = useScope();
  const unidade = useUnidadeLabel();
  const [periodo, setPeriodo] = useState("6");
  const meses = PERIODOS.find((p) => p.id === periodo)!.meses;

  if (!perfil.dadosPessoais) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard executivo" />
        <RestrictedNotice />
      </div>
    );
  }

  // DEMO: valores consolidados proporcionais ao quadro das lojas no escopo.
  // Futuro: uma função de servidor devolverá os agregados já filtrados pelo banco.
  const n = (v: number) => Math.max(0, Math.round(v * f));
  const evolucao = evolucaoMensal.slice(-Math.max(meses, 2)).map((m) => ({ ...m, admissoes: n(m.admissoes), desligamentos: n(m.desligamentos), custo: Math.round(m.custo * f) }));
  const doPeriodo = evolucao.slice(-meses);
  const lojasGrafico = lojas
    .filter((l) => lojasNoEscopo.includes(l.id))
    .map((l) => ({ loja: l.nome.replace(/^Loja /, ""), ativos: l.quadroDemo, horasExtras: l.horasExtrasDemo }));
  const alertasVisiveis = alertas
    .filter((a) => lojasNoEscopo.includes(a.lojaId))
    .map((a) => ({ ...a, detalhe: lojas.find((l) => l.id === a.lojaId)?.nome ?? "" }));
  const k = {
    quadroAtivo: lojasGrafico.reduce((s, l) => s + l.ativos, 0),
    admissoes: doPeriodo.reduce((s, m) => s + m.admissoes, 0),
    desligamentos: doPeriodo.reduce((s, m) => s + m.desligamentos, 0),
    horasExtras: lojasGrafico.reduce((s, l) => s + l.horasExtras, 0),
    custoPessoal: Math.round(kpis.custoPessoal * f),
    alertasPendentes: alertasVisiveis.length,
  };
  const periodoLabel = PERIODOS.find((p) => p.id === periodo)!.label.toLowerCase();

  return (
    <div className="space-y-6">
      <PageHeader
        unidade={unidade}
        title={lojaAtual ? `Dashboard · ${lojaAtual.nome}` : "Dashboard executivo"}
        description={lojaAtual ? "Indicadores da loja selecionada. Números fictícios, apenas para demonstração." : "Visão consolidada de todas as lojas. Números fictícios, apenas para demonstração."}
        actions={<>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="h-9 w-[180px]" aria-label="Período"><SelectValue /></SelectTrigger>
            <SelectContent>{PERIODOS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
          </Select>
          <DemoBadge />
        </>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Quadro ativo" value={String(k.quadroAtivo)} hint={lojaAtual ? lojaAtual.nome : `${lojasGrafico.length} lojas`} icon={Users} />
        <KpiCard label="Admissões" value={String(k.admissoes)} hint={periodoLabel} icon={UserPlus} tone="success" />
        <KpiCard label="Desligamentos" value={String(k.desligamentos)} hint={periodoLabel} icon={UserMinus} tone="danger" />
        <KpiCard label="Turnover" value={`${kpis.turnover.toLocaleString("pt-BR")}%`} hint="Mensal" icon={RefreshCw} />
        <KpiCard label="Absenteísmo" value={`${kpis.absenteismo.toLocaleString("pt-BR")}%`} icon={CalendarX} tone="warning" />
        <KpiCard label="Horas extras" value={`${k.horasExtras} h`} icon={Timer} tone="warning" />
        <KpiCard label="Custo de pessoal" value={brl(k.custoPessoal)} hint="Estimativa mensal" icon={Wallet} />
        <KpiCard label="Alertas pendentes" value={String(k.alertasPendentes)} icon={BellRing} tone="danger" />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Card className="self-start shadow-none lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Evolução do quadro e movimentações</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={288}>
              <BarChart data={evolucao}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="admissoes" name="Admissões" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="desligamentos" name="Desligamentos" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader><CardTitle className="text-base">Alertas pendentes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {alertasVisiveis.length === 0 && <p className="text-sm text-muted-foreground">Nenhum alerta para esta unidade.</p>}
            {alertasVisiveis.map((a) => (
              <div key={a.titulo + a.lojaId} className="flex gap-3 rounded-md border p-3">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", sevCls[a.severidade])} />
                <div>
                  <p className="text-sm font-medium">{a.titulo}</p>
                  <p className="text-xs text-muted-foreground">{a.detalhe}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader><CardTitle className="text-base">Custo de pessoal (R$ mil)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={256}>
              <AreaChart data={evolucao}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                <Tooltip />
                <Area type="monotone" dataKey="custo" name="Custo" stroke="var(--chart-1)" fill="var(--chart-3)" fillOpacity={0.35} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader><CardTitle className="text-base">{lojaAtual ? "Quadro e horas extras da loja" : "Quadro e horas extras por loja"}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={lojasGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="loja" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="ativos" name="Ativos" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="horasExtras" name="Horas extras" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
