
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getSupabaseServer } from './server/auth/supabase-server'

const solicitarAntecipacaoSchema = z.object({
  periodoId: z.string().uuid(),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  justificativa: z.string().trim().min(3).max(2000),
  documentoReferencia: z.string().trim().max(500).optional(),
})

export const solicitarAntecipacaoFerias = createServerFn({
  method: 'POST',
})
  .inputValidator(solicitarAntecipacaoSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServer()

    const {
      data: { user },
      error: erroAutenticacao,
    } = await supabase.auth.getUser()

    if (erroAutenticacao || !user) {
      throw new Error('Usuário não autenticado.')
    }

    const { data: solicitacaoId, error } = await supabase.rpc(
      'solicitar_antecipacao_ferias',
      {
        p_vacation_period_id: data.periodoId,
        p_start_date: data.dataInicio,
        p_end_date: data.dataFim,
        p_reason: data.justificativa,
        p_document_reference: data.documentoReferencia || null,
      },
    )

    if (error) {
      throw new Error(
        `Não foi possível registrar a solicitação: ${error.message}`,
      )
    }

    return {
      sucesso: true,
      solicitacaoId,
      mensagem:
        'Solicitação registrada e aguardando análise do RH.',
    }
  })
