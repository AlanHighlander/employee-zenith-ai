
import { createFileRoute } from "@tanstack/react-router";
import PaginaGestaoFerias from "@/components/ferias/PaginaGestaoFerias";
import { MODULES } from "@/lib/modules";

export const Route = createFileRoute("/ferias")({
  head: () => ({
    meta: [
      { title: "Férias e afastamentos · Pessoas360" },
      {
        name: "description",
        content: MODULES.ferias.description,
      },
      {
        property: "og:title",
        content: "Férias e afastamentos · Pessoas360",
      },
      {
        property: "og:description",
        content: MODULES.ferias.description,
      },
    ],
  }),
  component: PaginaGestaoFerias,
});
