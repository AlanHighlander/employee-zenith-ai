import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/ModulePage";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/funcionarios")({
  head: () => ({
    meta: [
      { title: "Funcionários · Pessoas360" },
      { name: "description", content: MODULES.funcionarios.description },
      { property: "og:title", content: "Funcionários · Pessoas360" },
      { property: "og:description", content: MODULES.funcionarios.description },
    ],
  }),
  component: () => <ModulePage {...MODULES.funcionarios} />,
});
