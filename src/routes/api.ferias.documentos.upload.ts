
import { createFileRoute } from '@tanstack/react-router'
import { getSupabaseServer } from '@/lib/server/auth/supabase-server'
import { getSupabaseAdmin } from '@/lib/server/supabase-admin'
import {
  validarAssinaturaDocumento,
  validarExtensaoDocumento,
} from '@/lib/server/ferias/validar-documento'

const BUCKET = 'documentos-ferias'
const LIMITE_ARQUIVO = 10 * 1024 * 1024
const LIMITE_REQUISICAO = 11 * 1024 * 1024

const TIPOS_PERMITIDOS = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
])

function respostaErro(
  mensagem: string,
  status: number,
) {
  return Response.json(
    { sucesso: false, mensagem },
    { status },
  )
}

async function lerFormularioLimitado(
  request: Request,
): Promise<FormData> {
  if (!request.body) {
    throw new Error('FORMULARIO_INVALIDO')
  }

  const leitor = request.body.getReader()
  const partes: Uint8Array[] = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await leitor.read()

      if (done) break

      total += value.byteLength

      if (total > LIMITE_REQUISICAO) {
        await leitor.cancel().catch(() => undefined)
        throw new Error('ARQUIVO_GRANDE')
      }

      partes.push(value)
    }
  } finally {
    leitor.releaseLock()
  }

  const conteudo = new Uint8Array(total)
  let posicao = 0

  for (const parte of partes) {
    conteudo.set(parte, posicao)
    posicao += parte.byteLength
  }

  const novaRequisicao = new Request(request.url, {
    method: 'POST',
    headers: {
      'content-type':
        request.headers.get('content-type') ?? '',
    },
    body: conteudo,
  })

  return novaRequisicao.formData()
}

export const Route = createFileRoute(
  '/api/ferias/documentos/upload',
)({
  server: {
    handlers: {
      POST: async ({ request }) => {

const origem = request.headers.get('origin')

const urlInterna = new URL(request.url)
const hostInterno = urlInterna.host

const protocoloExterno =
  request.headers.get('x-forwarded-proto')

const origemEsperada = urlInterna.origin

const origemProxy =
  hostInterno === 'localhost:8080' &&
  protocoloExterno === 'https'
    ? `https://${hostInterno}`
    : null

if (
  !origem ||
  (
    origem !== origemEsperada &&
    origem !== origemProxy
  )
) {
  return respostaErro(
    'Origem da requisição não autorizada.',
    403,
  )
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

        const tipoConteudo =
          request.headers.get('content-type') ?? ''

        if (
          !tipoConteudo.toLowerCase().includes(
            'multipart/form-data',
          )
        ) {
          return respostaErro(
            'Envie os dados como formulário.',
            415,
          )
        }

        const cabecalhoTamanho =
          request.headers.get('content-length')

        if (cabecalhoTamanho !== null) {
          const tamanhoInformado =
            Number(cabecalhoTamanho)

          if (
            !Number.isFinite(tamanhoInformado) ||
            tamanhoInformado < 0 ||
            tamanhoInformado > LIMITE_REQUISICAO
          ) {
            return respostaErro(
              'A requisição ultrapassa o limite permitido.',
              413,
            )
          }
        }

        let formulario: FormData

        try {
          formulario =
            await lerFormularioLimitado(request)
        } catch (erro) {
          if (
            erro instanceof Error &&
            erro.message === 'ARQUIVO_GRANDE'
          ) {
            return respostaErro(
              'A requisição ultrapassa o limite de 11 MB.',
              413,
            )
          }

          return respostaErro(
            'Não foi possível ler o formulário.',
            400,
          )
        }

        const solicitacaoId =
          formulario.get('solicitacaoId')

        if (
          typeof solicitacaoId !== 'string' ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            solicitacaoId,
          )
        ) {
          return respostaErro(
            'Identificador da solicitação inválido.',
            400,
          )
        }

        const {
          data: permitido,
          error: erroPermissao,
        } = await supabase.rpc(
          'pode_anexar_documento_antecipacao_ferias',
          {
            p_request_id: solicitacaoId,
          },
        )

        if (erroPermissao) {
          return respostaErro(
            'Não foi possível verificar a autorização.',
            500,
          )
        }

        if (permitido !== true) {
          return respostaErro(
            'Você não tem permissão para anexar documentos a esta solicitação.',
            403,
          )
        }

        const arquivo = formulario.get('arquivo')

        if (!(arquivo instanceof File)) {
          return respostaErro(
            'Selecione um arquivo para enviar.',
            400,
          )
        }

        if (
          arquivo.size === 0 ||
          arquivo.size > LIMITE_ARQUIVO
        ) {
          return respostaErro(
            'O arquivo deve ter entre 1 byte e 10 MB.',
            413,
          )
        }

        if (!TIPOS_PERMITIDOS.has(arquivo.type)) {
          return respostaErro(
            'Formato não permitido. Utilize PDF, Word, Excel, JPG ou PNG.',
            415,
          )
        }

        const nome = arquivo.name.trim()

        if (
          nome.length === 0 ||
          nome.length > 255 ||
          !validarExtensaoDocumento(arquivo)
        ) {
          return respostaErro(
            'Nome ou extensão do arquivo inválido.',
            415,
          )
        }

        let assinaturaValida = false

        try {
          assinaturaValida =
            await validarAssinaturaDocumento(arquivo)
        } catch {
          return respostaErro(
            'Não foi possível verificar o conteúdo do arquivo.',
            400,
          )
        }

        if (!assinaturaValida) {
          return respostaErro(
            'O conteúdo do arquivo não corresponde ao formato informado.',
            415,
          )
        }

        // Verifica novamente a permissão antes de gravar.
        const {
          data: aindaPermitido,
          error: erroNovaPermissao,
        } = await supabase.rpc(
          'pode_anexar_documento_antecipacao_ferias',
          {
            p_request_id: solicitacaoId,
          },
        )

        if (erroNovaPermissao) {
          return respostaErro(
            'Não foi possível confirmar a autorização.',
            500,
          )
        }

        if (aindaPermitido !== true) {
          return respostaErro(
            'Esta solicitação não permite mais anexos.',
            403,
          )
        }

        const admin = getSupabaseAdmin()

        const identificadorArquivo = crypto.randomUUID()
        const caminho =
          `${solicitacaoId}/${identificadorArquivo}`

        let conteudo: ArrayBuffer

        try {
          conteudo = await arquivo.arrayBuffer()
        } catch {
          return respostaErro(
            'Não foi possível ler o documento.',
            400,
          )
        }

        const { error: erroUpload } =
          await admin.storage
            .from(BUCKET)
            .upload(caminho, conteudo, {
              contentType: arquivo.type,
              upsert: false,
              cacheControl: '3600',
            })

        if (erroUpload) {
          console.error(
            'Erro ao armazenar documento de férias:',
            erroUpload.message,
          )

          return respostaErro(
            'Não foi possível armazenar o documento.',
            500,
          )
        }

        // A função SQL confirma a existência do objeto,
        // seu tamanho, formato e a autorização do usuário.
        const {
          data: documentoId,
          error: erroRegistro,
        } = await supabase.rpc(
          'registrar_documento_antecipacao_ferias',
          {
            p_request_id: solicitacaoId,
            p_storage_path: caminho,
            p_original_filename: nome,
            p_mime_type: arquivo.type,
            p_file_size_bytes: arquivo.size,
          },
        )

        if (erroRegistro || !documentoId) {
          console.error(
            'Erro ao registrar documento de férias:',
            erroRegistro?.message ??
              'Identificador não retornado.',
          )

          // Evita manter um arquivo sem registro no banco.
          const { error: erroLimpeza } =
            await admin.storage
              .from(BUCKET)
              .remove([caminho])

          if (erroLimpeza) {
            console.error(
              'Falha ao remover arquivo sem registro:',
              erroLimpeza.message,
            )
          }

          return respostaErro(
            'O documento foi enviado, mas não pôde ser registrado.',
            500,
          )
        }

        return Response.json(
          {
            sucesso: true,
            mensagem: 'Documento anexado com sucesso.',
            documentoId,
          },
          { status: 201 },
        )
      },
    },
  },
})
