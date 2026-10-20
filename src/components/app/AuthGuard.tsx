import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { verificarTrocaSenha } from "@/lib/verificar-troca-senha";

export function AuthGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "authenticated" | "unauthenticated">("checking");

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      const { data, error } = await supabase.auth.getUser();

      if (!ativo) return;

      if (error || !data.user) {
        setStatus("unauthenticated");
        navigate({ to: "/login", replace: true });
      } else {
        try {
          const resultado = await verificarTrocaSenha();

          if (!ativo) return;

          if (resultado.precisaTrocar) {
            navigate({ to: "/trocar-senha", replace: true });
            return;
          }

          setStatus("authenticated");
        } catch {
          if (!ativo) return;
          setStatus("checking");
        }
      }
    }

    verificarSessao();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!ativo) return;

        if (!session) {
          setStatus("unauthenticated");
          navigate({ to: "/login", replace: true });
        }
      }
    );

    return () => {
      ativo = false;
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Verificando acesso ao Pessoas360...</p>
      </div>
    );
  }

  return <>{children}</>;
}
