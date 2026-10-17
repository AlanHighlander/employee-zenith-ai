import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/ModulePage";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/documentos")({
  head: () => ({
    meta: [
      { title: "Documentos e vencimentos · Pessoas360" },
      { name: "description", content: MODULES.documentos.description },
      { property: "og:title", content: "Documentos e vencimentos · Pessoas360" },
      { property: "og:description", content: MODULES.documentos.description },
    ],
  }),
  component: () => <ModulePage {...MODULES.documentos} />,
});
