import { createServerOnlyFn } from '@tanstack/react-start'
import { randomInt } from 'node:crypto'

export const gerarSenhaProvisoria = createServerOnlyFn(() => {
  const caracteres =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'

  let senha = ''

  for (let i = 0; i < 8; i++) {
    senha += caracteres[randomInt(caracteres.length)]
  }

  return senha
})
