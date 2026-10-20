import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarFooter,
} from "@/components/ui/sidebar";
import { NAV_GROUPS, NAV_ITEMS } from "@/lib/navigation";
import { DemoBadge } from "./DemoBadge";
import { ScopeProvider } from "@/lib/scope-context";
import { LojaSelector, PerfilDemoSelector } from "./LojaSelector";
import { supabase } from "@/lib/supabase";
import { LogOut } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

const [nomeUsuario, setNomeUsuario] = useState("");

useEffect(() => {
  async function carregarNomeUsuario() {
    const { data: { user }, error: erroAuth } =
      await supabase.auth.getUser();

    if (erroAuth || !user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar nome do usuário:", error);
      return;
    }

    setNomeUsuario(data?.full_name ?? "");
  }

  void carregarNomeUsuario();
}, []);

    async function sairDoSistema() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Não foi possível sair do sistema. Tente novamente.");
      return;
    }

    window.location.replace("/login");
  }

  return (
    <ScopeProvider>
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-4 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary font-display text-sm font-extrabold text-sidebar-primary-foreground">
              P
            </div>
            <div className="leading-tight">
              <p className="font-display text-base font-bold text-sidebar-accent-foreground">Pessoas360</p>
              <p className="text-xs text-sidebar-foreground/70">Gestão de RH</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {NAV_GROUPS.map((group) => (
            <SidebarGroup key={group}>
              <SidebarGroupLabel className="text-sidebar-foreground/50">{group}</SidebarGroupLabel>
              <SidebarMenu>
                {NAV_ITEMS.filter((i) => i.group === group).map((item) => {
                  const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="px-4 pb-4 text-xs text-sidebar-foreground/60">
  Pessoas360 • Gestão de RH
</SidebarFooter>
      </Sidebar>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 sm:gap-3 border-b bg-card/90 px-4 backdrop-blur">
          <SidebarTrigger />
          <LojaSelector />
          <span className="hidden text-sm text-muted-foreground md:inline">Outubro/2026</span>

<div className="ml-auto flex items-center gap-3">
  <span className="hidden lg:inline-flex">
    <DemoBadge />
  </span>

<span className="hidden sm:inline text-sm font-medium">
  {nomeUsuario || "Carregando..."}
</span>

  <button
    type="button"
    onClick={sairDoSistema}
    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
  >
    <LogOut className="h-4 w-4" />
    Sair
  </button>
</div>

        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </SidebarProvider>
    </ScopeProvider>
  );
}
