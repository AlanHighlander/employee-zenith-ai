import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServer } from './server/auth/supabase-server'

export const verificarAdministrador = createServerFn({
  method: 'GET',
}).handler(async () => {
  const supabase = getSupabaseServer()

  const { data: auth, error: erroAuth } =
    await supabase.auth.getUser()


  if (erroAuth || !auth.user) {
    return { autorizado: false }
  }

  const { data: perfil, error: erroPerfil } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', auth.user.id)
    .eq('active', true)
    .maybeSingle()


  return {
    autorizado: !erroPerfil && perfil?.role === 'admin',
  }
})
