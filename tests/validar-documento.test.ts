
import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  validarAssinaturaDocumento,
  validarExtensaoDocumento,
} from '../src/lib/server/ferias/validar-documento'

function criarArquivo(
  conteudo: Uint8Array,
  nome: string,
  tipo: string,
): File {
  return new File([new Uint8Array(conteudo)], nome, {
    type: tipo,
  })
}

test('Aceita um PDF com cabeçalho válido', async () => {
  const arquivo = criarArquivo(
    new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d,
      0x31, 0x2e, 0x37,
    ]),
    'documento.pdf',
    'application/pdf',
  )

  assert.equal(
    validarExtensaoDocumento(arquivo),
    true,
  )

  assert.equal(
    await validarAssinaturaDocumento(arquivo),
    true,
  )
})

test('Rejeita um PDF com cabeçalho inválido', async () => {
  const arquivo = criarArquivo(
    new TextEncoder().encode('arquivo falso'),
    'documento.pdf',
    'application/pdf',
  )

  assert.equal(
    await validarAssinaturaDocumento(arquivo),
    false,
  )
})

test('Rejeita extensão incompatível com o tipo', () => {
  const arquivo = criarArquivo(
    new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d,
    ]),
    'documento.exe',
    'application/pdf',
  )

  assert.equal(
    validarExtensaoDocumento(arquivo),
    false,
  )
})

test('Rejeita um ZIP comum como documento Word', async () => {
  const arquivo = criarArquivo(
    new Uint8Array([
      0x50, 0x4b, 0x03, 0x04,
      0x00, 0x00, 0x00, 0x00,
    ]),
    'documento.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )

  assert.equal(
    await validarAssinaturaDocumento(arquivo),
    false,
  )
})

test('Rejeita um ZIP comum como planilha Excel', async () => {
  const arquivo = criarArquivo(
    new Uint8Array([
      0x50, 0x4b, 0x03, 0x04,
      0x00, 0x00, 0x00, 0x00,
    ]),
    'planilha.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )

  assert.equal(
    await validarAssinaturaDocumento(arquivo),
    false,
  )
})

test('Rejeita documento Word com extensão Excel', () => {
  const arquivo = criarArquivo(
    new Uint8Array([
      0x50, 0x4b, 0x03, 0x04,
    ]),
    'documento.xlsx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )

  assert.equal(
    validarExtensaoDocumento(arquivo),
    false,
  )
})

import { zipSync, strToU8 } from 'fflate'

function criarDocumentoOffice(
  tipo: 'word' | 'excel',
): File {
  const arquivosInternos: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(
      '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>',
    ),
    '_rels/.rels': strToU8(
      '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>',
    ),
  }

  if (tipo === 'word') {
    arquivosInternos['word/document.xml'] = strToU8(
      '<?xml version="1.0"?><document></document>',
    )
  } else {
    arquivosInternos['xl/workbook.xml'] = strToU8(
      '<?xml version="1.0"?><workbook></workbook>',
    )
  }

  const conteudo = zipSync(arquivosInternos)

  return criarArquivo(
    conteudo,
    tipo === 'word' ? 'teste.docx' : 'teste.xlsx',
    tipo === 'word'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
}

test('Aceita a estrutura ZIP básica de um Word', async () => {
  const arquivo = criarDocumentoOffice('word')

  assert.equal(
    validarExtensaoDocumento(arquivo),
    true,
  )

  assert.equal(
    await validarAssinaturaDocumento(arquivo),
    true,
  )
})

test('Aceita a estrutura ZIP básica de um Excel', async () => {
  const arquivo = criarDocumentoOffice('excel')

  assert.equal(
    validarExtensaoDocumento(arquivo),
    true,
  )

  assert.equal(
    await validarAssinaturaDocumento(arquivo),
    true,
  )
})

test('Aceita Word com compressão DEFLATE', async () => {
  const conteudo = zipSync(
    {
      '[Content_Types].xml': strToU8('<Types/>'),
      '_rels/.rels': strToU8('<Relationships/>'),
      'word/document.xml': strToU8(
        '<document>' + 'Texto de teste. '.repeat(100) + '</document>',
      ),
    },
    { level: 6 },
  )

  const arquivo = criarArquivo(
    conteudo,
    'documento.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )

  assert.equal(
    await validarAssinaturaDocumento(arquivo),
    true,
  )
})

test('Aceita Excel com compressão DEFLATE', async () => {
  const conteudo = zipSync(
    {
      '[Content_Types].xml': strToU8('<Types/>'),
      '_rels/.rels': strToU8('<Relationships/>'),
      'xl/workbook.xml': strToU8(
        '<workbook>' + 'Planilha de teste. '.repeat(100) + '</workbook>',
      ),
    },
    { level: 6 },
  )

  const arquivo = criarArquivo(
    conteudo,
    'planilha.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )

  assert.equal(
    await validarAssinaturaDocumento(arquivo),
    true,
  )
})

test('Rejeita Word com tamanho descompactado acima de 30 MB', async () => {
  const conteudoGrande = new Uint8Array(
    31 * 1024 * 1024,
  )

  conteudoGrande.fill(65)

  const conteudoZip = zipSync(
    {
      '[Content_Types].xml': strToU8('<Types/>'),
      '_rels/.rels': strToU8('<Relationships/>'),
      'word/document.xml': conteudoGrande,
    },
    { level: 9 },
  )

  const arquivo = criarArquivo(
    conteudoZip,
    'documento-grande.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )

  assert.equal(
    await validarAssinaturaDocumento(arquivo),
    false,
  )
})

test('Detecta alteração nos dados comprimidos de um Word', async () => {
  const conteudo = zipSync(
    {
      '[Content_Types].xml': strToU8('<Types/>'),
      '_rels/.rels': strToU8('<Relationships/>'),
      'word/document.xml': strToU8(
        '<document>' + 'Texto de teste. '.repeat(100) + '</document>',
      ),
    },
    { level: 6 },
  )

  const adulterado = new Uint8Array(conteudo)

  // O primeiro registro local começa na posição zero.
  // Os bytes 26 e 27 indicam o tamanho do nome.
  // Os bytes 28 e 29 indicam o tamanho do campo extra.
  const tamanhoNome =
    adulterado[26]! + adulterado[27]! * 256

  const tamanhoExtra =
    adulterado[28]! + adulterado[29]! * 256

  const inicioDados = 30 + tamanhoNome + tamanhoExtra

  // Altera um byte dos dados sem atualizar o CRC.
  adulterado[inicioDados] =
    adulterado[inicioDados]! ^ 0xff

  const arquivo = criarArquivo(
    adulterado,
    'documento-adulterado.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )

  assert.equal(
    await validarAssinaturaDocumento(arquivo),
    false,
  )
})

test('Rejeita Word com tamanho descompactado falsificado', async () => {
  const conteudo = zipSync(
    {
      '[Content_Types].xml': strToU8('<Types/>'),
      '_rels/.rels': strToU8('<Relationships/>'),
      'word/document.xml': strToU8(
        '<document>' +
          'Texto repetido. '.repeat(1000) +
          '</document>',
      ),
    },
    { level: 9 },
  )

  const adulterado = new Uint8Array(conteudo)
  const visualizacao = new DataView(
    adulterado.buffer,
    adulterado.byteOffset,
    adulterado.byteLength,
  )

  // O primeiro registro local começa na posição zero.
  // O tamanho descompactado fica no deslocamento 22.
  visualizacao.setUint32(22, 1, true)

  // Localiza o diretório central.
  let posicaoCentral = -1

  for (let i = 0; i < adulterado.length - 4; i++) {
    if (
      adulterado[i] === 0x50 &&
      adulterado[i + 1] === 0x4b &&
      adulterado[i + 2] === 0x01 &&
      adulterado[i + 3] === 0x02
    ) {
      posicaoCentral = i
      break
    }
  }

  assert.notEqual(posicaoCentral, -1)

  // Altera também o tamanho declarado no diretório central.
  visualizacao.setUint32(
    posicaoCentral + 24,
    1,
    true,
  )

  const arquivo = criarArquivo(
    adulterado,
    'documento-tamanho-falso.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )

  assert.equal(
    await validarAssinaturaDocumento(arquivo),
    false,
  )
})
