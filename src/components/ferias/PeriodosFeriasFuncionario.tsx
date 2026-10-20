
import { useEffect, useState } from 'react'
import { listarPeriodosFerias } from '../../lib/listar-periodos-ferias'
import FormularioAntecipacaoFerias from './FormularioAntecipacaoFerias'

type Props = {
  funcionarioId: string
}

type PeriodoFerias = {
  periodo_id: string
  funcionario_nome: string
  inicio_aquisitivo: string
  fim_aquisitivo: string
  prazo_concessivo: string
  dias_previstos: number
}

function formatarData(data: string) {
  const partes = data.split('-')

  if (partes.length !== 3) return data

  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

export default function PeriodosFeriasFuncionario({
  funcionarioId,
}: Props) {
  const [periodos, setPeriodos] = useState<PeriodoFerias[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string | null>(
    null,
  )

  useEffect(() => {
    let ativo = true

    async function carregarPeriodos() {
      setCarregando(true)
      setErro('')
      setPeriodos([])
      setPeriodoSelecionado(null)

      try {
        const resultado = await listarPeriodosFerias({
          data: { funcionarioId },
        })

        if (ativo) {
          setPeriodos(resultado as PeriodoFerias[])
        }
      } catch (error) {
        if (ativo) {
          setErro(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os períodos de férias.',
          )
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    void carregarPeriodos()

    return () => {
      ativo = false
    }
  }, [funcionarioId])

  const periodoAtual = periodos.find(
    (periodo) => periodo.periodo_id === periodoSelecionado,
  )

  return (
    <section
      style={{
        marginTop: 24,
        padding: 20,
        border: '1px solid #d1d5db',
        borderRadius: 12,
      }}
    >
      <h2>Gestão de férias</h2>

      {carregando && <p>Carregando períodos aquisitivos...</p>}

      {erro && (
        <p role="alert" style={{ color: '#b91c1c' }}>
          {erro}
        </p>
      )}

      {!carregando && !erro && periodos.length === 0 && (
        <p>Nenhum período aquisitivo cadastrado para este funcionário.</p>
      )}

      {!carregando &&
        !erro &&
        periodos.map((periodo) => (
          <div
            key={periodo.periodo_id}
            style={{
              padding: 16,
              marginTop: 12,
              border: '1px solid #e5e7eb',
              borderRadius: 8,
            }}
          >
            <p>
              <strong>Funcionário:</strong> {periodo.funcionario_nome}
            </p>

            <p>
              <strong>Período aquisitivo:</strong>{' '}
              {formatarData(periodo.inicio_aquisitivo)} até{' '}
              {formatarData(periodo.fim_aquisitivo)}
            </p>

            <p>
              <strong>Prazo concessivo:</strong>{' '}
              {formatarData(periodo.prazo_concessivo)}
            </p>

            <p>
              <strong>Dias previstos:</strong> {periodo.dias_previstos}
            </p>


<button
  type="button"
  className="mt-3 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  onClick={() =>
    setPeriodoSelecionado(
      periodoSelecionado === periodo.periodo_id
        ? null
        : periodo.periodo_id,
    )
  }
>
  {periodoSelecionado === periodo.periodo_id
    ? "Fechar solicitação"
    : "+ Solicitar antecipação"}
</button>

          </div>
        ))}

      {periodoAtual && (
        <FormularioAntecipacaoFerias
          key={periodoAtual.periodo_id}
          periodoId={periodoAtual.periodo_id}
          funcionarioNome={periodoAtual.funcionario_nome}
        />
      )}

      <p style={{ marginTop: 16, fontSize: 13 }}>
        Os dias previstos não representam necessariamente férias já
        adquiridas. Solicitações de antecipação dependem de análise
        jurídica e aprovação, sem desconto automático do saldo.
      </p>
    </section>
  )
}
