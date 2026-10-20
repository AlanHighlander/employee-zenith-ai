import { createFileRoute } from '@tanstack/react-router'
import { getSupabaseServer } from '@/lib/server/auth/supabase-server'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'

const BUCKET = 'documentos-ferias'

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const TIPOS_PERMITIDOS = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
])

function respostaErro(mensagem: string, status: number) {
  return Response.json(
    { sucesso: false, mensagem },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}

export const Route = createFileRoute(
  '/api/ferias/documentos/visualizar',
)({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const documentoId = url.searchParams.get('documentoId')

        if (!documentoId || !UUID.test(documentoId)) {
          return respostaErro('Documento inválido.', 400)
        }

        const supabase = getSupabaseServer()

        const {
          data: { user },
          error: erroAutenticacao,
        } = await supabase.auth.getUser()

        if (erroAutenticacao || !user) {
          return respostaErro(
            'Você precisa estar autenticado.',
            401,
          )
        }

        // A consulta usa a sessão do usuário e aplica
        // as permissões de empresa e loja no banco.
        const {
          data: documentos,
          error: erroConsulta,
        } = await supabase.rpc(
          'obter_documento_antecipacao_ferias',
          {
            p_document_id: documentoId,
          },
        )

        if (erroConsulta || !documentos?.length) {
          return respostaErro(
            'Documento não encontrado ou acesso não autorizado.',
            403,
          )
        }

        const documento = documentos[0]

        if (!documento) {
          return respostaErro('Documento não encontrado.', 404)
        }

        const caminho = documento.caminho_arquivo
        const tipo = documento.tipo_arquivo

        if (
          typeof caminho !== 'string' ||
          !UUID.test(caminho.split('/')[0] ?? '') ||
          !UUID.test(caminho.split('/')[1] ?? '') ||
          caminho.split('/').length !== 2 ||
          !TIPOS_PERMITIDOS.has(tipo)
        ) {
          return respostaErro(
            'Referência do documento inválida.',
            400,
          )
        }

        const admin = getSupabaseAdmin()

        const { data: arquivo, error: erroDownload } =
          await admin.storage
            .from(BUCKET)
            .download(caminho)

        if (erroDownload || !arquivo) {
          return respostaErro(
            'Não foi possível carregar o documento.',
            500,
          )
        }

        const nomeSeguro = String(
          documento.nome_arquivo ?? 'documento',
        )
          .replace(/[\r\n"\\]/g, '_')
          .slice(0, 180)

        const visualizarNoNavegador =
          tipo === 'application/pdf' ||
          tipo === 'image/jpeg' ||
          tipo === 'image/png'

        const disposicao = visualizarNoNavegador
          ? 'inline'
          : 'attachment'

        return new Response(arquivo, {
          status: 200,
          headers: {
            'Content-Type': tipo,
            'Content-Disposition':
              `${disposicao}; filename="${nomeSeguro}"`,
            'Cache-Control': 'private, no-store',
            'X-Content-Type-Options': 'nosniff',
            'Content-Security-Policy': "sandbox",
          },
        })
      },
    },
  },
})
