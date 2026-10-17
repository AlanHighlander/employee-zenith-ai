import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/ModulePage";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/ponto")({
  head: () => ({
    meta: [
      { title: "Ponto e jornada · Pessoas360" },
      { name: "description", content: MODULES.ponto.description },
      { property: "og:title", content: "Ponto e jornada · Pessoas360" },
      { property: "og:description", content: MODULES.ponto.description },
    ],
  }),
  component: () => <ModulePage {...MODULES.ponto} />,
});
