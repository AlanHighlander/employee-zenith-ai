import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { trocarSenha } from '../lib/trocar-senha'

export const Route = createFileRoute('/trocar-senha')({
  component: TrocarSenhaPage,
})

function TrocarSenhaPage() {
  const navigate = useNavigate()
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function salvar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')

    if (novaSenha.length < 8) {
      setErro('A senha precisa ter pelo menos 8 caracteres.')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)

    try {
      await trocarSenha({
        data: { novaSenha, confirmarSenha },
      })

      await navigate({ to: '/', reloadDocument: true })
    } catch {
      setErro('Não foi possível alterar a senha. Tente novamente.')
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
      <form onSubmit={salvar} style={{
        width: '100%',
        maxWidth: 400,
        padding: 32,
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 8px 30px #00000012',
      }}>
        <h1 style={{ marginBottom: 8 }}>Pessoas360</h1>

        <p style={{ color: '#64748b', marginBottom: 24 }}>
          Defina sua senha definitiva para continuar.
        </p>

        <label htmlFor="novaSenha">Nova senha</label>
        <input
          id="novaSenha"
          type="password"
          value={novaSenha}
          onChange={e => setNovaSenha(e.target.value)}
          minLength={8}
          required
          autoComplete="new-password"
          style={{ width: '100%', padding: 12, margin: '8px 0 20px' }}
        />

        <label htmlFor="confirmarSenha">Confirmar nova senha</label>
        <input
          id="confirmarSenha"
          type="password"
          value={confirmarSenha}
          onChange={e => setConfirmarSenha(e.target.value)}
          minLength={8}
          required
          autoComplete="new-password"
          style={{ width: '100%', padding: 12, margin: '8px 0 20px' }}
        />

        {erro && (
          <p role="alert" style={{ color: '#dc2626' }}>
            {erro}
          </p>
        )}

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
          {carregando ? 'Salvando...' : 'Salvar senha'}
        </button>
      </form>
    </main>
  )
}
