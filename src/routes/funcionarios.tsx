
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ListaFuncionarios } from "@/components/funcionarios/ListaFuncionarios";
import { FormularioFuncionario } from "@/components/funcionarios/FormularioFuncionario";
import { FuncionariosArquivados } from "@/components/funcionarios/FuncionariosArquivados";

export const Route = createFileRoute("/funcionarios")({
  head: () => ({
    meta: [
      { title: "Funcionários · Pessoas360" },
      {
        name: "description",
        content: "Cadastro e gestão de funcionários",
      },
    ],
  }),
  component: PaginaFuncionarios,
});

function PaginaFuncionarios() {
  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [mostrarArquivados, setMostrarArquivados] =
    useState(false);

  function abrirFormulario() {
    setMostrarArquivados(false);
    setMostrarFormulario(true);
  }

  function abrirArquivados() {
    setMostrarFormulario(false);
    setMostrarArquivados(true);
  }

  function voltarLista() {
    setMostrarFormulario(false);
    setMostrarArquivados(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Funcionários
          </h1>

          <p className="text-sm text-muted-foreground">
            Gestão de funcionários da Sobradinho Carnes
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {!mostrarFormulario && !mostrarArquivados && (
            <>
              <button
                type="button"
                onClick={abrirArquivados}
                className="rounded-md border px-4 py-2 text-sm font-medium"
              >
                Ver arquivados
              </button>

              <button
                type="button"
                onClick={abrirFormulario}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                + Novo funcionário
              </button>
            </>
          )}

          {mostrarFormulario && (
            <button
              type="button"
              onClick={voltarLista}
              className="rounded-md border px-4 py-2 text-sm font-medium"
            >
              ← Voltar à lista
            </button>
          )}
        </div>
      </div>

      {mostrarArquivados ? (
        <FuncionariosArquivados onVoltar={voltarLista} />
      ) : mostrarFormulario ? (
        <div className="mx-auto max-w-3xl">
          <FormularioFuncionario />
        </div>
      ) : (
        <ListaFuncionarios />
      )}
    </div>
  );
}
