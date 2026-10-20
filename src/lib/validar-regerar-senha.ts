import { z } from 'zod'

export const regerarSenhaSchema = z.object({
  codigo: z.string().regex(
    /^\d{3}$/,
    'O código deve ter exatamente 3 dígitos.'
  ),
})
