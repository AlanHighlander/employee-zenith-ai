import { createServerFn } from '@tanstack/react-start'
import { regerarSenhaSchema } from './validar-regerar-senha'
import { exigirAdministrador } from './server/exigir-administrador'
import { getSupabaseAdmin } from './server/supabase-admin'
import { gerarSenhaProvisoria } from './server/gerar-senha-provisoria'

export const regerarSenha = createServerFn({
  method: 'POST',
})
  .inputValidator(regerarSenhaSchema)
  .handler(async ({ data }) => {
    const administrador = await exigirAdministrador()
    const supabase = getSupabaseAdmin()

    const { data: perfil, error: erroPerfil } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('codigo', data.codigo)
      .eq('company_id', administrador.companyId)
      .eq('active', true)
      .maybeSingle()

    if (erroPerfil || !perfil) {
      throw new Error('Usuário ativo não encontrado.')
    }

    if (perfil.user_id === administrador.userId) {
      throw new Error(
        'Não é permitido redefinir sua própria senha por esta função.'
      )
    }

    const senhaProvisoria = gerarSenhaProvisoria()

    const { error: erroSenha } =
      await supabase.auth.admin.updateUserById(
        perfil.user_id,
        { password: senhaProvisoria }
      )

    if (erroSenha) {
      throw new Error('Não foi possível redefinir a senha.')
    }

    const { data: confirmado, error: erroConfirmacao } =
      await supabase
        .from('profiles')
        .update({ must_change_password: true })
        .eq('user_id', perfil.user_id)
        .eq('company_id', administrador.companyId)
        .eq('active', true)
        .select('user_id')
        .single()

    if (erroConfirmacao || !confirmado) {
      throw new Error(
        'A senha foi redefinida, mas a troca obrigatória não foi confirmada. Não entregue a senha; solicite uma verificação administrativa.'
      )
    }

    return {
      sucesso: true,
      codigo: data.codigo,
      senhaProvisoria,
    }
  })
