import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { entrarPorId } from '../lib/login-por-id'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const resultado = await entrarPorId({
        data: { codigo, senha },
      })

      const { error } = await supabase.auth.setSession({
        access_token: resultado.access_token,
        refresh_token: resultado.refresh_token,
      })

      if (error) {
        throw error
      }

      await navigate({ to: '/' })
    } catch {
      setErro('ID ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f3f6fa',
      padding: 20,
    }}>
      <form onSubmit={entrar} style={{
        width: '100%',
        maxWidth: 400,
        padding: 32,
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 8px 30px #00000012',
      }}>
        <h1 style={{ marginBottom: 8 }}>Pessoas360</h1>
        <p style={{ color: '#64748b', marginBottom: 24 }}>
          Acesse sua conta
        </p>

        <label htmlFor="codigo">ID do usuário</label>
        <input
          id="codigo"
          type="text"
          inputMode="numeric"
          maxLength={3}
          pattern="[0-9]{3}"
          placeholder="001"
          value={codigo}
          onChange={e =>
            setCodigo(e.target.value.replace(/\D/g, '').slice(0, 3))
          }
          required
          autoComplete="username"
          style={{ width: '100%', padding: 12, margin: '8px 0 20px' }}
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
          autoComplete="current-password"
          style={{ width: '100%', padding: 12, margin: '8px 0 20px' }}
        />

        {erro && <p role="alert" style={{ color: '#dc2626' }}>{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          style={{
            width: '100%',
            padding: 14,
            background: '#2563eb',
            color: 'white',
            border: 0,
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
