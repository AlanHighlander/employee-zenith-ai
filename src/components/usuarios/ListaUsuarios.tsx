
import { useEffect, useState } from 'react'
import { listarUsuarios } from '@/lib/listar-usuarios'
import { EditarUsuario } from './EditarUsuario'

type Usuario = Awaited<ReturnType<typeof listarUsuarios>>[number]

export function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [usuarioSelecionado, setUsuarioSelecionado] =
    useState<Usuario | null>(null)

  async function carregarUsuarios() {
    setCarregando(true)
    setErro('')

    try {
      const resultado = await listarUsuarios()
      setUsuarios(resultado)

      if (usuarioSelecionado) {
        const atualizado = resultado.find(
          (usuario) => usuario.user_id === usuarioSelecionado.user_id,
        )

        if (atualizado) {
          setUsuarioSelecionado(atualizado)
        } else {
          setUsuarioSelecionado(null)
        }
      }
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os usuários.',
      )
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregarUsuarios()
  }, [])

  if (usuarioSelecionado) {
    return (
      <EditarUsuario
        usuario={usuarioSelecionado}
        onVoltar={() => setUsuarioSelecionado(null)}
        onSalvo={() => {
          void carregarUsuarios()
        }}
      />
    )
  }

  return (
    <section className="rounded-xl border p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          Usuários cadastrados
        </h2>

        <button
          type="button"
          onClick={() => void carregarUsuarios()}
          disabled={carregando}
          className="rounded border px-3 py-2 disabled:opacity-50"
        >
          Atualizar lista
        </button>
      </div>

      {carregando && (
        <p className="mt-4">Carregando usuários...</p>
      )}

      {erro && (
        <p role="alert" className="mt-4 text-red-600">
          {erro}
        </p>
      )}

      {!carregando && !erro && usuarios.length === 0 && (
        <p className="mt-4">Nenhum usuário encontrado.</p>
      )}

      {!carregando && !erro && usuarios.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3">Código</th>
                <th className="p-3">Nome</th>
                <th className="p-3">Perfil</th>
                <th className="p-3">Situação</th>
                <th className="p-3">Senha</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.user_id} className="border-b">
                  <td className="p-3">{usuario.codigo}</td>
                  <td className="p-3">{usuario.full_name}</td>
                  <td className="p-3">
                    {usuario.role === 'admin'
                      ? 'Administrador'
                      : usuario.role === 'rh'
                        ? 'RH'
                        : usuario.role === 'diretoria'
                          ? 'Diretoria'
                          : usuario.role}
                  </td>
                  <td className="p-3">
                    {usuario.active ? 'Ativo' : 'Inativo'}
                  </td>
                  <td className="p-3">
                    {usuario.must_change_password
                      ? 'Troca obrigatória'
                      : 'Regular'}
                  </td>
                  <td className="p-3">
                    {usuario.role !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => setUsuarioSelecionado(usuario)}
                        className="rounded bg-blue-700 px-3 py-1.5 text-white hover:bg-blue-800"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
