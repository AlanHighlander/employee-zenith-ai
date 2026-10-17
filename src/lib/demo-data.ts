/**
 * DADOS FICTÍCIOS DE DEMONSTRAÇÃO.
 * Nenhum valor aqui representa pessoas, salários ou lojas reais.
 * Todo registro operacional carrega empresaId + lojaId, como no futuro banco.
 */
import { EMPRESA_DEMO, LOJAS_SEMENTE } from "./lojas";

export const DEPARTAMENTOS = ["Vendas", "Caixa", "Estoque", "Administrativo", "Gerência"];
export const CARGOS = ["Vendedor(a)", "Operador(a) de caixa", "Estoquista", "Assistente administrativo", "Gerente de loja", "Fiscal de loja"];

/** Indicadores consolidados da empresa (todas as lojas). */
export const kpis = {
  quadroAtivo: 184,
  admissoesMes: 9,
  desligamentosMes: 6,
  turnover: 4.1,
  absenteismo: 2.8,
  horasExtras: 612,
  custoPessoal: 812_400,
  alertasPendentes: 14,
};

export const evolucaoMensal = [
  { mes: "Nov/25", admissoes: 6, desligamentos: 4, custo: 731 },
  { mes: "Dez/25", admissoes: 11, desligamentos: 5, custo: 752 },
  { mes: "Jan/26", admissoes: 4, desligamentos: 7, custo: 744 },
  { mes: "Fev/26", admissoes: 5, desligamentos: 4, custo: 746 },
  { mes: "Mar/26", admissoes: 7, desligamentos: 5, custo: 755 },
  { mes: "Abr/26", admissoes: 6, desligamentos: 6, custo: 760 },
  { mes: "Mai/26", admissoes: 7, desligamentos: 5, custo: 768 },
  { mes: "Jun/26", admissoes: 8, desligamentos: 6, custo: 774 },
  { mes: "Jul/26", admissoes: 6, desligamentos: 4, custo: 781 },
  { mes: "Ago/26", admissoes: 5, desligamentos: 6, custo: 790 },
  { mes: "Set/26", admissoes: 8, desligamentos: 6, custo: 801 },
  { mes: "Out/26", admissoes: 9, desligamentos: 6, custo: 812 },
];

export type Severidade = "alta" | "media" | "baixa";
export const alertas: { titulo: string; lojaId: string; severidade: Severidade }[] = [
  { titulo: "ASO vence em 7 dias", lojaId: "loja-centro", severidade: "alta" },
  { titulo: "ASO vence em 5 dias", lojaId: "loja-sul", severidade: "alta" },
  { titulo: "Férias vencidas (risco de pagamento em dobro)", lojaId: "loja-sul", severidade: "alta" },
  { titulo: "Folha de outubro aguardando conferência", lojaId: "loja-centro", severidade: "media" },
  { titulo: "Contratos de experiência a vencer", lojaId: "loja-norte", severidade: "media" },
  { titulo: "Horas extras acima da meta", lojaId: "loja-shopping", severidade: "media" },
  { titulo: "Treinamento NR-23 pendente", lojaId: "loja-leste", severidade: "baixa" },
  { titulo: "Documentação admissional incompleta", lojaId: "loja-shopping", severidade: "media" },
];

/** Lotação com vigência: permite transferências sem perder o histórico. */
export type Lotacao = { lojaId: string; inicio: string; fim: string | null };

export type Funcionario = {
  matricula: string; empresaId: string; nome: string; cargo: string; departamento: string;
  admissao: string; status: "Ativo" | "Férias" | "Afastado" | "Experiência"; salario: number;
  lotacoes: Lotacao[];
};

const nomes = ["Ana Souza", "Bruno Lima", "Carla Mendes", "Diego Rocha", "Elaine Castro", "Fábio Nunes", "Gabriela Alves", "Henrique Dias", "Isabela Moraes", "João Pereira", "Karina Teixeira", "Lucas Barbosa", "Mariana Freitas", "Natália Ribeiro", "Otávio Martins", "Paula Cardoso"];
const status: Funcionario["status"][] = ["Ativo", "Ativo", "Ativo", "Férias", "Ativo", "Experiência", "Ativo", "Afastado"];
const ids = LOJAS_SEMENTE.map((l) => l.id);

export const funcionarios: Funcionario[] = nomes.map((nome, i) => {
  const lojaId = ids[i % ids.length]!;
  const ano = 2019 + (i % 6);
  const lotacoes: Lotacao[] =
    i % 5 === 2
      ? [{ lojaId: ids[(i + 1) % ids.length]!, inicio: `${ano}-03-01`, fim: "2025-12-31" }, { lojaId, inicio: "2026-01-01", fim: null }]
      : [{ lojaId, inicio: `${ano}-03-01`, fim: null }];
  return {
    matricula: String(1040 + i * 7),
    empresaId: EMPRESA_DEMO.id,
    nome: `${nome} (demo)`,
    cargo: CARGOS[i % CARGOS.length]!,
    departamento: DEPARTAMENTOS[i % DEPARTAMENTOS.length]!,
    admissao: `01/03/${ano}`,
    status: status[i % status.length]!,
    salario: 1900 + ((i * 437) % 3800),
    lotacoes,
  };
});

/** Loja vigente na data informada (padrão: hoje). */
export function lojaVigente(f: Funcionario, data = "2026-10-17"): string | undefined {
  return f.lotacoes.find((l) => l.inicio <= data && (l.fim === null || l.fim >= data))?.lojaId;
}

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
