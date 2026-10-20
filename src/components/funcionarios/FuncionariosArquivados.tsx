
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useScope } from "@/lib/scope-context";

type FuncionarioArquivado = {
  id: string;
  employee_code: string;
  full_name: string;
  job_title: string | null;
  store_id: string;
  archived_at: string;
  archive_reason: string | null;
};

type Props = {
  onVoltar: () => void;
};

export function FuncionariosArquivados({ onVoltar }: Props) {
  const { lojas, lojaAtual } = useScope();

  const [funcionarios, setFuncionarios] = useState<
    FuncionarioArquivado[]
  >([]);

  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [restaurando, setRestaurando] =
    useState<FuncionarioArquivado | null>(null);

  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarArquivados() {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("employees")
      .select(
        "id, employee_code, full_name, job_title, store_id, archived_at, archive_reason"
      )
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false });

    if (error) {
      setErro("Não foi possível carregar os funcionários arquivados.");
      setFuncionarios([]);
    } else {
      setFuncionarios(
        (data ?? []) as FuncionarioArquivado[]
      );
    }

    setCarregando(false);
  }

  useEffect(() => {
    void carregarArquivados();
  }, []);

  async function confirmarRestauracao(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (!restaurando) return;

    if (motivo.trim().length < 3) {
      setErro("Informe o motivo da restauração.");
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      const { error } = await supabase.rpc(
        "restaurar_funcionario",
        {
          p_employee_id: restaurando.id,
          p_reason: motivo.trim(),
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      const nomeRestaurado = restaurando.full_name;

      setRestaurando(null);
      setMotivo("");

      await carregarArquivados();

      setMensagem(
        `${nomeRestaurado} foi restaurado com sucesso.`
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível restaurar o funcionário."
      );
    } finally {
      setSalvando(false);
    }
  }

  const filtrados = funcionarios.filter((funcionario) => {
    const termo = busca.trim().toLowerCase();

    const correspondeBusca =
      funcionario.full_name.toLowerCase().includes(termo) ||
      funcionario.employee_code.toLowerCase().includes(termo) ||
      (funcionario.job_title ?? "")
        .toLowerCase()
        .includes(termo);

    const correspondeLoja =
      !lojaAtual || funcionario.store_id === lojaAtual.id;

    return correspondeBusca && correspondeLoja;
  });

  function nomeLoja(lojaId: string) {
    return (
      lojas.find((loja) => loja.id === lojaId)?.nome ??
      "Loja não identificada"
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            Funcionários arquivados
          </h2>

          <p className="text-sm text-muted-foreground">
            Consulte os cadastros arquivados e restaure
            funcionários com justificativa.
          </p>
        </div>

        <button
          type="button"
          onClick={onVoltar}
          className="rounded-md border px-4 py-2 text-sm"
        >
          ← Voltar à lista
        </button>
      </div>

      <input
        type="search"
        value={busca}
        onChange={(evento) => setBusca(evento.target.value)}
        placeholder="Buscar por nome, matrícula ou cargo"
        className="w-full rounded-md border bg-background px-3 py-2"
      />

      {erro && (
        <p role="alert" className="text-sm text-red-600">
          {erro}
        </p>
      )}

      {mensagem && (
        <p role="status" className="text-sm text-green-600">
          {mensagem}
        </p>
      )}

      {restaurando && (
        <div className="rounded-lg border p-5">
          <h3 className="text-lg font-semibold">
            Confirmar restauração
          </h3>

          <p className="mt-2 text-sm">
            Funcionário:{" "}
            <strong>{restaurando.full_name}</strong>
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Matrícula: {restaurando.employee_code}
          </p>

          <form
            onSubmit={confirmarRestauracao}
            className="mt-4 space-y-4"
          >
            <label className="block space-y-1">
              <span className="text-sm font-medium">
                Motivo da restauração *
              </span>

              <textarea
                value={motivo}
                onChange={(evento) =>
                  setMotivo(evento.target.value)
                }
                required
                minLength={3}
                rows={3}
                placeholder="Ex.: Cadastro arquivado por engano"
                className="w-full rounded-md border bg-background px-3 py-2"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={salvando}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {salvando
                  ? "Restaurando..."
                  : "Confirmar restauração"}
              </button>

              <button
                type="button"
                disabled={salvando}
                onClick={() => {
                  setRestaurando(null);
                  setMotivo("");
                  setErro("");
                }}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {carregando ? (
        <p>Carregando funcionários arquivados...</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3">Matrícula</th>
                <th className="p-3">Nome</th>
                <th className="p-3">Cargo</th>
                <th className="p-3">Loja</th>
                <th className="p-3">Arquivado em</th>
                <th className="p-3">Motivo</th>
                <th className="p-3">Ação</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((funcionario) => (
                <tr
                  key={funcionario.id}
                  className="border-b"
                >
                  <td className="p-3">
                    {funcionario.employee_code}
                  </td>

                  <td className="p-3 font-medium">
                    {funcionario.full_name}
                  </td>

                  <td className="p-3">
                    {funcionario.job_title || "—"}
                  </td>

                  <td className="p-3">
                    {nomeLoja(funcionario.store_id)}
                  </td>

                  <td className="p-3">
                    {new Date(
                      funcionario.archived_at
                    ).toLocaleString("pt-BR")}
                  </td>

                  <td className="p-3">
                    {funcionario.archive_reason || "—"}
                  </td>

                  <td className="p-3">
                    <button
                      type="button"
                      disabled={salvando}
                      onClick={() => {
                        setRestaurando(funcionario);
                        setMotivo("");
                        setErro("");
                        setMensagem("");
                      }}
                      className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
                    >
                      Restaurar
                    </button>
                  </td>
                </tr>
              ))}

              {filtrados.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center text-muted-foreground"
                  >
                    Nenhum funcionário arquivado encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
