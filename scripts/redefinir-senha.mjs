import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const env = readFileSync('.env.local', 'utf8')
const getEnv = (key) => {
  const line = env.split(/\r?\n/).find(l => l.startsWith(`${key}=`))
  return line?.slice(key.length + 1).trim().replace(/^["']|["']$/g, '')
}

const url = getEnv('SUPABASE_URL')
const key = getEnv('SUPABASE_SECRET_KEY')

if (!url || !key) {
  throw new Error('Configuração do Supabase incompleta.')
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const { data: perfil, error } = await admin
  .from('profiles')
  .select('user_id')
  .eq('codigo', '001')
  .eq('role', 'admin')
  .eq('active', true)
  .single()

if (error || !perfil) {
  throw new Error('Administrador 001 não encontrado. Detalhes: ' + (error?.message ?? 'Consulta sem resultado'))
}

const rl = createInterface({ input: stdin, output: stdout })

try {
  const senha = await rl.question('Digite a nova senha temporária: ')

  if (senha.length < 8) {
    throw new Error('A senha precisa ter pelo menos 8 caracteres.')
  }

  const { error: erroSenha } = await admin.auth.admin.updateUserById(
    perfil.user_id,
    { password: senha }
  )

  if (erroSenha) throw erroSenha

  console.log('Senha do Administrador 001 atualizada com sucesso.')
} finally {
  rl.close()
}
