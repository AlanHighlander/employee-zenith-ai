
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { exigirAdministrador } from './server/exigir-administrador'
import { getSupabaseServer } from './server/auth/supabase-server'

const editarUsuarioSchema = z.object({
  userId: z.string().uuid(),
  nome: z.string().trim().min(3).max(150),
  perfil: z.enum(['rh', 'diretoria']),
  ativo: z.boolean(),
})

export const editarUsuario = createServerFn({
  method: 'POST',
})
  .inputValidator(editarUsuarioSchema)
  .handler(async ({ data }) => {
    // Exige administrador autenticado e senha provisória já alterada.
    await exigirAdministrador()

    // A chamada usa a sessão do usuário, não a chave administrativa.
    const supabase = getSupabaseServer()

    const { error } = await supabase.rpc('editar_usuario', {
      p_user_id: data.userId,
      p_full_name: data.nome,
      p_role: data.perfil,
      p_active: data.ativo,
    })

    if (error) {
      throw new Error(
        error.message || 'Não foi possível editar o usuário.'
      )
    }

    return {
      sucesso: true,
      mensagem: 'Usuário atualizado com sucesso.',
    }
  })
