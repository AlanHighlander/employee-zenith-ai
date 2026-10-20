
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getSupabaseServer } from './server/auth/supabase-server'

const consultaSchema = z.object({
  funcionarioId: z.string().uuid(),
})

export const listarPeriodosFerias = createServerFn({
  method: 'GET',
})
  .inputValidator(consultaSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServer()

    const {
      data: { user },
      error: erroAutenticacao,
    } = await supabase.auth.getUser()

    if (erroAutenticacao || !user) {
      throw new Error('Usuário não autenticado.')
    }

    const { data: periodos, error } = await supabase.rpc(
      'listar_periodos_ferias_funcionario',
      {
        p_employee_id: data.funcionarioId,
      },
    )

    if (error) {
      throw new Error(
        `Não foi possível consultar os períodos de férias: ${error.message}`,
      )
    }

    return periodos ?? []
  })
