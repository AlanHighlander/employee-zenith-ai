import { createServerOnlyFn } from '@tanstack/react-start'
import { createClient } from '@supabase/supabase-js'

export const getSupabaseAdmin = createServerOnlyFn(() => {
  const url = process.env['SUPABASE_URL']
  const secretKey = process.env['SUPABASE_SECRET_KEY']

  if (!url || !secretKey) {
    throw new Error('Configuração do Supabase no servidor incompleta')
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
})
