
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getSupabaseServer } from "@/lib/server/auth/supabase-server";

const esquema = z
  .object({
    solicitacaoId: z.string().uuid(),

    decisao: z.enum(["aprovada", "rejeitada"]),

    justificativa: z
      .string()
      .trim()
      .min(10, "Informe pelo menos 10 caracteres.")
      .max(2000, "Limite de 2000 caracteres."),

    documentoId: z.string().uuid().optional(),
  })
  .superRefine((dados, contexto) => {
    if (
      dados.decisao === "aprovada" &&
      !dados.documentoId
    ) {
      contexto.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["documentoId"],
        message:
          "Selecione um documento para registrar a aprovação.",
      });
    }
  });

export const decidirAntecipacaoFerias = createServerFn({
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
      "decidir_antecipacao_ferias",
      {
        p_request_id: data.solicitacaoId,
        p_decision: data.decisao,
        p_review_notes: data.justificativa,
        p_legal_basis: null,
        p_document_id:
          data.decisao === "aprovada"
            ? data.documentoId
            : null,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    return {
      sucesso: true,
      mensagem:
        data.decisao === "aprovada"
          ? "Aprovação administrativa registrada com sucesso."
          : "Rejeição registrada com sucesso.",
    };
  });
