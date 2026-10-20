import { useState } from 'react'
import { criarUsuario } from '@/lib/criar-usuario'
import { regerarSenha } from '@/lib/regerar-senha'

export function FormularioNovoUsuario() {
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [perfil, setPerfil] = useState<'rh' | 'diretoria'>('rh')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [senhaProvisoria, setSenhaProvisoria] = useState('')

  async function cadastrarUsuario() {
    if (salvando) return

    setSalvando(true)
    setErro('')
    setSenhaProvisoria('')

    try {
      const resultado = await criarUsuario({
        data: { codigo, nome, email, perfil },
      })

      setSenhaProvisoria(resultado.senhaProvisoria)
      setCodigo('')
      setNome('')
      setEmail('')
      setPerfil('rh')
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível cadastrar o usuário.',
      )
    } finally {
      setSalvando(false)
    }
  }

  const [codigoRedefinicao, setCodigoRedefinicao] = useState('')

  async function confirmarRedefinicao() {
    if (!/^\d{3}$/.test(codigoRedefinicao)) {
      alert('Informe um código de 3 dígitos.')
      return
    }

    const confirmou = window.confirm(
      `Deseja realmente redefinir a senha do usuário ${codigoRedefinicao}?`
    )

    if (!confirmou) return

    setSalvando(true)
    setErro('')
    setSenhaProvisoria('')

    try {
      const resultado = await regerarSenha({
        data: { codigo: codigoRedefinicao },
      })

      setSenhaProvisoria(resultado.senhaProvisoria)
      setCodigoRedefinicao('')
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível redefinir a senha.'
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-xl border p-6">
      <h2 className="text-xl font-semibold">Novo usuário</h2>

      <label className="mt-4 block">
        Código do usuário
        <input
          className="mt-1 w-full rounded border p-2"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          maxLength={3}
          placeholder="Ex.: 002"
        />
      </label>

      <label className="mt-4 block">
        Nome completo
        <input
          className="mt-1 w-full rounded border p-2"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome completo do usuário"
        />
      </label>

      <label className="mt-4 block">
        E-mail
        <input
          type="email"
          className="mt-1 w-full rounded border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@empresa.com.br"
        />
      </label>

      <label className="mt-4 block">
        Perfil de acesso
        <select
          className="mt-1 w-full rounded border p-2"
          value={perfil}
          onChange={(e) =>
            setPerfil(e.target.value as 'rh' | 'diretoria')
          }
        >
          <option value="rh">RH</option>
          <option value="diretoria">Diretoria</option>
        </select>
      </label>

      <button
        type="button"
        onClick={cadastrarUsuario}
        disabled={salvando}
        className="mt-6 rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
      >
        Cadastrar usuário
      </button>
      {erro && (
        <p role="alert" className="mt-4 text-red-600">
          {erro}
        </p>
      )}

      {senhaProvisoria && (
        <div className="mt-4 rounded border p-4">
          <p className="font-semibold">
            Usuário cadastrado com sucesso!
          </p>

          <p className="mt-2">
            Senha provisória: <strong>{senhaProvisoria}</strong>
          </p>

          <button
            type="button"
            className="mt-3 rounded bg-blue-700 px-3 py-2 text-white"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(senhaProvisoria)
                alert('Senha provisória copiada!')
              } catch {
                alert('Não foi possível copiar a senha.')
              }
            }}
          >
            Copiar senha
          </button>

          <p className="mt-2 text-sm">
            Entregue a senha ao usuário por um canal seguro.
            Ele deverá trocá-la no primeiro acesso.
          </p>

          <button
            type="button"
            className="mt-3 rounded border px-3 py-2"
            onClick={() => setSenhaProvisoria('')}
          >
            Ocultar senha
          </button>
        </div>
      )}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold">
          Regerar senha provisória
        </h3>

        <p className="mt-2 text-sm">
          Informe o código do usuário que precisa de uma nova senha.
        </p>

        <input
          className="mt-3 w-full rounded border p-2"
          value={codigoRedefinicao}
          onChange={(e) => setCodigoRedefinicao(e.target.value)}
          maxLength={3}
          placeholder="Ex.: 002"
        />

        <button
          type="button"
          onClick={confirmarRedefinicao}
          disabled={salvando}
          className="mt-3 rounded bg-amber-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {salvando ? 'Aguarde...' : 'Regerar senha provisória'}
        </button>
      </div>
    </section>
  )
}
