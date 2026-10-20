
import { useState } from "react";
import {
  Palmtree,
  AlertTriangle,
  FileClock,
  CalendarX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader, KpiCard } from "@/components/app/PageParts";
import { useUnidadeLabel } from "@/lib/scope-context";

import ListaAntecipacoesFerias from "./ListaAntecipacoesFerias";
import SelecionarFuncionarioFerias from "./SelecionarFuncionarioFerias";
import PeriodosFeriasFuncionario from "./PeriodosFeriasFuncionario";

type AbaFerias = "programacao" | "antecipacoes" | "afastamentos";

export default function PaginaGestaoFerias() {
  const [aba, setAba] = useState<AbaFerias>("programacao");
  const [novaSolicitacao, setNovaSolicitacao] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] =
    useState<string | null>(null);

  const unidade = useUnidadeLabel();

  function fecharFormulario() {
    setNovaSolicitacao(false);
    setFuncionarioSelecionado(null);
  }

  function mudarAba(novaAba: AbaFerias) {
    setAba(novaAba);
    fecharFormulario();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Férias e afastamentos"
        description="Programação de férias, períodos aquisitivos e afastamentos médicos ou legais."
        unidade={unidade}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Em férias agora"
          value="—"
          icon={Palmtree}
        />

        <KpiCard
          label="Férias vencidas"
          value="—"
          icon={AlertTriangle}
          tone="danger"
        />

        <KpiCard
          label="A vencer em 60 dias"
          value="—"
          icon={FileClock}
          tone="warning"
        />

        <KpiCard
          label="Afastados"
          value="—"
          icon={CalendarX}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={aba === "programacao" ? "default" : "outline"}
          onClick={() => mudarAba("programacao")}
        >
          Programação de férias
        </Button>

        <Button
          type="button"
          variant={aba === "antecipacoes" ? "default" : "outline"}
          onClick={() => mudarAba("antecipacoes")}
        >
          Antecipação de férias
        </Button>

        <Button
          type="button"
          variant={aba === "afastamentos" ? "default" : "outline"}
          onClick={() => mudarAba("afastamentos")}
        >
          Afastamentos
        </Button>
      </div>

      {aba === "programacao" && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              Programação de férias
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              A programação de férias será conectada aos períodos
              aquisitivos cadastrados no Supabase.
            </p>
          </CardContent>
        </Card>
      )}

      {aba === "antecipacoes" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                Antecipação de férias
              </h2>

              <p className="text-sm text-muted-foreground">
                Solicitações de antecipação e acompanhamento pelo RH.
              </p>
            </div>

            <Button
              type="button"
              className="font-semibold"
              onClick={() => {
                if (novaSolicitacao) {
                  fecharFormulario();
                } else {
                  setNovaSolicitacao(true);
                }
              }}
            >
              {novaSolicitacao
                ? "Cancelar nova solicitação"
                : "+ Nova solicitação"}
            </Button>
          </div>

          {novaSolicitacao && (
            <Card className="shadow-none">
              <CardContent className="pt-6">
                {!funcionarioSelecionado ? (
                  <SelecionarFuncionarioFerias
                    onSelecionar={(funcionarioId) => {
                      setFuncionarioSelecionado(funcionarioId);
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFuncionarioSelecionado(null)}
                    >
                      ← Trocar funcionário
                    </Button>

                    <PeriodosFeriasFuncionario
                      funcionarioId={funcionarioSelecionado}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <ListaAntecipacoesFerias />

          <p className="text-sm text-amber-700">
            Solicitações de antecipação dependem de análise
            jurídica e aprovação. Nenhum dia será descontado
            automaticamente do saldo de férias.
          </p>
        </div>
      )}

      {aba === "afastamentos" && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">
              Afastamentos
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              O cadastro e acompanhamento dos afastamentos
              serão implementados em uma etapa posterior.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
