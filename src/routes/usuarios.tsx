import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/ModulePage";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários, permissões e auditoria · Pessoas360" },
      { name: "description", content: MODULES.usuarios.description },
      { property: "og:title", content: "Usuários, permissões e auditoria · Pessoas360" },
      { property: "og:description", content: MODULES.usuarios.description },
    ],
  }),
  component: () => <ModulePage {...MODULES.usuarios} />,
});
