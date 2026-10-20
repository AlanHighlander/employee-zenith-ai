import { createServerOnlyFn } from '@tanstack/react-start'
import { getSupabaseServer } from './auth/supabase-server'

export const exigirAdministrador = createServerOnlyFn(async () => {
  const supabase = getSupabaseServer()

  const { data: auth, error: erroAuth } =
    await supabase.auth.getUser()

  if (erroAuth || !auth.user) {
    throw new Error('Usuário não autenticado.')
  }

  const { data: perfil, error: erroPerfil } = await supabase
    .from('profiles')
    .select('company_id, role, must_change_password')
    .eq('user_id', auth.user.id)
    .eq('active', true)
    .maybeSingle()

  if (erroPerfil || !perfil || perfil.role !== 'admin') {
    throw new Error('Acesso permitido apenas ao Administrador.')
  }

  if (perfil.must_change_password) {
    throw new Error('É necessário trocar a senha provisória.')
  }

  return {
    userId: auth.user.id,
    companyId: perfil.company_id as string,
  }
})
