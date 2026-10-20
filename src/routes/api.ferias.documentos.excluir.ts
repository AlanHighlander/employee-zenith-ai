import { createFileRoute } from '@tanstack/react-router'
import { getSupabaseServer } from '@/lib/server/auth/supabase-server'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

const BUCKET = 'documentos-ferias'

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function erro(mensagem: string, status: number) {
  return Response.json(
    { sucesso: false, mensagem },
    { status },
  )
}

export const Route = createFileRoute(
  '/api/ferias/documentos/excluir',
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origem = request.headers.get('origin')
        const url = new URL(request.url)

        const origemEsperada = url.origin
        const origemProxy =
          url.host === 'localhost:8080' &&
          request.headers.get('x-forwarded-proto') === 'https'
            ? `https://${url.host}`
            : null

        if (
          !origem ||
          (origem !== origemEsperada &&
            origem !== origemProxy)
        ) {
          return erro('Origem não autorizada.', 403)
        }

        const supabase = getSupabaseServer()

        const {
          data: { user },
          error: erroAutenticacao,
        } = await supabase.auth.getUser()

        if (erroAutenticacao || !user) {
          return erro('Você precisa estar autenticado.', 401)
        }

        if (
          !request.headers
            .get('content-type')
            ?.toLowerCase()
            .includes('application/json')
        ) {
          return erro('Formato da requisição inválido.', 415)
        }

        let dados: unknown

        try {
          const corpo = await request.text()

          if (corpo.length > 2000) {
            return erro('Requisição muito grande.', 413)
          }

          dados = JSON.parse(corpo)
        } catch {
          return erro('Dados inválidos.', 400)
        }

        if (
          !dados ||
          typeof dados !== 'object' ||
          !('documentoId' in dados) ||
          typeof dados.documentoId !== 'string' ||
          !UUID.test(dados.documentoId)
        ) {
          return erro('Documento inválido.', 400)
        }


        const documentoId = dados.documentoId

        // Verifica a autorização utilizando a sessão real
        // do RH ou administrador autenticado.
        const {
          data: autorizado,
          error: erroPermissao,
        } = await supabase.rpc(
          'pode_excluir_documento_antecipacao_ferias',
          {
            p_document_id: documentoId,
          },
        )

        if (erroPermissao) {
          console.error(
            'Erro ao verificar permissão de exclusão:',
            erroPermissao.message,
          )

          return erro(
            'Não foi possível verificar sua autorização.',
            500,
          )
        }

        if (autorizado !== true) {
          return erro(
            'Você não tem permissão para excluir este documento.',
            403,
          )
        }

        const admin = getSupabaseAdmin()


        // A função SQL valida o usuário e o acesso à loja,
        // bloqueia a solicitação, registra a auditoria
        // e remove o registro do documento.
        const {
          data: caminho,
          error: erroExclusao,
        } = await admin.rpc(
          'excluir_registro_documento_antecipacao_ferias',
          {
            p_document_id: documentoId,
            p_actor_user_id: user.id,
          },
        )

      if (
  erroExclusao ||
  typeof caminho !== 'string' ||
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    caminho,
  )
) {
          console.error('Diagnóstico da exclusão:', {
  erroSupabase: erroExclusao?.message ?? null,
  tipoCaminho: typeof caminho,
 caminhoValido:
  typeof caminho === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caminho),
})

          return erro(
            'Não foi possível excluir o documento. Verifique suas permissões e o estado da solicitação.',
            403,
          )
        }

        // Confirma que o caminho pertence ao documento
        // e à solicitação registrada na auditoria.
        const {
          data: caminhoValido,
          error: erroValidacao,
        } = await admin.rpc(
          'validar_caminho_exclusao_ferias',
          {
            p_document_id: documentoId,
            p_storage_path: caminho,
          },
        )

        if (erroValidacao || caminhoValido !== true) {
          console.error(
            'Falha na validação do caminho:',
            erroValidacao?.message ??
              'Caminho não corresponde à auditoria.',
          )

          return erro(
            'Não foi possível validar o arquivo. A limpeza ficou pendente para o administrador.',
            500,
          )
        }



        // O caminho vem do banco, não do navegador.

const {
  data: arquivosRemovidos,
  error: erroStorage,
} = await admin.storage
  .from(BUCKET)
  .remove([caminho])
if (erroStorage) {
  console.error(
    'Falha na limpeza do Storage:',
    erroStorage.message,
  )

  // Mantém a auditoria pendente para recuperação posterior.
  return erro(
    'O registro foi removido, mas a limpeza do arquivo ficou pendente. Informe o administrador.',
    500,
  )
}

const remocaoConfirmadaPelaApi =
  Array.isArray(arquivosRemovidos) &&
  arquivosRemovidos.some(
    (arquivo) => arquivo.name === caminho,
  )

if (!remocaoConfirmadaPelaApi) {
  console.warn(
    'O Storage não confirmou a remoção na resposta. Verificando o caminho exato do arquivo.',
  )
}
        // Confirma que o arquivo não aparece mais no Storage.


        // Verifica diretamente se o arquivo ainda existe no Storage.
        const {
          data: arquivoEncontrado,
          error: erroVerificacao,
        } = await admin.storage
          .from(BUCKET)
          .info(caminho)

        if (arquivoEncontrado && !erroVerificacao) {
          console.error(
            'Arquivo ainda existe no Storage:',
            documentoId,
          )

          return erro(
            'O arquivo ainda existe no Storage. A limpeza permanece pendente.',
            500,
          )
        }

      const codigoErro =
  erroVerificacao && 'code' in erroVerificacao
    ? erroVerificacao.code
    : undefined

const arquivoNaoEncontrado =
  erroVerificacao?.status === 404 ||
  codigoErro === 'NoSuchKey'

if (!arquivoNaoEncontrado) {
          console.error(
            'Não foi possível confirmar a ausência do arquivo:',
            erroVerificacao?.message ?? 'Resposta inesperada do Storage.',
          )

          return erro(
            'Não foi possível confirmar a remoção do arquivo. A limpeza permanece pendente.',
            500,
          )
        }



        const {
          error: erroConfirmacao,
        } = await admin.rpc(
          'confirmar_remocao_storage_ferias',
          { p_document_id: documentoId },
        )

        if (erroConfirmacao) {
          console.error(
            'Falha ao confirmar limpeza do documento:',
            erroConfirmacao.message,
          )

          return erro(
            'O arquivo foi removido, mas a confirmação no histórico ficou pendente.',
            500,
          )
        }

        return Response.json({
          sucesso: true,
          mensagem: 'Documento excluído com sucesso.',
        })
      },
    },
  },
})
