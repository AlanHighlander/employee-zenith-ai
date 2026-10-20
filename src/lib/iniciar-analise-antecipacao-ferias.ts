
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getSupabaseServer } from "@/lib/server/auth/supabase-server";

const esquema = z.object({
  solicitacaoId: z.string().uuid(),
  observacoes: z.string().trim().max(2000).optional(),
});

export const iniciarAnaliseAntecipacaoFerias = createServerFn({
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

    const { error } = await supabase.rpc(
      "iniciar_analise_antecipacao_ferias",
      {
        p_request_id: data.solicitacaoId,
        p_review_notes: data.observacoes?.trim() || null,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    return {
      sucesso: true,
      mensagem: "Solicitação encaminhada para análise.",
    };
  });
