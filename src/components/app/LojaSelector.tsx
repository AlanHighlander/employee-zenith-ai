import { Store } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useScope, TODAS_LOJAS } from "@/lib/scope-context";
import { PERFIS_DEMO } from "@/lib/perfis";

/** Seletor global de unidade. Mostra apenas lojas ativas permitidas ao perfil. */
export function LojaSelector({ className }: { className?: string }) {
  const { lojaId, setLojaId, lojasPermitidas, perfil } = useScope();

  if (lojasPermitidas.length === 0 && !perfil.podeVerTodas) {
    return <span className="text-sm text-muted-foreground">Sem acesso a lojas</span>;
  }

  return (
    <Select value={lojaId} onValueChange={setLojaId}>
      <SelectTrigger className={className ?? "h-9 w-[180px] sm:w-[220px]"} aria-label="Selecionar loja">
        <Store className="size-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {perfil.podeVerTodas && (
          <>
            <SelectItem value={TODAS_LOJAS}>Todas as lojas</SelectItem>
            <SelectSeparator />
          </>
        )}
        {lojasPermitidas.map((l) => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

/** Troca de perfil SIMULADA, apenas para demonstrar permissões. */
export function PerfilDemoSelector() {
  const { perfil, setPerfilId } = useScope();
  return (
    <Select value={perfil.id} onValueChange={setPerfilId}>
      <SelectTrigger className="h-9 w-[44px] sm:w-[230px]" aria-label="Perfil de demonstração">
        <span className="flex size-6 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
          {perfil.papel.slice(0, 2).toUpperCase()}
        </span>
        <span className="hidden truncate sm:inline"><SelectValue /></span>
      </SelectTrigger>
      <SelectContent align="end">
        {PERFIS_DEMO.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
