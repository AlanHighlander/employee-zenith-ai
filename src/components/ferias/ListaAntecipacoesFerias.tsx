
import { useEffect, useState } from "react";

import {
  listarAntecipacoesFerias,
  type AntecipacaoFerias,
} from "@/lib/listar-antecipacoes-ferias";

import { iniciarAnaliseAntecipacaoFerias } from "@/lib/iniciar-analise-antecipacao-ferias";
import { decidirAntecipacaoFerias } from "@/lib/decidir-antecipacao-ferias";

import {
  listarDocumentosAntecipacaoFerias,
  type DocumentoAntecipacaoFerias,
} from "@/lib/listar-documentos-antecipacao-ferias";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Decisao = "aprovada" | "rejeitada";

type AcaoAberta =
  | {
      tipo: "iniciar";
      solicitacaoId: string;
    }
  | {
      tipo: "decidir";
      solicitacaoId: string;
      decisao: Decisao;
    }
  | null;

function formatarData(data: string) {
  const partes = data.slice(0, 10).split("-");

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarSituacao(situacao: string) {
  const nomes: Record<string, string> = {
    pendente: "Pendente",
    em_analise: "Em análise",
    aprovada: "Aprovada",
    rejeitada: "Rejeitada",
    cancelada: "Cancelada",
  };

  return nomes[situacao] ?? situacao;
}

export default function ListaAntecipacoesFerias() {
  const [solicitacoes, setSolicitacoes] =
    useState<AntecipacaoFerias[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [acaoAberta, setAcaoAberta] =
    useState<AcaoAberta>(null);

  const [observacoes, setObservacoes] = useState("");
  const [documentos, setDocumentos] =
    useState<DocumentoAntecipacaoFerias[]>([]);
  const [documentoId, setDocumentoId] = useState("");

const [arquivoSelecionado, setArquivoSelecionado] =
  useState<File | null>(null);

const [enviandoDocumento, setEnviandoDocumento] =
  useState(false);

const [mensagemDocumento, setMensagemDocumento] =
  useState("");

  const [carregandoDocumentos, setCarregandoDocumentos] =
    useState(false);
  const [erroDocumentos, setErroDocumentos] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarSolicitacoes() {
    setCarregando(true);
    setErro("");

    try {
      const resultado = await listarAntecipacoesFerias();
      setSolicitacoes(resultado);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as solicitações.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarSolicitacoes();
  }, []);

  async function carregarDocumentos(solicitacaoId: string) {
    setCarregandoDocumentos(true);
    setErroDocumentos("");
    setDocumentos([]);
    setDocumentoId("");

    try {
      const resultado = await listarDocumentosAntecipacaoFerias({
        data: { solicitacaoId },
      });

      setDocumentos(resultado);
      setDocumentoId(resultado[0]?.documento_id ?? "");
    } catch (error) {
      setErroDocumentos(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar os documentos.",
      );
    } finally {
      setCarregandoDocumentos(false);
    }
  }

  function abrirAcao(acao: NonNullable<AcaoAberta>) {
    setAcaoAberta(acao);
    setObservacoes("");
    setDocumentos([]);
    setDocumentoId("");
    setErroDocumentos("");
    setErroAcao("");
    setMensagem("");

    if (
      acao.tipo === "decidir" &&
      acao.decisao === "aprovada"
    ) {
      void carregarDocumentos(acao.solicitacaoId);
    }
  }

  function fecharAcao() {
    setAcaoAberta(null);
    setObservacoes("");
    setDocumentos([]);
    setDocumentoId("");
    setErroDocumentos("");
    setErroAcao("");
  }


async function excluirDocumento(
  documentoIdParaExcluir: string,
  nomeArquivo: string,
) {
  const confirmado = window.confirm(
    `Deseja realmente excluir o documento "${nomeArquivo}"?\n\n` +
      'Esta ação removerá o arquivo da solicitação de férias.',
  )

  if (!confirmado) return

  try {
    setErroDocumentos('')
    setMensagemDocumento('Excluindo documento...')

    const resposta = await fetch(
      '/api/ferias/documentos/excluir',
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentoId: documentoIdParaExcluir,
        }),
      },
    )

    const resultado: {
      sucesso?: boolean
      mensagem?: string
    } = await resposta.json()

    if (!resposta.ok || resultado.sucesso !== true) {
      throw new Error(
        resultado.mensagem ??
          'Não foi possível excluir o documento.',
      )
    }

    setDocumentos((anteriores) =>
      anteriores.filter(
        (documento) =>
          documento.documento_id !== documentoIdParaExcluir,
      ),
    )

    if (documentoId === documentoIdParaExcluir) {
      setDocumentoId('')
    }

    setMensagemDocumento(
      resultado.mensagem ?? 'Documento excluído com sucesso.',
    )
  } catch (error) {
    setMensagemDocumento('')
    setErroDocumentos(
      error instanceof Error
        ? error.message
        : 'Erro inesperado ao excluir documento.',
    )
  }
}


async function enviarDocumento() {
  if (
    !acaoAberta ||
    acaoAberta.tipo !== "decidir" ||
    acaoAberta.decisao !== "aprovada" ||
    !arquivoSelecionado ||
    enviandoDocumento
  ) {
    return;
  }

  if (
    arquivoSelecionado.size === 0 ||
    arquivoSelecionado.size > 10 * 1024 * 1024
  ) {
    setErroDocumentos(
      "O arquivo deve ter entre 1 byte e 10 MB.",
    );
    return;
  }

  setEnviandoDocumento(true);
  setErroDocumentos("");
  setMensagemDocumento("");

  try {
    const formulario = new FormData();

    formulario.append(
      "solicitacaoId",
      acaoAberta.solicitacaoId,
    );

    formulario.append("arquivo", arquivoSelecionado);

    const resposta = await fetch(
      "/api/ferias/documentos/upload",
      {
        method: "POST",
        credentials: "same-origin",
        body: formulario,
      },
    );

    const resultado: {
      sucesso?: boolean;
      mensagem?: string;
      documentoId?: string;
    } = await resposta.json();

    if (!resposta.ok || !resultado.sucesso) {
      throw new Error(
        resultado.mensagem ??
          "Não foi possível anexar o documento.",
      );
    }

    setArquivoSelecionado(null);

    setMensagemDocumento(
      "Documento anexado com sucesso.",
    );


const documentosAtualizados =
  await listarDocumentosAntecipacaoFerias({
    data: {
      solicitacaoId: acaoAberta.solicitacaoId,
    },
  });


setDocumentos(documentosAtualizados);

const documentoEnviadoId = resultado.documentoId;

setDocumentoId(
  documentoEnviadoId &&
    documentosAtualizados.some(
      (documento) =>
        documento.documento_id === documentoEnviadoId,
    )
    ? documentoEnviadoId
    : "",
);


  } catch (error) {
    setErroDocumentos(
      error instanceof Error
        ? error.message
        : "Não foi possível enviar o documento.",
    );
  } finally {
    setEnviandoDocumento(false);
  }
}

  async function confirmarAcao() {
    if (!acaoAberta || enviando) return;

    const observacoesLimpas = observacoes.trim();

    if (acaoAberta.tipo === "decidir") {
      if (
        observacoesLimpas.length < 10 ||
        observacoesLimpas.length > 2000
      ) {
        setErroAcao(
          "Informe uma justificativa entre 10 e 2000 caracteres.",
        );
        return;
      }

      if (
        acaoAberta.decisao === "aprovada" &&
        (!documentoId ||
          !documentos.some(
            (documento) =>
              documento.documento_id === documentoId,
          ))
      ) {
        setErroAcao(
          "Selecione um documento anexado à solicitação.",
        );
        return;
      }
    }

    setEnviando(true);
    setErroAcao("");
    setMensagem("");

    try {
      if (acaoAberta.tipo === "iniciar") {
        await iniciarAnaliseAntecipacaoFerias({
          data: {
            solicitacaoId: acaoAberta.solicitacaoId,
            observacoes: observacoesLimpas,
          },
        });

        setMensagem(
          "Análise iniciada com sucesso. O histórico foi registrado.",
        );
      } else {
        const resultado = await decidirAntecipacaoFerias({
          data: {
            solicitacaoId: acaoAberta.solicitacaoId,
            decisao: acaoAberta.decisao,
            justificativa: observacoesLimpas,
            documentoId:
              acaoAberta.decisao === "aprovada"
                ? documentoId
                : undefined,
          },
        });

        setMensagem(resultado.mensagem);
      }

      fecharAcao();
      await carregarSolicitacoes();
    } catch (error) {
      setErroAcao(
        error instanceof Error
          ? error.message
          : "Não foi possível registrar a operação.",
      );
    } finally {
      setEnviando(false);
    }
  }

  const solicitacaoSelecionada = solicitacoes.find(
    (solicitacao) =>
      solicitacao.solicitacao_id === acaoAberta?.solicitacaoId,
  );

  const aprovando =
    acaoAberta?.tipo === "decidir" &&
    acaoAberta.decisao === "aprovada";

  const podeConfirmarDecisao =
    observacoes.trim().length >= 10 &&
    (!aprovando ||
      (!carregandoDocumentos &&
        !erroDocumentos &&
        documentos.some(
          (documento) =>
            documento.documento_id === documentoId,
        )));

  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-base">
          Solicitações de antecipação de férias
        </CardTitle>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={carregando || enviando}
          onClick={() => void carregarSolicitacoes()}
        >
          Atualizar lista
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {mensagem && (
          <p
            role="status"
            className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800"
          >
            {mensagem}
          </p>
        )}

        {erroAcao && (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {erroAcao}
          </p>
        )}

        {carregando && (
          <p className="text-sm text-muted-foreground">
            Carregando solicitações...
          </p>
        )}

        {erro && (
          <p role="alert" className="text-sm text-red-600">
            {erro}
          </p>
        )}

        {!carregando && !erro && solicitacoes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma solicitação de antecipação de férias registrada.
          </p>
        )}

        {!carregando && !erro && solicitacoes.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Justificativa</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {solicitacoes.map((solicitacao) => (
                  <TableRow key={solicitacao.solicitacao_id}>
                    <TableCell>
                      {solicitacao.matricula}
                    </TableCell>

                    <TableCell>
                      {solicitacao.funcionario_nome}
                    </TableCell>

                    <TableCell>
                      {formatarData(solicitacao.data_inicio)}
                    </TableCell>

                    <TableCell>
                      {formatarData(solicitacao.data_fim)}
                    </TableCell>

                    <TableCell>
                      {solicitacao.dias_solicitados}
                    </TableCell>

                    <TableCell>
                      {formatarSituacao(solicitacao.situacao)}
                    </TableCell>

                    <TableCell className="max-w-64 whitespace-normal">
                      {solicitacao.justificativa}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {solicitacao.situacao === "pendente" && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={enviando}
                            onClick={() =>
                              abrirAcao({
                                tipo: "iniciar",
                                solicitacaoId:
                                  solicitacao.solicitacao_id,
                              })
                            }
                          >
                            Iniciar análise
                          </Button>
                        )}

                        {solicitacao.situacao === "em_analise" && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={enviando}
                              onClick={() =>
                                abrirAcao({
                                  tipo: "decidir",
                                  solicitacaoId:
                                    solicitacao.solicitacao_id,
                                  decisao: "rejeitada",
                                })
                              }
                            >
                              Rejeitar
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              disabled={enviando}
                              onClick={() =>
                                abrirAcao({
                                  tipo: "decidir",
                                  solicitacaoId:
                                    solicitacao.solicitacao_id,
                                  decisao: "aprovada",
                                })
                              }
                            >
                              Aprovar
                            </Button>
                          </>
                        )}

                        {!["pendente", "em_analise"].includes(
                          solicitacao.situacao,
                        ) && (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {acaoAberta && solicitacaoSelecionada && (
          <div className="space-y-4 rounded-lg border p-4">
            <div>
              <h3 className="font-semibold">
                {acaoAberta.tipo === "iniciar"
                  ? "Iniciar análise da solicitação"
                  : acaoAberta.decisao === "aprovada"
                    ? "Aprovar solicitação"
                    : "Rejeitar solicitação"}
              </h3>

              <p className="text-sm text-muted-foreground">
                {solicitacaoSelecionada.matricula}
                {" — "}
                {solicitacaoSelecionada.funcionario_nome}
                {" · "}
                {formatarData(
                  solicitacaoSelecionada.data_inicio,
                )}
                {" a "}
                {formatarData(
                  solicitacaoSelecionada.data_fim,
                )}
              </p>
            </div>



{aprovando && (
  <div className="space-y-3 rounded-md border p-4">
    <h4 className="text-sm font-semibold">
      Anexar documento à solicitação
    </h4>

    <p className="text-xs text-muted-foreground">
      Formatos permitidos: PDF, Word, Excel, JPG e PNG.
      Tamanho máximo: 10 MB.
    </p>


<div className="flex flex-wrap items-center gap-3">
  <label
    htmlFor="arquivo-ferias"
    className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
  >
    📁 Escolher arquivo
  </label>

  <input
    id="arquivo-ferias"
    type="file"
    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
    disabled={enviandoDocumento || enviando}
    onChange={(evento) => {
      setArquivoSelecionado(
        evento.target.files?.[0] ?? null,
      );
      setMensagemDocumento("");
    }}
    className="sr-only"
  />

  <span className="text-sm text-muted-foreground">
    {arquivoSelecionado
      ? arquivoSelecionado.name
      : "Nenhum arquivo selecionado"}
  </span>
</div>


    <Button
      type="button"
      variant="outline"
      disabled={
        !arquivoSelecionado ||
        enviandoDocumento ||
        enviando ||
        carregandoDocumentos
      }
      onClick={() => void enviarDocumento()}
    >
      {enviandoDocumento
        ? "Enviando documento..."
        : "Anexar documento"}
    </Button>

  </div>
)}

            {aprovando && (
              <p className="text-sm text-amber-700">
                A aprovação exige análise jurídica prévia.
                Selecionar um documento não comprova sua
                validade legal. A aprovação administrativa não
                programa férias nem altera o saldo.
              </p>
            )}

            <div className="space-y-2">
              <label
                htmlFor="observacoes-analise"
                className="text-sm font-medium"
              >
                {acaoAberta.tipo === "iniciar"
                  ? "Observações"
                  : "Justificativa da decisão (obrigatória)"}
              </label>

              <textarea
                id="observacoes-analise"
                value={observacoes}
                onChange={(evento) =>
                  setObservacoes(evento.target.value)
                }
                maxLength={2000}
                rows={4}
                placeholder={
                  acaoAberta.tipo === "iniciar"
                    ? "Ex.: Documentação recebida. Aguardando avaliação jurídica."
                    : "Descreva os motivos da decisão do RH."
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            {aprovando && (
              <div className="space-y-2">
                <label
                  htmlFor="documento-aprovacao"
                  className="text-sm font-medium"
                >
                  Documento de aprovação (obrigatório)
                </label>

                {carregandoDocumentos ? (
                  <p className="text-sm text-muted-foreground">
                    Consultando documentos...
                  </p>
                ) : erroDocumentos ? (
                  <p role="alert" className="text-sm text-red-600">
                    {erroDocumentos}
                  </p>
                ) : documentos.length === 0 ? (
                  <p className="text-sm text-amber-700">
                    Nenhum documento anexado. É necessário
                    anexar um documento válido antes de
                    registrar uma aprovação.
                  </p>
                ) : (

<div className="space-y-2 rounded-md border bg-muted/30 p-3">
  <p className="text-sm font-medium">
    Documentos vinculados à solicitação
  </p>

{mensagemDocumento && (
  <p
    role="status"
    className="rounded-md border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700"
  >
    {mensagemDocumento}
  </p>
)}


  {documentos.map((documento) => (
    <div
      key={documento.documento_id}
      className="flex items-center justify-between gap-3 rounded-md border bg-background p-3"
    >
      <div className="min-w-0">
        <p className="break-all text-sm font-medium">
          {documento.nome_arquivo}
        </p>
        <p className="text-xs text-muted-foreground">
          Enviado em {formatarData(documento.data_envio)}
        </p>
      </div>


<div className="flex shrink-0 flex-wrap items-center gap-2">
  {documento.documento_id === documentoId && (
    <span className="text-xs font-medium text-green-700">
      Documento de referência
    </span>
  )}

  <a
    href={`/api/ferias/documentos/visualizar?documentoId=${encodeURIComponent(
      documento.documento_id,
    )}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
  >
    Visualizar
  </a>


{acaoAberta?.tipo === 'decidir' &&
  acaoAberta.decisao === 'aprovada' && (

  <button
    type="button"
    onClick={() =>
      void excluirDocumento(
        documento.documento_id,
        documento.nome_arquivo,
      )
    }
    className="inline-flex items-center rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
  >
    Excluir
  </button>
)}


</div>

    </div>
  ))}

  {!documentoId && (
    <p className="text-xs text-amber-700">
      Nenhum documento de referência definido.
      Anexe um documento para selecioná-lo automaticamente.
    </p>
  )}
</div>

                )}

                <p className="text-xs text-muted-foreground">
                  A lista mostra documentos registrados no
                  Supabase. O conteúdo e a validade jurídica
                  precisam ser verificados separadamente.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={
                  enviando ||
                  (acaoAberta.tipo === "decidir" &&
                    !podeConfirmarDecisao)
                }
                onClick={() => void confirmarAcao()}
              >
                {enviando
                  ? "Registrando..."
                  : acaoAberta.tipo === "iniciar"
                    ? "Confirmar início da análise"
                    : acaoAberta.decisao === "aprovada"
                      ? "Confirmar aprovação administrativa"
                      : "Confirmar rejeição"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={enviando}
                onClick={fecharAcao}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          As decisões são registros administrativos do RH.
          Nenhuma ação nesta tela programa férias ou desconta
          automaticamente dias do saldo.
        </p>
      </CardContent>
    </Card>
  );
}
