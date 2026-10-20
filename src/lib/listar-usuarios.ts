
import { createServerFn } from '@tanstack/react-start'
import { exigirAdministrador } from './server/exigir-administrador'
import { getSupabaseAdmin } from './server/supabase-admin'

export const listarUsuarios = createServerFn({
  method: 'GET',
}).handler(async () => {
  const administrador = await exigirAdministrador()
  const supabase = getSupabaseAdmin()

  const { data: usuarios, error } = await supabase
    .from('profiles')
    .select(
      'user_id, codigo, full_name, role, active, must_change_password'
    )
    .eq('company_id', administrador.companyId)
    .order('codigo', { ascending: true })

  if (error) {
    throw new Error('Não foi possível consultar os usuários.')
  }

  return usuarios ?? []
})
