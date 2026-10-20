
import { inflateSync } from 'fflate'

const LIMITE_DESCOMPACTADO = 30 * 1024 * 1024

const ASSINATURAS = {
  pdf: [0x25, 0x50, 0x44, 0x46, 0x2d],
  jpg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  zip: [0x50, 0x4b, 0x03, 0x04],
  ole: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1],
} as const

function comecaCom(
  dados: Uint8Array,
  assinatura: readonly number[],
): boolean {
  return (
    dados.length >= assinatura.length &&
    assinatura.every(
      (byte, indice) => dados[indice] === byte,
    )
  )
}

function lerNumero16(
  dados: Uint8Array,
  posicao: number,
): number {
  return (
    dados[posicao]! +
    dados[posicao + 1]! * 256
  )
}

function lerNumero32(
  dados: Uint8Array,
  posicao: number,
): number {
  return (
    dados[posicao]! +
    dados[posicao + 1]! * 256 +
    dados[posicao + 2]! * 65536 +
    dados[posicao + 3]! * 16777216
  )
}

function calcularCRC32(dados: Uint8Array): number {
  let crc = 0xffffffff

  for (const byte of dados) {
    crc ^= byte

    for (let i = 0; i < 8; i++) {
      crc =
        (crc >>> 1) ^
        (crc & 1 ? 0xedb88320 : 0)
    }
  }

  return (crc ^ 0xffffffff) >>> 0
}

function listarArquivosZip(
  dados: Uint8Array,
): Set<string> | null {
  const nomes = new Set<string>()
  const decodificador = new TextDecoder('utf-8', {
    fatal: true,
  })

  let fim = -1

  const inicioBusca = Math.max(
    0,
    dados.length - 65557,
  )

  for (
    let i = dados.length - 22;
    i >= inicioBusca;
    i--
  ) {
    if (
      dados[i] === 0x50 &&
      dados[i + 1] === 0x4b &&
      dados[i + 2] === 0x05 &&
      dados[i + 3] === 0x06
    ) {
      fim = i
      break
    }
  }

  if (fim === -1) {
    return null
  }

  const numeroDisco = lerNumero16(
    dados,
    fim + 4,
  )

  const discoDiretorio = lerNumero16(
    dados,
    fim + 6,
  )

  const quantidadeDisco = lerNumero16(
    dados,
    fim + 8,
  )

  const quantidade = lerNumero16(
    dados,
    fim + 10,
  )

  const tamanhoDiretorio = lerNumero32(
    dados,
    fim + 12,
  )

  const posicaoDiretorio = lerNumero32(
    dados,
    fim + 16,
  )

  const tamanhoComentarioFinal = lerNumero16(
    dados,
    fim + 20,
  )

  if (
    numeroDisco !== 0 ||
    discoDiretorio !== 0 ||
    quantidadeDisco !== quantidade ||
    quantidade === 0 ||
    quantidade > 1000 ||
    tamanhoDiretorio === 0 ||
    fim + 22 + tamanhoComentarioFinal !== dados.length ||
    posicaoDiretorio + tamanhoDiretorio !== fim
  ) {
    return null
  }

  const fimDiretorio =
    posicaoDiretorio + tamanhoDiretorio

  if (
    posicaoDiretorio < 0 ||
    fimDiretorio > dados.length
  ) {
    return null
  }

  let posicao = posicaoDiretorio
  let totalDescompactado = 0

  try {
    for (let i = 0; i < quantidade; i++) {
      if (
        posicao + 46 > fimDiretorio ||
        lerNumero32(dados, posicao) !== 0x02014b50
      ) {
        return null
      }

      const indicadoresZip = lerNumero16(
        dados,
        posicao + 8,
      )

      const metodoCompressao = lerNumero16(
        dados,
        posicao + 10,
      )

      if (
        (indicadoresZip & ~0x0800) !== 0 ||
        (metodoCompressao !== 0 &&
          metodoCompressao !== 8)
      ) {
        return null
      }

      const crcDiretorio = lerNumero32(
        dados,
        posicao + 16,
      )

      const tamanhoComprimido = lerNumero32(
        dados,
        posicao + 20,
      )

      const tamanhoDescompactado = lerNumero32(
        dados,
        posicao + 24,
      )

      const tamanhoNome = lerNumero16(
        dados,
        posicao + 28,
      )

      const tamanhoExtra = lerNumero16(
        dados,
        posicao + 30,
      )

      const tamanhoComentario = lerNumero16(
        dados,
        posicao + 32,
      )

      const posicaoRegistroLocal = lerNumero32(
        dados,
        posicao + 42,
      )

      if (
        tamanhoComprimido === 0xffffffff ||
        tamanhoDescompactado === 0xffffffff ||
        posicaoRegistroLocal + 30 > posicaoDiretorio
      ) {
        return null
      }

      totalDescompactado += tamanhoDescompactado

      if (
        totalDescompactado > LIMITE_DESCOMPACTADO
      ) {
        return null
      }

      if (
        lerNumero32(
          dados,
          posicaoRegistroLocal,
        ) !== 0x04034b50
      ) {
        return null
      }

      const indicadoresLocais = lerNumero16(
        dados,
        posicaoRegistroLocal + 6,
      )

      const metodoLocal = lerNumero16(
        dados,
        posicaoRegistroLocal + 8,
      )

      const crcLocal = lerNumero32(
        dados,
        posicaoRegistroLocal + 14,
      )

      const tamanhoComprimidoLocal = lerNumero32(
        dados,
        posicaoRegistroLocal + 18,
      )

      const tamanhoDescompactadoLocal = lerNumero32(
        dados,
        posicaoRegistroLocal + 22,
      )

      const tamanhoNomeLocal = lerNumero16(
        dados,
        posicaoRegistroLocal + 26,
      )

      const tamanhoExtraLocal = lerNumero16(
        dados,
        posicaoRegistroLocal + 28,
      )

      if (
        indicadoresLocais !== indicadoresZip ||
        metodoLocal !== metodoCompressao ||
        crcLocal !== crcDiretorio ||
        tamanhoComprimidoLocal !== tamanhoComprimido ||
        tamanhoDescompactadoLocal !== tamanhoDescompactado ||
        tamanhoNomeLocal !== tamanhoNome
      ) {
        return null
      }

      const inicioNome = posicao + 46
      const fimNome = inicioNome + tamanhoNome

      const proximaPosicao =
        fimNome +
        tamanhoExtra +
        tamanhoComentario

      if (proximaPosicao > fimDiretorio) {
        return null
      }

      const inicioNomeLocal =
        posicaoRegistroLocal + 30

      const fimNomeLocal =
        inicioNomeLocal + tamanhoNomeLocal

      const inicioDados =
        fimNomeLocal + tamanhoExtraLocal

      const fimDados =
        inicioDados + tamanhoComprimido

      if (
        fimNomeLocal > posicaoDiretorio ||
        inicioDados > posicaoDiretorio ||
        fimDados > posicaoDiretorio
      ) {
        return null
      }

      const nome = decodificador.decode(
        dados.subarray(inicioNome, fimNome),
      )

      const nomeLocal = decodificador.decode(
        dados.subarray(
          inicioNomeLocal,
          fimNomeLocal,
        ),
      )

      if (
        !nome ||
        nome !== nomeLocal ||
        nome.startsWith('/') ||
        nome.includes('..') ||
        nome.includes('\\') ||
        nomes.has(nome)
      ) {
        return null
      }

      const dadosComprimidos = dados.subarray(
        inicioDados,
        fimDados,
      )

      let dadosOriginais: Uint8Array

      if (metodoCompressao === 0) {
        dadosOriginais = dadosComprimidos
      } else {
        dadosOriginais = inflateSync(
          dadosComprimidos,
          {
            out: new Uint8Array(
              tamanhoDescompactado,
            ),
          },
        )
      }

      if (
        dadosOriginais.byteLength !==
          tamanhoDescompactado ||
        calcularCRC32(dadosOriginais) !== crcDiretorio
      ) {
        return null
      }

      nomes.add(nome)
      posicao = proximaPosicao
    }
  } catch {
    return null
  }

  if (posicao !== fimDiretorio) {
    return null
  }

  return nomes
}

async function validarOfficeModerno(
  arquivo: File,
  tipo: 'word' | 'excel',
): Promise<boolean> {
  const conteudo = new Uint8Array(
    await arquivo.arrayBuffer(),
  )

  if (!comecaCom(conteudo, ASSINATURAS.zip)) {
    return false
  }

  const nomes = listarArquivosZip(conteudo)

  if (!nomes) {
    return false
  }

  if (
    !nomes.has('[Content_Types].xml') ||
    !nomes.has('_rels/.rels')
  ) {
    return false
  }

  return tipo === 'word'
    ? nomes.has('word/document.xml')
    : nomes.has('xl/workbook.xml')
}

export async function validarAssinaturaDocumento(
  arquivo: File,
): Promise<boolean> {
  const inicio = new Uint8Array(
    await arquivo.slice(0, 16).arrayBuffer(),
  )

  switch (arquivo.type) {
    case 'application/pdf':
      return comecaCom(inicio, ASSINATURAS.pdf)

    case 'image/jpeg':
      return comecaCom(inicio, ASSINATURAS.jpg)

    case 'image/png':
      return comecaCom(inicio, ASSINATURAS.png)

    case 'application/msword':
    case 'application/vnd.ms-excel':
      return comecaCom(inicio, ASSINATURAS.ole)

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return validarOfficeModerno(arquivo, 'word')

    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return validarOfficeModerno(arquivo, 'excel')

    default:
      return false
  }
}

const EXTENSOES_PERMITIDAS: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    '.xlsx',
  'image/jpeg': '.jpg',
  'image/png': '.png',
}

export function validarExtensaoDocumento(
  arquivo: File,
): boolean {
  const nome = arquivo.name.trim().toLowerCase()

  if (
    !nome ||
    nome.length > 255 ||
    nome.includes('/') ||
    nome.includes('\\') ||
    nome.includes('\0')
  ) {
    return false
  }

  const extensaoEsperada =
    EXTENSOES_PERMITIDAS[arquivo.type]

  if (!extensaoEsperada) {
    return false
  }

  if (
    arquivo.type === 'image/jpeg' &&
    nome.endsWith('.jpeg')
  ) {
    return true
  }

  return nome.endsWith(extensaoEsperada)
}
