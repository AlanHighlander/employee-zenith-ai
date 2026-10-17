import { createFileRoute } from "@tanstack/react-router";
import { ModulePage } from "@/components/app/ModulePage";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/beneficios")({
  head: () => ({
    meta: [
      { title: "Benefícios e custos de pessoal · Pessoas360" },
      { name: "description", content: MODULES.beneficios.description },
      { property: "og:title", content: "Benefícios e custos de pessoal · Pessoas360" },
      { property: "og:description", content: MODULES.beneficios.description },
    ],
  }),
  component: () => <ModulePage {...MODULES.beneficios} />,
});
