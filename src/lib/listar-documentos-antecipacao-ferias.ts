
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getSupabaseServer } from "@/lib/server/auth/supabase-server";

const esquema = z.object({
  solicitacaoId: z.string().uuid(),
});

export type DocumentoAntecipacaoFerias = {
  documento_id: string;
  nome_arquivo: string;
  tipo_arquivo: string;
  tamanho_bytes: number;
  data_envio: string;
};

export const listarDocumentosAntecipacaoFerias = createServerFn({
  method: "POST",
})
  .inputValidator(esquema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServer();

    const {
      data: { user },
      error: erroAutenticacao,
    } = await supabase.auth.getUser();

    if (erroAutenticacao || !user) {
      throw new Error("Você precisa estar autenticado.");
    }

    const { data: documentos, error } = await supabase.rpc(
      "listar_documentos_antecipacao_ferias",
      {
        p_request_id: data.solicitacaoId,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    return (documentos ?? []) as DocumentoAntecipacaoFerias[];
  });
