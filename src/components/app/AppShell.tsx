import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarFooter,
} from "@/components/ui/sidebar";
import { NAV_GROUPS, NAV_ITEMS } from "@/lib/navigation";
import { DemoBadge } from "./DemoBadge";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
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
          Autenticação ainda não implementada
        </SidebarFooter>
      </Sidebar>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur">
          <SidebarTrigger />
          <span className="text-sm text-muted-foreground">Rede de lojas · Outubro/2026</span>
          <div className="ml-auto flex items-center gap-3">
            <DemoBadge />
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">US</div>
              <span className="text-sm">Usuário de demonstração</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </SidebarProvider>
  );
}
