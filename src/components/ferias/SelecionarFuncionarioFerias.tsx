
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useScope } from "@/lib/scope-context";

type Funcionario = {
  id: string;
  employee_code: string;
  full_name: string;
  store_id: string;
};

type Props = {
  onSelecionar: (funcionarioId: string) => void;
};

export default function SelecionarFuncionarioFerias({
  onSelecionar,
}: Props) {
  const { lojas, lojaAtual } = useScope();

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [funcionarioId, setFuncionarioId] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarFuncionarios() {
      setCarregando(true);
      setErro("");

      try {
        const { data, error } = await supabase
          .from("employees")
          .select("id, employee_code, full_name, store_id")
          .eq("status", "ativo")
          .is("archived_at", null)
          .order("full_name", { ascending: true });

        if (error) {
          throw new Error(error.message);
        }

        if (ativo) {
          setFuncionarios((data ?? []) as Funcionario[]);
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os funcionários.",
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarFuncionarios();

    return () => {
      ativo = false;
    };
  }, []);

  const funcionariosFiltrados = funcionarios.filter(
    (funcionario) =>
      !lojaAtual || funcionario.store_id === lojaAtual.id,
  );

  const funcionarioSelecionado = funcionariosFiltrados.find(
    (funcionario) => funcionario.id === funcionarioId,
  );

  function nomeLoja(lojaId: string) {
    return (
      lojas.find((loja) => loja.id === lojaId)?.nome ??
      "Loja não encontrada"
    );
  }

  return (
    <div className="space-y-4 rounded-lg border p-5">
      <div>
        <h3 className="text-lg font-semibold">
          Nova solicitação de antecipação
        </h3>

        <p className="text-sm text-muted-foreground">
          Selecione o funcionário para consultar seus períodos
          aquisitivos.
        </p>
      </div>

      {carregando && (
        <p className="text-sm text-muted-foreground">
          Carregando funcionários...
        </p>
      )}

      {erro && (
        <p role="alert" className="text-sm text-red-600">
          {erro}
        </p>
      )}

      {!carregando && !erro && (
        <>
          <div className="space-y-2">
            <label
              htmlFor="funcionario-ferias"
              className="text-sm font-medium"
            >
              Funcionário
            </label>

            <select
              id="funcionario-ferias"
              value={funcionarioId}
              onChange={(event) =>
                setFuncionarioId(event.target.value)
              }
              className="w-full rounded-md border bg-background px-3 py-2"
            >
              <option value="">Selecione um funcionário</option>

              {funcionariosFiltrados.map((funcionario) => (
                <option key={funcionario.id} value={funcionario.id}>
                  {funcionario.employee_code} — {funcionario.full_name}
                  {" — "}
                  {nomeLoja(funcionario.store_id)}
                </option>
              ))}
            </select>
          </div>

          {funcionarioSelecionado && (
            <p className="text-sm text-muted-foreground">
              Selecionado:{" "}
              <strong>{funcionarioSelecionado.full_name}</strong>
            </p>
          )}

          <button
            type="button"
            disabled={!funcionarioSelecionado}
            onClick={() => {
              if (funcionarioSelecionado) {
                onSelecionar(funcionarioSelecionado.id);
              }
            }}
            className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50"
          >
            Continuar
          </button>
        </>
      )}
    </div>
  );
}
