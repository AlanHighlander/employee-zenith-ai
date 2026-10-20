
import { useState } from 'react'
import { editarUsuario } from '@/lib/editar-usuario'

type Props = {
  usuario: {
    user_id: string
    codigo: string | null
    full_name: string
    role: string
    active: boolean
  }
  onVoltar: () => void
  onSalvo: () => void
}

export function EditarUsuario({
  usuario,
  onVoltar,
  onSalvo,
}: Props) {
  const [nome, setNome] = useState(usuario.full_name)
  const [perfil, setPerfil] = useState<'rh' | 'diretoria'>(
    usuario.role === 'diretoria' ? 'diretoria' : 'rh',
  )
  const [ativo, setAtivo] = useState(usuario.active)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  async function salvar() {
    if (salvando) return

    setErro('')
    setMensagem('')

    if (nome.trim().length < 3) {
      setErro('Informe um nome com pelo menos 3 caracteres.')
      return
    }

    setSalvando(true)

    try {
      const resultado = await editarUsuario({
        data: {
          userId: usuario.user_id,
          nome: nome.trim(),
          perfil,
          ativo,
        },
      })

      setMensagem(resultado.mensagem)
      onSalvo()
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar o usuário.',
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className="rounded-xl border p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Editar usuário</h2>

        <button
          type="button"
          onClick={onVoltar}
          className="rounded border px-3 py-2"
        >
          ← Voltar
        </button>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Código: {usuario.codigo || 'Não informado'}
      </p>

      <label className="mt-4 block">
        Nome completo
        <input
          className="mt-1 w-full rounded border bg-background p-2"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={150}
          required
        />
      </label>

      <label className="mt-4 block">
        Perfil de acesso
        <select
          className="mt-1 w-full rounded border bg-background p-2"
          value={perfil}
          onChange={(e) =>
            setPerfil(e.target.value as 'rh' | 'diretoria')
          }
        >
          <option value="rh">RH</option>
          <option value="diretoria">Diretoria</option>
        </select>
      </label>

      <label className="mt-4 flex items-center gap-3">
        <input
          type="checkbox"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
        />
        Usuário ativo
      </label>

      {erro && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {erro}
        </p>
      )}

      {mensagem && (
        <p role="status" className="mt-4 text-sm text-green-600">
          {mensagem}
        </p>
      )}

      <button
        type="button"
        onClick={salvar}
        disabled={salvando}
        className="mt-6 rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
      >
        {salvando ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </section>
  )
}
