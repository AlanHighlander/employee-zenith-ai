import { createServerOnlyFn } from '@tanstack/react-start'
import { getCookies, setCookie } from '@tanstack/react-start/server'
import { createServerClient } from '@supabase/ssr'

export const getSupabaseServer = createServerOnlyFn(() => {
  const url = process.env['SUPABASE_URL']
  const anonKey = process.env['SUPABASE_ANON_KEY']

  if (!url || !anonKey) {
    throw new Error('Configuração do Supabase incompleta.')
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
  return Object.entries(getCookies()).map(([name, value]) => ({
    name,
    value,
  }))
},
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => {
          setCookie(name, value, {
            ...options,
           secure: process.env['NODE_ENV'] === 'production',
            sameSite: 'lax',
            path: '/',
          })
        })
      },
    },
  })
})
