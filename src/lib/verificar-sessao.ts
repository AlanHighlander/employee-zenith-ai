import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServer } from './server/auth/supabase-server'

export const verificarSessao = createServerFn({
  method: 'GET',
}).handler(async () => {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase.auth.getUser()

  return {
  autenticado: !error && !!data.user,
  usuarioId: !error ? (data.user?.id ?? null) : null,
}
})
