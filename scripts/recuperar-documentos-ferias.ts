import { createClient } from '@supabase/supabase-js'

const url = process.env['SUPABASE_URL']
const chave = process.env['SUPABASE_SECRET_KEY']

if (!url || !chave) {
  throw new Error('Configuração do Supabase incompleta.')
}

const supabase = createClient(url, chave, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const bucket = 'documentos-ferias'
const executarLimpeza =
  process.env['CONFIRMAR_LIMPEZA_FERIAS'] === 'SIM'

console.log(
  executarLimpeza
    ? 'ATENÇÃO: modo de remoção real ativado.'
    : 'Modo de simulação: nenhum arquivo será removido.',
)

const { data: pendentes, error: erroConsulta } =
  await supabase.rpc('listar_limpezas_pendentes_ferias')

if (erroConsulta) {
  throw new Error(
    `Falha ao consultar pendências: ${erroConsulta.message}`,
  )
}

console.log(
  `Exclusões pendentes: ${pendentes?.length ?? 0}`,
)

for (const pendencia of pendentes ?? []) {
  const documentoId = pendencia.documento_id
  const caminho = pendencia.caminho_arquivo

  const { data: valido, error: erroValidacao } =
    await supabase.rpc('validar_caminho_exclusao_ferias', {
      p_document_id: documentoId,
      p_storage_path: caminho,
    })

  if (erroValidacao || valido !== true) {
    console.error(
      `Documento ${documentoId}: caminho inválido.`,
    )
    continue
  }

  if (!executarLimpeza) {
    console.log(
      `SIMULAÇÃO: documento ${documentoId} seria removido.`,
    )
    continue
  }


  const {
    data: arquivosRemovidos,
    error: erroRemocao,
  } = await supabase.storage
    .from(bucket)
    .remove([caminho])

  if (erroRemocao) {
    console.error(
      `Documento ${documentoId}: falha na remoção.`,
      erroRemocao.message,
    )
    continue
  }

  if (!arquivosRemovidos?.length) {
    console.warn(
      `Documento ${documentoId}: a API não retornou arquivos removidos. Verificando a existência pelo caminho exato.`,
    )
  }




  // Verifica o caminho exato antes de confirmar a limpeza.
  const {
    data: arquivoEncontrado,
    error: erroVerificacao,
  } = await supabase.storage
    .from(bucket)
    .info(caminho)

  if (arquivoEncontrado && !erroVerificacao) {
    console.error(
      `Documento ${documentoId}: arquivo ainda existe no Storage. Confirmação bloqueada.`,
    )
    continue
  }

  const arquivoNaoEncontrado =
  erroVerificacao?.status === 404 ||
  erroVerificacao?.code === 'NoSuchKey'

if (!arquivoNaoEncontrado) {
  console.error(
    `Documento ${documentoId}: não foi possível confirmar a remoção.`,
    erroVerificacao?.message ?? 'Resposta inesperada do Storage.',
  )
  continue
}


  const { error: erroConfirmacao } =
    await supabase.rpc('confirmar_remocao_storage_ferias', {
      p_document_id: documentoId,
    })

  if (erroConfirmacao) {
    console.error(
      `Documento ${documentoId}: confirmação pendente.`,
      erroConfirmacao.message,
    )
    continue
  }

  console.log(
    `Documento ${documentoId}: limpeza concluída.`,
  )
}
