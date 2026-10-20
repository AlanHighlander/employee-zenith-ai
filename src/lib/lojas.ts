/**
 * Cadastro de lojas (unidades). Hoje: semente de DEMONSTRAÇÃO mantida no navegador.
 * Futuro: tabela `stores` no banco (ver docs/database-schema.sql), lida por
 * funções de servidor que aplicam as permissões do usuário.
 */
export type Loja = {
  id: string;
  empresaId: string;
  codigo: string;
  nome: string;
  cidade: string;
  ativa: boolean;
  /** Lojas com histórico (funcionários, ponto, folha) nunca são excluídas, só desativadas. */
  possuiHistorico: boolean;
  /** Apenas para a demonstração: tamanho do quadro usado para dados proporcionais. */
  quadroDemo: number;
  horasExtrasDemo: number;
};

export const EMPRESA_DEMO = { id: "emp-demo", nome: "Empresa Demonstração Ltda." };

export const LOJAS_SEMENTE: Loja[] = [
  { id: "loja-centro", empresaId: EMPRESA_DEMO.id, codigo: "L01", nome: "Loja Centro", cidade: "São Paulo/SP", ativa: true, possuiHistorico: true, quadroDemo: 44, horasExtrasDemo: 158 },
  { id: "loja-norte", empresaId: EMPRESA_DEMO.id, codigo: "L02", nome: "Loja Norte", cidade: "São Paulo/SP", ativa: true, possuiHistorico: true, quadroDemo: 34, horasExtrasDemo: 104 },
  { id: "loja-sul", empresaId: EMPRESA_DEMO.id, codigo: "L03", nome: "Loja Sul", cidade: "Santo André/SP", ativa: true, possuiHistorico: true, quadroDemo: 32, horasExtrasDemo: 112 },
  { id: "loja-shopping", empresaId: EMPRESA_DEMO.id, codigo: "L04", nome: "Loja Shopping", cidade: "Guarulhos/SP", ativa: true, possuiHistorico: true, quadroDemo: 41, horasExtrasDemo: 161 },
  { id: "loja-leste", empresaId: EMPRESA_DEMO.id, codigo: "L05", nome: "Loja Leste", cidade: "São Paulo/SP", ativa: true, possuiHistorico: true, quadroDemo: 33, horasExtrasDemo: 77 },
];


export const INDICADORES_DEMO_POR_CODIGO: Record<
  string,
  { quadroDemo: number; horasExtrasDemo: number }
> = {
  ASASUL01: { quadroDemo: 44, horasExtrasDemo: 158 },
  SOBRAD01: { quadroDemo: 34, horasExtrasDemo: 104 },
  TAGUA001: { quadroDemo: 32, horasExtrasDemo: 112 },
  VICENT01: { quadroDemo: 41, horasExtrasDemo: 161 },
  AGUAS001: { quadroDemo: 33, horasExtrasDemo: 77 },
};
