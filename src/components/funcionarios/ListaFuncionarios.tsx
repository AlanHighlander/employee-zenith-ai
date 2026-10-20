
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useScope } from "@/lib/scope-context";
import { EditarFuncionario } from "./EditarFuncionario";

type Funcionario = {
  id: string;
  employee_code: string;
  full_name: string;
  job_title: string | null;
  store_id: string;
  status: "ativo" | "afastado" | "desligado";
  admission_date: string | null;
};

function formatarData(data: string | null) {
  if (!data) return "—";

  const partes = data.slice(0, 10).split("-");

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarSituacao(situacao: Funcionario["status"]) {
  switch (situacao) {
    case "ativo":
      return "Ativo";
    case "afastado":
      return "Afastado";
    case "desligado":
      return "Desligado";
    default:
      return situacao;
  }
}

export function ListaFuncionarios() {
  const { lojas, lojaAtual } = useScope();

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [situacao, setSituacao] = useState("todas");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [funcionarioEditando, setFuncionarioEditando] =
    useState<string | null>(null);

  const carregarFuncionarios = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const { data, error } = await supabase
        .from("employees")
.select(
  "id, employee_code, full_name, job_title, store_id, status, admission_date"
)
.is("archived_at", null)
.order("full_name", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      setFuncionarios((data ?? []) as Funcionario[]);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);

      setErro("Não foi possível carregar os funcionários.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarFuncionarios();
  }, [carregarFuncionarios]);

  function nomeLoja(lojaId: string) {
    return (
      lojas.find((loja) => loja.id === lojaId)?.nome ??
      "Loja não encontrada"
    );
  }

  const funcionariosFiltrados = funcionarios.filter((funcionario) => {
    if (lojaAtual && funcionario.store_id !== lojaAtual.id) {
      return false;
    }

    if (situacao !== "todas" && funcionario.status !== situacao) {
      return false;
    }

    const termo = pesquisa.trim().toLocaleLowerCase("pt-BR");

    if (!termo) return true;

    const nome = funcionario.full_name.toLocaleLowerCase("pt-BR");
    const matricula = funcionario.employee_code.toLocaleLowerCase("pt-BR");
    const cargo = (funcionario.job_title ?? "").toLocaleLowerCase("pt-BR");

    return (
      nome.includes(termo) ||
      matricula.includes(termo) ||
      cargo.includes(termo)
    );
  });

  // Abre a ficha do funcionário selecionado.
  if (funcionarioEditando) {
    return (
      <EditarFuncionario
        funcionarioId={funcionarioEditando}
        onVoltar={() => {
          setFuncionarioEditando(null);

          // Atualiza a listagem ao voltar da ficha.
          void carregarFuncionarios();
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            Funcionários cadastrados
          </h2>

          <p className="text-sm text-muted-foreground">
            Consulte e gerencie os funcionários cadastrados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void carregarFuncionarios()}
          disabled={carregando}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          {carregando ? "Atualizando..." : "Atualizar lista"}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={pesquisa}
          onChange={(evento) => setPesquisa(evento.target.value)}
          placeholder="Pesquisar nome, matrícula ou cargo"
          aria-label="Pesquisar funcionários"
          className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2"
        />

        <select
          value={situacao}
          onChange={(evento) => setSituacao(evento.target.value)}
          aria-label="Filtrar por situação"
          className="rounded-md border bg-background px-3 py-2"
        >
          <option value="todas">Todas as situações</option>
          <option value="ativo">Ativos</option>
          <option value="afastado">Afastados</option>
          <option value="desligado">Desligados</option>
        </select>
      </div>

      {lojaAtual && (
        <p className="text-sm text-muted-foreground">
          Loja selecionada:{" "}
          <strong>{lojaAtual.nome}</strong>
        </p>
      )}

      {carregando ? (
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">
            Carregando funcionários...
          </p>
        </div>
      ) : erro ? (
        <div className="space-y-3 rounded-lg border p-6">
          <p role="alert" className="text-sm text-red-600">
            {erro}
          </p>

          <button
            type="button"
            onClick={() => void carregarFuncionarios()}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="whitespace-nowrap p-3">
                    Matrícula
                  </th>

                  <th className="p-3">Nome</th>

                  <th className="p-3">Loja</th>

                  <th className="p-3">Cargo</th>

                  <th className="p-3">Situação</th>

                  <th className="whitespace-nowrap p-3">
                    Admissão
                  </th>

                  <th className="p-3">Ações</th>
                </tr>
              </thead>

              <tbody>
                {funcionariosFiltrados.map((funcionario) => (
                  <tr
                    key={funcionario.id}
                    className="border-t hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap p-3">
                      {funcionario.employee_code}
                    </td>

                    <td className="p-3 font-medium">
                      {funcionario.full_name}
                    </td>

                    <td className="p-3">
                      {nomeLoja(funcionario.store_id)}
                    </td>

                    <td className="p-3">
                      {funcionario.job_title || "—"}
                    </td>

                    <td className="p-3">
                      <span className="whitespace-nowrap">
                        {formatarSituacao(funcionario.status)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap p-3">
                      {formatarData(funcionario.admission_date)}
                    </td>

                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() =>
                          setFuncionarioEditando(funcionario.id)
                        }
                        className="rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}

                {funcionariosFiltrados.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Nenhum funcionário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground">
            {funcionariosFiltrados.length} funcionário(s)
            encontrado(s).
          </p>
        </>
      )}
    </div>
  );
}
