
import { useState, type FormEvent } from 'react'
import { solicitarAntecipacaoFerias } from '../../lib/solicitar-antecipacao-ferias'

type Props = {
  periodoId: string
  funcionarioNome: string
}

export default function FormularioAntecipacaoFerias({
  periodoId,
  funcionarioNome,
}: Props) {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [justificativa, setJustificativa] = useState('')
  const [documentoReferencia, setDocumentoReferencia] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  async function enviarSolicitacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')
    setMensagem('')

    if (!periodoId) {
      setErro('Período aquisitivo não informado.')
      return
    }

    if (!dataInicio || !dataFim || dataFim < dataInicio) {
      setErro('Informe um intervalo de datas válido.')
      return
    }

    if (justificativa.trim().length < 3) {
      setErro('Informe uma justificativa com pelo menos 3 caracteres.')
      return
    }

    setEnviando(true)

    try {
      const resultado = await solicitarAntecipacaoFerias({
        data: {
          periodoId,
          dataInicio,
          dataFim,
          justificativa: justificativa.trim(),
          documentoReferencia: documentoReferencia.trim(),
        },
      })

      setMensagem(resultado.mensagem)
      setDataInicio('')
      setDataFim('')
      setJustificativa('')
      setDocumentoReferencia('')
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar a solicitação.',
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section
      style={{
        padding: 20,
        border: '1px solid #d1d5db',
        borderRadius: 12,
        marginTop: 20,
      }}
    >
      <h2>Solicitar antecipação de férias</h2>

      <p>
        <strong>Funcionário:</strong> {funcionarioNome}
      </p>

      <p>
        A solicitação será enviada para análise.
        O registro não concede férias nem desconta dias do saldo.
      </p>

      <form onSubmit={enviarSolicitacao}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="ferias-inicio">Data de início</label>
          <input
            id="ferias-inicio"
            type="date"
            required
            value={dataInicio}
            onChange={(event) => setDataInicio(event.target.value)}
            style={{ display: 'block', padding: 8, width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="ferias-fim">Data de término</label>
          <input
            id="ferias-fim"
            type="date"
            required
            min={dataInicio || undefined}
            value={dataFim}
            onChange={(event) => setDataFim(event.target.value)}
            style={{ display: 'block', padding: 8, width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="ferias-justificativa">Justificativa</label>
          <textarea
            id="ferias-justificativa"
            required
            minLength={3}
            maxLength={2000}
            rows={4}
            value={justificativa}
            onChange={(event) => setJustificativa(event.target.value)}
            style={{ display: 'block', padding: 8, width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="ferias-documento">
            Referência do acordo individual (opcional)
          </label>
          <input
            id="ferias-documento"
            type="text"
            maxLength={500}
            value={documentoReferencia}
            onChange={(event) => setDocumentoReferencia(event.target.value)}
            placeholder="Ex.: Acordo interno 001/2026"
            style={{ display: 'block', padding: 8, width: '100%' }}
          />
        </div>

        {erro && (
          <p role="alert" style={{ color: '#b91c1c' }}>
            {erro}
          </p>
        )}

        {mensagem && (
          <p role="status" style={{ color: '#166534' }}>
            {mensagem}
          </p>
        )}

        <button type="submit" disabled={enviando || !periodoId}>
          {enviando ? 'Enviando...' : 'Enviar solicitação'}
        </button>
      </form>
    </section>
  )
}
