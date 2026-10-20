
import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServer } from "./server/auth/supabase-server";

export type AntecipacaoFerias = {
  solicitacao_id: string;
  funcionario_id: string;
  matricula: string;
  funcionario_nome: string;
  loja_id: string;
  periodo_inicio: string;
  periodo_fim: string;
  data_inicio: string;
  data_fim: string;
  dias_solicitados: number;
  justificativa: string;
  situacao: string;
  referencia_documento: string | null;
  data_solicitacao: string;
};

export const listarAntecipacoesFerias = createServerFn({
  method: "GET",
}).handler(async (): Promise<AntecipacaoFerias[]> => {
  const supabase = getSupabaseServer();

  const {
    data: { user },
    error: erroAutenticacao,
  } = await supabase.auth.getUser();

  if (erroAutenticacao || !user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data, error } = await supabase.rpc(
    "listar_antecipacoes_ferias",
  );

  if (error) {
    throw new Error(
      `Não foi possível consultar as antecipações: ${error.message}`,
    );
  }

  return (data ?? []) as AntecipacaoFerias[];
});
