import { createServerFn } from '@tanstack/react-start'
import { trocarSenhaSchema } from './validar-troca-senha'
import { getSupabaseServer } from './server/auth/supabase-server'
import { getSupabaseAdmin } from './server/supabase-admin'

export const trocarSenha = createServerFn({
  method: 'POST',
})
  .inputValidator(trocarSenhaSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseServer()

    const { data: auth, error: erroAuth } =
      await supabase.auth.getUser()

    if (erroAuth || !auth.user) {
      throw new Error('Usuário não autenticado.')
    }

    const { error: erroSenha } =
      await supabase.auth.updateUser({
        password: data.novaSenha,
      })

    if (erroSenha) {
      throw new Error('Não foi possível alterar a senha.')
    }

    const admin = getSupabaseAdmin()

    const { data: perfilAtualizado, error: erroConfirmacao } = await admin
      .from('profiles')
      .update({ must_change_password: false })
      .eq('user_id', auth.user.id)
      .eq('active', true)
      .select('user_id')
      .single()

    if (erroConfirmacao || !perfilAtualizado) {
      throw new Error(
        'Senha alterada, mas não foi possível concluir a confirmação.'
      )
    }

    return {
      sucesso: true,
    }
  })
