
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { exigirAdministrador } from './server/exigir-administrador'
import { getSupabaseAdmin } from './server/supabase-admin'

const historicoSchema = z.object({
  userId: z.string().uuid().optional(),
})

export const listarHistoricoUsuarios = createServerFn({
  method: 'GET',
})
  .inputValidator(historicoSchema)
  .handler(async ({ data }) => {
    const administrador = await exigirAdministrador()
    const supabase = getSupabaseAdmin()

    let consulta = supabase
      .from('user_change_history')
      .select(`
        id,
        target_user_id,
        changed_by,
        old_full_name,
        new_full_name,
        old_role,
        new_role,
        old_active,
        new_active,
        changed_at
      `)
      .eq('company_id', administrador.companyId)
      .order('changed_at', { ascending: false })
      .limit(200)

    if (data.userId) {
      consulta = consulta.eq('target_user_id', data.userId)
    }

    const { data: registros, error } = await consulta

    if (error) {
      throw new Error(
        'Não foi possível carregar o histórico de alterações.',
      )
    }

    const historico = registros ?? []

    const responsaveisIds = [
      ...new Set(historico.map((registro) => registro.changed_by)),
    ]

    let codigosPorUsuario = new Map<string, string>()

    if (responsaveisIds.length > 0) {
      const { data: responsaveis, error: erroResponsaveis } =
        await supabase
          .from('profiles')
          .select('user_id, codigo, full_name')

          .eq('company_id', administrador.companyId)
          .in('user_id', responsaveisIds)

      if (erroResponsaveis) {
        throw new Error(
          'Não foi possível consultar os códigos dos responsáveis.',
        )
      }

      codigosPorUsuario = new Map(
        (responsaveis ?? []).map((responsavel) => [
          responsavel.user_id,
          `${responsavel.full_name} (${responsavel.codigo ?? 'Sem código'})`,

        ]),
      )
    }

    return historico.map((registro) => ({
      ...registro,
      responsavel_codigo:
        codigosPorUsuario.get(registro.changed_by) ?? 'Usuário não localizado',
    }))
  })
