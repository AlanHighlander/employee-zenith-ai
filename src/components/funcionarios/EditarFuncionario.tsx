
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { EditarDadosFuncionario } from "./EditarDadosFuncionario";
import { ExcluirFuncionario } from "./ExcluirFuncionario";
import { SalarioAtualFuncionario } from "./SalarioAtualFuncionario";

type Funcionario = {
  id: string;
  employee_code: string;
  full_name: string;
  job_title: string | null;
  status: string;
};

type HistoricoSalario = {
  id: string;
  previous_salary: number | null;
  new_salary: number;
  effective_date: string;
  reason: string;
  recorded_at: string;
};

type Perfil = {
  role: string;
  active: boolean;
};

type Props = {
  funcionarioId: string;
  onVoltar: () => void;
};

function formatarMoeda(valor: number | null) {
  if (valor === null) return "Não informado";

  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarData(data: string) {
  const partes = data.slice(0, 10).split("-");

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function EditarFuncionario({
  funcionarioId,
  onVoltar,
}: Props) {
  const [funcionario, setFuncionario] =
    useState<Funcionario | null>(null);

  const [historico, setHistorico] =
    useState<HistoricoSalario[]>([]);

  const [podeVerSalario, setPodeVerSalario] =
    useState(false);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] = useState("");
  const [erroHistorico, setErroHistorico] =
    useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErro("");
      setErroHistorico("");
      setPodeVerSalario(false);
      setHistorico([]);
      setFuncionario(null);

      try {
        const {
          data: dadosFuncionario,
          error: erroFuncionario,
        } = await supabase
          .from("employees")
          .select(
            "id, employee_code, full_name, job_title, status"
          )
          .eq("id", funcionarioId)
          .single();

        if (erroFuncionario || !dadosFuncionario) {
          throw new Error(
            "Não foi possível carregar o funcionário."
          );
        }

        const {
          data: usuario,
          error: erroUsuario,
        } = await supabase.auth.getUser();

        if (erroUsuario || !usuario.user) {
          throw new Error(
            "Não foi possível verificar o usuário."
          );
        }

        const {
          data: perfil,
          error: erroPerfil,
        } = await supabase
          .from("profiles")
          .select("role, active")
          .eq("user_id", usuario.user.id)
          .single();

        if (erroPerfil || !perfil) {
          throw new Error(
            "Não foi possível verificar as permissões."
          );
        }

        const dadosPerfil = perfil as Perfil;

        const autorizado =
          dadosPerfil.active === true &&
          ["admin", "rh"].includes(dadosPerfil.role);

        if (!ativo) return;

        setFuncionario(dadosFuncionario as Funcionario);
        setPodeVerSalario(autorizado);

        if (autorizado) {
          const {
            data: dadosHistorico,
            error: erroConsultaHistorico,
          } = await supabase
            .from("employee_salary_history")
            .select(
              "id, previous_salary, new_salary, effective_date, reason, recorded_at"
            )
            .eq("employee_id", funcionarioId)
            .order("recorded_at", {
              ascending: false,
            });

          if (!ativo) return;

          if (erroConsultaHistorico) {
            setErroHistorico(
              "Não foi possível consultar o histórico salarial."
            );
          } else {
            setHistorico(
              (dadosHistorico ?? []) as HistoricoSalario[]
            );
          }
        }
      } catch (error) {
        if (!ativo) return;

        setErro(
          error instanceof Error
            ? error.message
            : "Erro ao carregar funcionário."
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarDados();

    return () => {
      ativo = false;
    };
  }, [funcionarioId]);

  if (carregando) {
    return <p>Carregando funcionário...</p>;
  }

  if (!funcionario) {
    return (
      <div className="space-y-4">
        <p role="alert">
          {erro || "Funcionário não encontrado."}
        </p>

        <button
          type="button"
          onClick={onVoltar}
          className="rounded-md border px-4 py-2"
        >
          Voltar à lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onVoltar}
        className="rounded-md border px-4 py-2 text-sm"
      >
        ← Voltar à lista
      </button>

      <div className="rounded-lg border p-5">
        <h2 className="text-2xl font-semibold">
          {funcionario.full_name}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Matrícula: {funcionario.employee_code}
        </p>

        <p className="mt-2 text-sm">
          <strong>Cargo:</strong>{" "}
          {funcionario.job_title || "Não informado"}
        </p>

        <p className="mt-1 text-sm">
          <strong>Situação:</strong>{" "}
          {funcionario.status}
        </p>
      </div>

      <EditarDadosFuncionario
        funcionarioId={funcionarioId}
        onAtualizado={() => {
          // Os dados cadastrais são atualizados
          // pelo próprio componente de edição.
        }}
      />

      {podeVerSalario && (
        <>
          <SalarioAtualFuncionario
            funcionarioId={funcionarioId}
          />

          <div className="rounded-lg border p-5">
            <h3 className="text-lg font-semibold">
              Alteração salarial
            </h3>

            <p className="mt-2 text-sm text-amber-700">
              Recurso em validação. Não utilize
              salários reais até concluirmos a
              revisão de segurança e as regras
              de vigência.
            </p>

            <div className="mt-4">
              <button
                type="button"
                disabled
                title="Disponível após a validação de segurança"
                className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground opacity-50"
              >
                Alterar salário
              </button>
            </div>
          </div>

          <div className="rounded-lg border p-5">
            <h3 className="mb-4 text-lg font-semibold">
              Histórico salarial
            </h3>

            {erroHistorico ? (
              <p
                role="alert"
                className="text-sm text-red-600"
              >
                {erroHistorico}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3">
                        Referência
                      </th>
                      <th className="p-3">
                        Salário anterior
                      </th>
                      <th className="p-3">
                        Novo salário
                      </th>
                      <th className="p-3">
                        Motivo
                      </th>
                      <th className="p-3">
                        Registrado em
                      </th>
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
                          {formatarMoeda(
                            registro.previous_salary
                          )}
                        </td>

                        <td className="p-3 font-medium">
                          {formatarMoeda(
                            registro.new_salary
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
                          colSpan={5}
                          className="p-6 text-center text-muted-foreground"
                        >
                          Nenhuma alteração salarial registrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <ExcluirFuncionario
        funcionarioId={funcionarioId}
        nomeFuncionario={funcionario.full_name}
        onExcluido={onVoltar}
      />
    </div>
  );
}
