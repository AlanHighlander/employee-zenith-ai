import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServer } from './server/auth/supabase-server'

export const verificarTrocaSenha = createServerFn({
  method: 'GET',
}).handler(async () => {
  const supabase = getSupabaseServer()

  const { data: auth, error: erroAuth } =
    await supabase.auth.getUser()

  if (erroAuth || !auth.user) {
    return { autenticado: false, precisaTrocar: false }
  }

  const { data: perfil, error: erroPerfil } = await supabase
    .from('profiles')
    .select('must_change_password')
    .eq('user_id', auth.user.id)
    .eq('active', true)
    .maybeSingle()

  if (erroPerfil || !perfil) {
    throw new Error('Não foi possível verificar o perfil do usuário.')
  }

  return {
    autenticado: true,
    precisaTrocar: perfil.must_change_password === true,
  }
})
