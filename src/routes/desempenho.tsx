import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/ModulePage";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/desempenho")({
  head: () => ({
    meta: [
      { title: "Desempenho e treinamentos · Pessoas360" },
      { name: "description", content: MODULES.desempenho.description },
      { property: "og:title", content: "Desempenho e treinamentos · Pessoas360" },
      { property: "og:description", content: MODULES.desempenho.description },
    ],
  }),
  component: () => <ModulePage {...MODULES.desempenho} />,
});
