import { createFileRoute } from "@tanstack/react-router";
import { Users, UserPlus, UserMinus, RefreshCw, CalendarX, Timer, Wallet, BellRing } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, KpiCard } from "@/components/app/PageParts";
import { DemoBadge } from "@/components/app/DemoBadge";
import { kpis, evolucaoMensal, quadroPorLoja, alertas, brl } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { useLoja, TODAS_LOJAS } from "@/lib/loja-context";

const totalAtivos = quadroPorLoja.reduce((a, l) => a + l.ativos, 0);

export const Route = createFileRoute("/")({
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
  const { loja } = useLoja();
  const adm = loja === TODAS_LOJAS;
  const dadosLoja = quadroPorLoja.find((l) => `Loja ${l.loja}` === loja);
  // Demo: indicadores da loja proporcionais ao seu quadro.
  const f = adm || !dadosLoja ? 1 : dadosLoja.ativos / totalAtivos;
  const n = (v: number) => Math.max(0, Math.round(v * f));
  const k = {
    quadroAtivo: adm ? kpis.quadroAtivo : dadosLoja?.ativos ?? 0,
    admissoesMes: n(kpis.admissoesMes),
    desligamentosMes: n(kpis.desligamentosMes),
    horasExtras: adm ? kpis.horasExtras : dadosLoja?.horasExtras ?? 0,
    custoPessoal: Math.round(kpis.custoPessoal * f),
    alertasPendentes: n(kpis.alertasPendentes),
  };
  const evolucao = evolucaoMensal.map((m) => ({ ...m, admissoes: n(m.admissoes), desligamentos: n(m.desligamentos), custo: Math.round(m.custo * f) }));
  const lojasGrafico = adm ? quadroPorLoja : quadroPorLoja.filter((l) => l === dadosLoja);
  const alertasVisiveis = adm ? alertas : alertas.slice(0, Math.min(alertas.length, k.alertasPendentes)).map((a) => ({ ...a, detalhe: loja }));
  return (
    <div className="space-y-6">
      <PageHeader
        title={adm ? "Dashboard executivo" : `Dashboard · ${loja}`}
        description={adm ? "Modo adm: visão consolidada de todas as lojas. Números fictícios, apenas para demonstração." : "Visão da loja selecionada. Números fictícios, apenas para demonstração."}
        actions={<DemoBadge />}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Quadro ativo" value={String(k.quadroAtivo)} hint={adm ? `${quadroPorLoja.length} lojas` : loja} icon={Users} />
        <KpiCard label="Admissões no mês" value={String(k.admissoesMes)} icon={UserPlus} tone="success" />
        <KpiCard label="Desligamentos no mês" value={String(k.desligamentosMes)} icon={UserMinus} tone="danger" />
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
            {alertasVisiveis.map((a) => (
              <div key={a.titulo} className="flex gap-3 rounded-md border p-3">
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
          <CardHeader><CardTitle className="text-base">{adm ? "Quadro e horas extras por loja" : "Quadro e horas extras da loja"}</CardTitle></CardHeader>
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
