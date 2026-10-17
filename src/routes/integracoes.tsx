import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/ModulePage";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/integracoes")({
  head: () => ({
    meta: [
      { title: "Integrações · Pessoas360" },
      { name: "description", content: MODULES.integracoes.description },
      { property: "og:title", content: "Integrações · Pessoas360" },
      { property: "og:description", content: MODULES.integracoes.description },
    ],
  }),
  component: () => <ModulePage {...MODULES.integracoes} />,
});
