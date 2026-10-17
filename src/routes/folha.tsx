import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/ModulePage";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/folha")({
  head: () => ({
    meta: [
      { title: "Folha de pagamento · Pessoas360" },
      { name: "description", content: MODULES.folha.description },
      { property: "og:title", content: "Folha de pagamento · Pessoas360" },
      { property: "og:description", content: MODULES.folha.description },
    ],
  }),
  component: () => <ModulePage {...MODULES.folha} />,
});
