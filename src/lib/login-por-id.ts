import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getSupabaseAdmin } from './server/supabase-admin'

const loginSchema = z.object({
  codigo: z.string().regex(/^\d{3}$/),
  senha: z.string().min(1),
})

export const entrarPorId = createServerFn({
  method: 'POST',
})
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const erroLogin = 'ID ou senha inválidos.'

    const admin = getSupabaseAdmin()

    const { data: perfil, error: erroPerfil } = await admin
      .from('profiles')
      .select('user_id')
      .eq('codigo', data.codigo)
      .eq('active', true)
      .maybeSingle()

    if (erroPerfil) {
      throw new Error('Não foi possível processar o login.')
    }

    if (!perfil) {
      throw new Error(erroLogin)
    }

    const { data: usuario, error: erroUsuario } =
      await admin.auth.admin.getUserById(perfil.user_id)

    if (erroUsuario || !usuario.user?.email) {
      throw new Error(erroLogin)
    }

    const { createClient } = await import('@supabase/supabase-js')

    const url = process.env['SUPABASE_URL']
    const anonKey = process.env['SUPABASE_ANON_KEY']

    if (!url || !anonKey) {
      throw new Error('Configuração de autenticação incompleta.')
    }

    const auth = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const { data: sessao, error: erroSenha } =
      await auth.auth.signInWithPassword({
        email: usuario.user.email,
        password: data.senha,
      })

    if (erroSenha || !sessao.session) {
      throw new Error(erroLogin)
    }

    return {
      access_token: sessao.session.access_token,
      refresh_token: sessao.session.refresh_token,
    }
  })
