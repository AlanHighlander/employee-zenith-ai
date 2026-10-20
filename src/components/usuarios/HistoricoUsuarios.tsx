
import { useEffect, useState } from 'react'
import { listarHistoricoUsuarios } from '@/lib/listar-historico-usuarios'

type Registro = Awaited<
  ReturnType<typeof listarHistoricoUsuarios>
>[number]

function formatarData(data: string) {
  return new Date(data).toLocaleString('pt-BR')
}

function nomePerfil(perfil: string) {
  if (perfil === 'admin') return 'Administrador'
  if (perfil === 'rh') return 'RH'
  if (perfil === 'diretoria') return 'Diretoria'
  return perfil
}

export function HistoricoUsuarios() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  async function carregarHistorico() {
    setCarregando(true)
    setErro('')

    try {
      const resultado = await listarHistoricoUsuarios({
        data: {},
      })

      setRegistros(resultado)
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o histórico.',
      )
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregarHistorico()
  }, [])

  return (
    <section className="rounded-xl border p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            Histórico de alterações
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Consulte as alterações de nome, perfil e situação dos usuários.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void carregarHistorico()}
          disabled={carregando}
          className="rounded border px-3 py-2 disabled:opacity-50"
        >
          Atualizar histórico
        </button>
      </div>

      {carregando && (
        <p className="mt-4">Carregando histórico...</p>
      )}

      {erro && (
        <p role="alert" className="mt-4 text-red-600">
          {erro}
        </p>
      )}

      {!carregando && !erro && registros.length === 0 && (
        <p className="mt-4">
          Nenhuma alteração registrada.
        </p>
      )}

      {!carregando && !erro && registros.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3">Data e hora</th>
                <th className="p-3">Usuário alterado</th>
                <th className="p-3">Alteração</th>
                <th className="p-3">Responsável pela edição</th>
              </tr>
            </thead>

            <tbody>
              {registros.map((registro) => {
                const alteracoes: string[] = []

                if (
                  registro.old_full_name !== registro.new_full_name
                ) {
                  alteracoes.push(
                    `Nome: ${registro.old_full_name} → ${registro.new_full_name}`,
                  )
                }

                if (registro.old_role !== registro.new_role) {
                  alteracoes.push(
                    `Perfil: ${nomePerfil(registro.old_role)} → ${nomePerfil(registro.new_role)}`,
                  )
                }

                if (registro.old_active !== registro.new_active) {
                  alteracoes.push(
                    `Situação: ${registro.old_active ? 'Ativo' : 'Inativo'} → ${registro.new_active ? 'Ativo' : 'Inativo'}`,
                  )
                }

                return (
                  <tr key={registro.id} className="border-b align-top">
                    <td className="p-3 whitespace-nowrap">
                      {formatarData(registro.changed_at)}
                    </td>

                    <td className="p-3">
                      <div>{registro.new_full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        ID: {registro.target_user_id}
                      </div>
                    </td>

                    <td className="p-3">
                      {alteracoes.length > 0 ? (
                        <ul className="space-y-1">
                          {alteracoes.map((alteracao) => (
                            <li key={alteracao}>{alteracao}</li>
                          ))}
                        </ul>
                      ) : (
                        'Sem diferenças nos campos registrados'
                      )}
                    </td>

                   <td className="p-3 font-medium">
  {registro.responsavel_codigo}
</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
