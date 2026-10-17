import { Lock } from "lucide-react";

export function RestrictedNotice({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><Lock className="size-5" /></div>
      <div>
        <p className="font-semibold">Acesso restrito</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {children ?? "O administrador técnico gerencia configurações, mas não recebe acesso automático a dados pessoais de colaboradores."}
        </p>
      </div>
    </div>
  );
}
