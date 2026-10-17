import {
  LayoutDashboard, Users, UserPlus, Clock, Palmtree, Wallet, HeartHandshake,
  FileText, Briefcase, GraduationCap, BarChart3, Bot, Plug, ShieldCheck,
  type LucideIcon,
} from "lucide-react";

/** Perfis previstos. Permissões reais serão aplicadas no servidor. */
export type Perfil = "rh" | "diretoria" | "admin";

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  group: "Visão geral" | "Pessoas" | "Operação" | "Financeiro" | "Desenvolvimento" | "Sistema";
  perfis: Perfil[];
};

const todos: Perfil[] = ["rh", "diretoria", "admin"];

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard executivo", icon: LayoutDashboard, group: "Visão geral", perfis: todos },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3, group: "Visão geral", perfis: todos },
  { to: "/assistente", label: "Assistente de IA", icon: Bot, group: "Visão geral", perfis: todos },
  { to: "/funcionarios", label: "Funcionários", icon: Users, group: "Pessoas", perfis: todos },
  { to: "/admissoes", label: "Admissões e desligamentos", icon: UserPlus, group: "Pessoas", perfis: todos },
  { to: "/documentos", label: "Documentos e vencimentos", icon: FileText, group: "Pessoas", perfis: todos },
  { to: "/ponto", label: "Ponto e jornada", icon: Clock, group: "Operação", perfis: todos },
  { to: "/ferias", label: "Férias e afastamentos", icon: Palmtree, group: "Operação", perfis: todos },
  { to: "/folha", label: "Folha de pagamento", icon: Wallet, group: "Financeiro", perfis: ["rh", "diretoria", "admin"] },
  { to: "/beneficios", label: "Benefícios e custos", icon: HeartHandshake, group: "Financeiro", perfis: ["rh", "diretoria", "admin"] },
  { to: "/recrutamento", label: "Recrutamento e seleção", icon: Briefcase, group: "Desenvolvimento", perfis: todos },
  { to: "/desempenho", label: "Desempenho e treinamentos", icon: GraduationCap, group: "Desenvolvimento", perfis: todos },
  { to: "/integracoes", label: "Integrações", icon: Plug, group: "Sistema", perfis: ["admin"] },
  { to: "/usuarios", label: "Usuários e auditoria", icon: ShieldCheck, group: "Sistema", perfis: ["admin"] },
];

export const NAV_GROUPS = ["Visão geral", "Pessoas", "Operação", "Financeiro", "Desenvolvimento", "Sistema"] as const;
