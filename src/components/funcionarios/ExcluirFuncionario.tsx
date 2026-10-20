
import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  funcionarioId: string;
  nomeFuncionario: string;
  onExcluido: () => void;
};

export function ExcluirFuncionario({
  funcionarioId,
  nomeFuncionario,
  onExcluido,
}: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  async function excluir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (motivo.trim().length < 3) {
      setErro("Informe o motivo da exclusão.");
      return;
    }

    const confirmado = window.confirm(
      `Confirma o arquivamento de ${nomeFuncionario}?\n\n` +
      "O funcionário sairá da lista principal, " +
      "mas seus dados e históricos serão preservados."
    );

    if (!confirmado) return;

    setExcluindo(true);
    setErro("");

    try {
      const { error } = await supabase.rpc(
        "arquivar_funcionario",
        {
          p_employee_id: funcionarioId,
          p_reason: motivo.trim(),
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      onExcluido();
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível arquivar o funcionário."
      );
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="rounded-lg border border-red-200 p-5">
      <h3 className="text-lg font-semibold text-red-700">
        Gerenciamento do cadastro
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        Arquivar um funcionário remove seu cadastro da
        lista principal, mas preserva seus dados e históricos.
      </p>

      {!confirmando ? (
        <button
          type="button"
          onClick={() => {
            setConfirmando(true);
            setErro("");
          }}
          className="mt-4 rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Excluir funcionário
        </button>
      ) : (
        <form onSubmit={excluir} className="mt-4 space-y-4">
          <p className="text-sm font-medium">
            Você está arquivando: {nomeFuncionario}
          </p>

          <label className="block space-y-1">
            <span className="text-sm font-medium">
              Motivo da exclusão *
            </span>

            <textarea
              value={motivo}
              onChange={(evento) =>
                setMotivo(evento.target.value)
              }
              required
              minLength={3}
              rows={3}
              placeholder="Informe por que este cadastro será arquivado"
              className="w-full rounded-md border bg-background px-3 py-2"
            />
          </label>

          {erro && (
            <p role="alert" className="text-sm text-red-600">
              {erro}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={excluindo}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {excluindo
                ? "Arquivando..."
                : "Confirmar exclusão"}
            </button>

            <button
              type="button"
              disabled={excluindo}
              onClick={() => {
                setConfirmando(false);
                setMotivo("");
                setErro("");
              }}
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
