import { z } from 'zod'

export const novoUsuarioSchema = z.object({
  codigo: z.string().regex(/^\d{3}$/, 'O código deve ter 3 dígitos.'),
  nome: z.string().trim().min(3, 'Informe o nome completo.'),
  email: z.string().email('Informe um e-mail válido.'),
  perfil: z.enum(['rh', 'diretoria']),
})

export type NovoUsuario = z.infer<typeof novoUsuarioSchema>
