
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useScope } from "@/lib/scope-context";

type Situacao = "ativo" | "afastado" | "desligado";

type Funcionario = {
  id: string;
  employee_code: string;
  full_name: string;
  job_title: string | null;
  store_id: string;
  status: Situacao;
  admission_date: string | null;
  termination_date: string | null;
};

type Historico = {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  effective_date: string;
  reason: string;
  recorded_at: string;
};

type Props = {
  funcionarioId: string;
  onAtualizado?: () => void;
};

function formatarData(data: string | null) {
  if (!data) return "—";

  const partes = data.slice(0, 10).split("-");

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

const nomesCampos: Record<string, string> = {
  full_name: "Nome",
  employee_code: "Matrícula",
  job_title: "Cargo",
  store_id: "Loja",
  status: "Situação",
  admission_date: "Admissão",
  termination_date: "Desligamento",
};

export function EditarDadosFuncionario({
  funcionarioId,
  onAtualizado,
}: Props) {
  const { lojas } = useScope();

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [matricula, setMatricula] = useState("");
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [lojaId, setLojaId] = useState("");
  const [situacao, setSituacao] = useState<Situacao>("ativo");
  const [admissao, setAdmissao] = useState("");
  const [desligamento, setDesligamento] = useState("");

  const [dataReferencia, setDataReferencia] = useState("");
  const [motivo, setMotivo] = useState("");

  const [historico, setHistorico] = useState<Historico[]>([]);

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const { data: funcionario, error: erroFuncionario } =
        await supabase
          .from("employees")
          .select(
            "id, employee_code, full_name, job_title, store_id, status, admission_date, termination_date"
          )
          .eq("id", funcionarioId)
          .single();

      if (erroFuncionario || !funcionario) {
        throw new Error(
          "Não foi possível carregar os dados do funcionário."
        );
      }

      const dados = funcionario as Funcionario;

      setMatricula(dados.employee_code);
      setNome(dados.full_name);
      setCargo(dados.job_title ?? "");
      setLojaId(dados.store_id);
      setSituacao(dados.status);
      setAdmissao(dados.admission_date ?? "");
      setDesligamento(dados.termination_date ?? "");

      const { data: registros, error: erroHistorico } =
        await supabase
          .from("employee_change_history")
          .select(
            "id, field_name, old_value, new_value, effective_date, reason, recorded_at"
          )
          .eq("employee_id", funcionarioId)
          .order("recorded_at", { ascending: false });

      if (erroHistorico) {
        throw new Error(
          "Não foi possível carregar o histórico cadastral."
        );
      }

      setHistorico((registros ?? []) as Historico[]);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao carregar funcionário."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, [funcionarioId]);

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    setErro("");
    setMensagem("");

    if (nome.trim().length < 3) {
      setErro("Informe um nome com pelo menos 3 caracteres.");
      return;
    }

    if (!matricula.trim()) {
      setErro("Informe a matrícula.");
      return;
    }

    if (!lojaId) {
      setErro("Selecione uma loja.");
      return;
    }

    if (!dataReferencia) {
      setErro("Informe a data de referência.");
      return;
    }

    if (motivo.trim().length < 3) {
      setErro("Informe o motivo da alteração.");
      return;
    }

    if (situacao === "desligado" && !desligamento) {
      setErro("Informe a data de desligamento.");
      return;
    }

    if (situacao !== "desligado" && desligamento) {
      setErro(
        "A data de desligamento deve ficar vazia para funcionários ativos ou afastados."
      );
      return;
    }

    if (admissao && desligamento && desligamento < admissao) {
      setErro(
        "A data de desligamento não pode ser anterior à admissão."
      );
      return;
    }

    setSalvando(true);

    try {
      const { error } = await supabase.rpc(
        "editar_dados_funcionario",
        {
          p_employee_id: funcionarioId,
          p_full_name: nome.trim(),
          p_employee_code: matricula.trim(),
          p_job_title: cargo.trim(),
          p_store_id: lojaId,
          p_status: situacao,
          p_admission_date: admissao || null,
          p_termination_date: desligamento || null,
          p_effective_date: dataReferencia,
          p_reason: motivo.trim(),
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      setMotivo("");
      setDataReferencia("");

      await carregarDados();

      setMensagem(
        "Dados atualizados e alterações registradas no histórico!"
      );

      onAtualizado?.();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as alterações."
      );
    } finally {
      setSalvando(false);
    }
  }

  function mostrarValor(
    campo: string,
    valor: string | null
  ) {
    if (!valor) return "—";

    if (
      campo === "admission_date" ||
      campo === "termination_date"
    ) {
      return formatarData(valor);
    }

    if (campo === "store_id") {
      return (
        lojas.find((loja) => loja.id === valor)?.nome ??
        valor
      );
    }

    const situacoes: Record<string, string> = {
      ativo: "Ativo",
      afastado: "Afastado",
      desligado: "Desligado",
    };

    if (campo === "status") {
      return situacoes[valor] ?? valor;
    }

    return valor;
  }

  if (carregando) {
    return <p>Carregando dados cadastrais...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-5">
        <h3 className="mb-2 text-lg font-semibold">
          Editar dados cadastrais
        </h3>

        <p className="mb-5 text-sm text-muted-foreground">
          Todas as alterações serão registradas com motivo
          e data de referência.
        </p>

        <form
          onSubmit={salvar}
          className="grid gap-4 sm:grid-cols-2"
        >
          <label className="space-y-1">
            <span className="text-sm font-medium">
              Matrícula
            </span>

            <input
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              required
              maxLength={30}
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">
              Nome completo
            </span>

            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              maxLength={150}
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">
              Cargo
            </span>

            <input
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              maxLength={100}
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">
              Loja
            </span>

            <select
              value={lojaId}
              onChange={(e) => setLojaId(e.target.value)}
              required
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="">Selecione a loja</option>

              {lojas.map((loja) => (
                <option key={loja.id} value={loja.id}>
                  {loja.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">
              Situação
            </span>

            <select
              value={situacao}
              onChange={(e) => {
                const novaSituacao =
                  e.target.value as Situacao;

                setSituacao(novaSituacao);

                if (novaSituacao !== "desligado") {
                  setDesligamento("");
                }
              }}
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="ativo">Ativo</option>
              <option value="afastado">Afastado</option>
              <option value="desligado">Desligado</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">
              Data de admissão
            </span>

            <input
              type="date"
              value={admissao}
              onChange={(e) => setAdmissao(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </label>

          {situacao === "desligado" && (
            <label className="space-y-1">
              <span className="text-sm font-medium">
                Data de desligamento
              </span>

              <input
                type="date"
                value={desligamento}
                onChange={(e) =>
                  setDesligamento(e.target.value)
                }
                required
                className="w-full rounded-md border bg-background px-3 py-2"
              />
            </label>
          )}

          <div className="border-t pt-4 sm:col-span-2">
            <h4 className="font-semibold">
              Informações da alteração
            </h4>
          </div>

          <label className="space-y-1">
            <span className="text-sm font-medium">
              Data de referência *
            </span>

            <input
              type="date"
              value={dataReferencia}
              onChange={(e) =>
                setDataReferencia(e.target.value)
              }
              required
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium">
              Motivo da alteração *
            </span>

            <input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: Promoção, transferência, correção"
              required
              minLength={3}
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50"
            >
              {salvando
                ? "Salvando..."
                : "Salvar alterações cadastrais"}
            </button>
          </div>
        </form>

        {erro && (
          <p
            role="alert"
            className="mt-4 text-sm text-red-600"
          >
            {erro}
          </p>
        )}

        {mensagem && (
          <p
            role="status"
            className="mt-4 text-sm text-green-600"
          >
            {mensagem}
          </p>
        )}
      </div>

      <div className="rounded-lg border p-5">
        <h3 className="mb-4 text-lg font-semibold">
          Histórico de alterações cadastrais
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3">Referência</th>
                <th className="p-3">Campo</th>
                <th className="p-3">Anterior</th>
                <th className="p-3">Novo</th>
                <th className="p-3">Motivo</th>
                <th className="p-3">Registrado em</th>
              </tr>
            </thead>

            <tbody>
              {historico.map((registro) => (
                <tr
                  key={registro.id}
                  className="border-b"
                >
                  <td className="p-3">
                    {formatarData(
                      registro.effective_date
                    )}
                  </td>

                  <td className="p-3">
                    {nomesCampos[registro.field_name] ??
                      registro.field_name}
                  </td>

                  <td className="p-3">
                    {mostrarValor(
                      registro.field_name,
                      registro.old_value
                    )}
                  </td>

                  <td className="p-3">
                    {mostrarValor(
                      registro.field_name,
                      registro.new_value
                    )}
                  </td>

                  <td className="p-3">
                    {registro.reason}
                  </td>

                  <td className="p-3">
                    {new Date(
                      registro.recorded_at
                    ).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}

              {historico.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-muted-foreground"
                  >
                    Nenhuma alteração cadastral registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
