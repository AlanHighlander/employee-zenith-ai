/**
 * DADOS FICTÍCIOS DE DEMONSTRAÇÃO.
 * Nenhum valor aqui representa pessoas, salários ou lojas reais.
 * Futuramente substituídos por consultas ao banco via funções de servidor.
 */

export const LOJAS = ["Loja Centro", "Loja Norte", "Loja Sul", "Loja Shopping", "Loja Leste", "Loja Oeste", "Loja Matriz"];
export const DEPARTAMENTOS = ["Vendas", "Caixa", "Estoque", "Administrativo", "Gerência"];
export const CARGOS = ["Vendedor(a)", "Operador(a) de caixa", "Estoquista", "Assistente administrativo", "Gerente de loja", "Fiscal de loja"];

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
  { mes: "Mai", quadro: 176, admissoes: 7, desligamentos: 5, custo: 768 },
  { mes: "Jun", quadro: 178, admissoes: 8, desligamentos: 6, custo: 774 },
  { mes: "Jul", quadro: 180, admissoes: 6, desligamentos: 4, custo: 781 },
  { mes: "Ago", quadro: 179, admissoes: 5, desligamentos: 6, custo: 790 },
  { mes: "Set", quadro: 181, admissoes: 8, desligamentos: 6, custo: 801 },
  { mes: "Out", quadro: 184, admissoes: 9, desligamentos: 6, custo: 812 },
];

export const quadroPorLoja = [
  { loja: "Centro", ativos: 34, horasExtras: 128 },
  { loja: "Norte", ativos: 26, horasExtras: 84 },
  { loja: "Sul", ativos: 24, horasExtras: 92 },
  { loja: "Shopping", ativos: 31, horasExtras: 141 },
  { loja: "Leste", ativos: 22, horasExtras: 58 },
  { loja: "Oeste", ativos: 21, horasExtras: 47 },
  { loja: "Matriz", ativos: 26, horasExtras: 62 },
];

export type Severidade = "alta" | "media" | "baixa";
export const alertas: { titulo: string; detalhe: string; severidade: Severidade }[] = [
  { titulo: "3 ASOs vencem em 7 dias", detalhe: "Loja Centro, Loja Sul", severidade: "alta" },
  { titulo: "Férias vencidas: 2 colaboradores", detalhe: "Risco de pagamento em dobro", severidade: "alta" },
  { titulo: "Folha de outubro aguardando conferência", detalhe: "Prévia gerada em 15/10", severidade: "media" },
  { titulo: "5 contratos de experiência a vencer", detalhe: "Decisão até 25/10", severidade: "media" },
  { titulo: "Horas extras acima da meta na Loja Shopping", detalhe: "141h no mês", severidade: "media" },
  { titulo: "4 treinamentos obrigatórios pendentes", detalhe: "NR-23 brigada de incêndio", severidade: "baixa" },
];

export type Funcionario = {
  matricula: string; nome: string; cargo: string; loja: string; departamento: string;
  admissao: string; status: "Ativo" | "Férias" | "Afastado" | "Experiência"; salario: number;
};

const nomes = ["Ana Souza", "Bruno Lima", "Carla Mendes", "Diego Rocha", "Elaine Castro", "Fábio Nunes", "Gabriela Alves", "Henrique Dias", "Isabela Moraes", "João Pereira", "Karina Teixeira", "Lucas Barbosa", "Mariana Freitas", "Natália Ribeiro", "Otávio Martins", "Paula Cardoso"];
const status: Funcionario["status"][] = ["Ativo", "Ativo", "Ativo", "Férias", "Ativo", "Experiência", "Ativo", "Afastado"];

export const funcionarios: Funcionario[] = nomes.map((nome, i) => ({
  matricula: String(1040 + i * 7),
  nome: `${nome} (demo)`,
  cargo: CARGOS[i % CARGOS.length],
  loja: LOJAS[i % LOJAS.length],
  departamento: DEPARTAMENTOS[i % DEPARTAMENTOS.length],
  admissao: `${String((i % 27) + 1).padStart(2, "0")}/${String((i % 12) + 1).padStart(2, "0")}/${2019 + (i % 6)}`,
  status: status[i % status.length],
  salario: 1900 + ((i * 437) % 3800),
}));

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
