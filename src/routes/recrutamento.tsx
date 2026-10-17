import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/ModulePage";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/recrutamento")({
  head: () => ({
    meta: [
      { title: "Recrutamento e seleção · Pessoas360" },
      { name: "description", content: MODULES.recrutamento.description },
      { property: "og:title", content: "Recrutamento e seleção · Pessoas360" },
      { property: "og:description", content: MODULES.recrutamento.description },
    ],
  }),
  component: () => <ModulePage {...MODULES.recrutamento} />,
});
