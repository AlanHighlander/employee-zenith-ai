import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/ModulePage";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/admissoes")({
  head: () => ({
    meta: [
      { title: "Admissões e desligamentos · Pessoas360" },
      { name: "description", content: MODULES.admissoes.description },
      { property: "og:title", content: "Admissões e desligamentos · Pessoas360" },
      { property: "og:description", content: MODULES.admissoes.description },
    ],
  }),
  component: () => <ModulePage {...MODULES.admissoes} />,
});
