/**
 * Perfis de acesso SIMULADOS para a demonstração.
 * Atenção: trocar de perfil aqui não protege nada. A regra real será aplicada
 * no servidor e no banco (políticas de segurança por loja), ver docs/database-schema.sql.
 */
export type PerfilDemo = {
  id: string;
  nome: string;
  papel: "diretoria" | "rh" | "admin";
  /** Pode escolher "Todas as lojas" (visão consolidada). */
  podeVerTodas: boolean;
  /** Lojas permitidas; "*" = todas as lojas da empresa. */
  lojas: string[] | "*";
  /** Admin técnico gerencia configurações sem acesso automático a dados pessoais. */
  dadosPessoais: boolean;
};

export const PERFIS_DEMO: PerfilDemo[] = [
  { id: "diretoria", nome: "Diretoria (demo)", papel: "diretoria", podeVerTodas: true, lojas: "*", dadosPessoais: true },
  { id: "rh-geral", nome: "RH geral (demo)", papel: "rh", podeVerTodas: true, lojas: "*", dadosPessoais: true },
  { id: "rh-regional", nome: "RH regional · Centro e Norte (demo)", papel: "rh", podeVerTodas: false, lojas: ["loja-centro", "loja-norte"], dadosPessoais: true },
  { id: "admin", nome: "Administrador técnico (demo)", papel: "admin", podeVerTodas: false, lojas: [], dadosPessoais: false },
];
