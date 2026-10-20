
import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { verificarAdministrador } from "@/lib/verificar-administrador";
import { FormularioNovoUsuario } from "@/components/usuarios/FormularioNovoUsuario";
import { ListaUsuarios } from "@/components/usuarios/ListaUsuarios";
import { HistoricoUsuarios } from "@/components/usuarios/HistoricoUsuarios";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/usuarios")({
  beforeLoad: async () => {
    const { autorizado } = await verificarAdministrador();

    if (!autorizado) {
      throw redirect({ to: "/" });
    }
  },

  head: () => ({
    meta: [
      { title: "Usuários, permissões e auditoria · Pessoas360" },
      { name: "description", content: MODULES.usuarios.description },
      {
        property: "og:title",
        content: "Usuários, permissões e auditoria · Pessoas360",
      },
      {
        property: "og:description",
        content: MODULES.usuarios.description,
      },
    ],
  }),

  component: PaginaUsuarios,
});

function PaginaUsuarios() {
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-4">
      <header>
        <h1 className="text-2xl font-bold">
          Gestão de usuários
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Consulte usuários, gerencie acessos e acompanhe alterações.
        </p>
      </header>

      {mostrarCadastro ? (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setMostrarCadastro(false)}
              className="rounded-lg border px-4 py-2 font-medium"
            >
              ← Voltar para lista
            </button>
          </div>

          <FormularioNovoUsuario />
        </>
      ) : (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setMostrarCadastro(true)}
              className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
            >
              + Novo usuário
            </button>
          </div>

          <ListaUsuarios />

          <HistoricoUsuarios />
        </>
      )}
    </main>
  );
}
