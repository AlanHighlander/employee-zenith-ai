import { z } from 'zod'

export const trocarSenhaSchema = z.object({
  novaSenha: z.string().min(8, 'Use pelo menos 8 caracteres.'),
  confirmarSenha: z.string(),
}).refine(
  (dados) => dados.novaSenha === dados.confirmarSenha,
  {
    message: 'As senhas não coincidem.',
    path: ['confirmarSenha'],
  }
)

export type TrocarSenha = z.infer<typeof trocarSenhaSchema>
