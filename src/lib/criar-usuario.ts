import { createServerFn } from '@tanstack/react-start'
import { novoUsuarioSchema } from './validar-novo-usuario'
import { exigirAdministrador } from './server/exigir-administrador'
import { getSupabaseAdmin } from './server/supabase-admin'
import { gerarSenhaProvisoria } from './server/gerar-senha-provisoria'

export const criarUsuario = createServerFn({
  method: 'POST',
})
  .inputValidator(novoUsuarioSchema)
  .handler(async ({ data }) => {
    const administrador = await exigirAdministrador()
    const supabase = getSupabaseAdmin()

    const senhaProvisoria = gerarSenhaProvisoria()

    const { data: conta, error: erroConta } =
      await supabase.auth.admin.createUser({
        email: data.email.trim().toLowerCase(),
        password: senhaProvisoria,
        email_confirm: true,
      })

    if (erroConta || !conta.user) {
      throw new Error(
        'Não foi possível criar a conta. Verifique se o e-mail já está cadastrado.',
      )
    }

    const usuarioId = conta.user.id

    const { error: erroPerfil } = await supabase
      .from('profiles')
      .insert({
        user_id: usuarioId,
        company_id: administrador.companyId,
        codigo: data.codigo,
        full_name: data.nome,
        role: data.perfil,
        active: true,
        must_change_password: true,
      })

    if (erroPerfil) {
      const { error: erroExclusao } =
        await supabase.auth.admin.deleteUser(usuarioId)

      if (erroExclusao) {
        throw new Error(
          'O perfil não foi criado e a exclusão automática da conta falhou. Solicite uma verificação administrativa.',
        )
      }

      throw new Error(
        'Não foi possível cadastrar o perfil. Verifique se o código já está em uso.',
      )
    }

    return {
      sucesso: true,
      mensagem: 'Usuário cadastrado com sucesso.',
      codigo: data.codigo,
      senhaProvisoria,
    }
  })
