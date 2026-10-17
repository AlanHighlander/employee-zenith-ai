import {
  Users, UserCheck, Palmtree, AlertTriangle, UserPlus, UserMinus, FileClock, Clock, Timer, CalendarX,
  Upload, Wallet, CheckCircle2, HeartHandshake, FileText, Briefcase, GraduationCap, Plug, ShieldCheck, Activity,
} from "lucide-react";
import type { Column, ModuleKpi } from "@/components/app/ModulePage";
import { funcionarios, brl } from "./demo-data";

export type ModuleConfig = {
  title: string; description: string; tableTitle: string; columns: Column[];
  rows: Record<string, string>[]; kpis?: ModuleKpi[]; future?: string; actions?: string[];
} satisfies Record<string, ModuleConfig>;

export const MODULES = {
  funcionarios: {
    title: "Funcionários",
    description: "Cadastro e histórico funcional de todos os colaboradores da rede.",
    tableTitle: "Colaboradores",
    actions: ["Novo colaborador", "Exportar"],
    kpis: [
      { label: "Ativos", value: "184", icon: Users },
      { label: "Em experiência", value: "12", icon: UserCheck },
      { label: "Em férias", value: "9", icon: Palmtree },
      { label: "Afastados", value: "4", icon: AlertTriangle, tone: "warning" },
    ],
    columns: [
      { key: "matricula", label: "Matrícula" }, { key: "nome", label: "Nome" }, { key: "cargo", label: "Cargo" },
      { key: "loja", label: "Loja" }, { key: "departamento", label: "Departamento" }, { key: "admissao", label: "Admissão" },
      { key: "status", label: "Status", status: true },
    ],
    rows: funcionarios.map((f) => ({ ...f, salario: brl(f.salario) })),
    future: "Ficha completa com histórico de cargos, salários, transferências e ocorrências será ligada ao banco de dados com acesso restrito por perfil.",
  },
  admissoes: {
    title: "Admissões e desligamentos",
    description: "Acompanhe processos admissionais, contratos de experiência e rescisões.",
    tableTitle: "Movimentações recentes",
    actions: ["Nova admissão", "Registrar desligamento"],
    kpis: [
      { label: "Admissões no mês", value: "9", icon: UserPlus, tone: "success" },
      { label: "Desligamentos", value: "6", icon: UserMinus, tone: "danger" },
      { label: "Experiência a vencer", value: "5", icon: FileClock, tone: "warning" },
      { label: "Processos abertos", value: "3", icon: Activity },
    ],
    columns: [
      { key: "tipo", label: "Tipo" }, { key: "nome", label: "Colaborador" }, { key: "loja", label: "Loja" },
      { key: "data", label: "Data" }, { key: "motivo", label: "Motivo / etapa" }, { key: "status", label: "Status", status: true },
    ],
    rows: [
      { tipo: "Admissão", nome: "Rafael Gomes (demo)", loja: "Loja Norte", data: "14/10/2026", motivo: "Exame admissional", status: "Pendente" },
      { tipo: "Admissão", nome: "Sofia Ramos (demo)", loja: "Loja Centro", data: "07/10/2026", motivo: "Documentação completa", status: "Concluído" },
      { tipo: "Desligamento", nome: "Tiago Alves (demo)", loja: "Loja Sul", data: "03/10/2026", motivo: "Pedido de demissão", status: "Concluído" },
      { tipo: "Desligamento", nome: "Vera Lopes (demo)", loja: "Loja Shopping", data: "10/10/2026", motivo: "Término de experiência", status: "Em andamento" },
      { tipo: "Admissão", nome: "Wagner Pinto (demo)", loja: "Loja Leste", data: "16/10/2026", motivo: "Assinatura de contrato", status: "Pendente" },
    ],
    future: "Cálculos rescisórios oficiais e envio ao eSocial não estão implementados; serão feitos pelo sistema oficial de folha via integração.",
  },
  ponto: {
    title: "Ponto e jornada",
    description: "Espelho de ponto, horas extras, atrasos e banco de horas por loja.",
    tableTitle: "Resumo de jornada — outubro",
    actions: ["Importar arquivo AFD", "Fechar período"],
    kpis: [
      { label: "Horas extras", value: "612 h", icon: Timer, tone: "warning" },
      { label: "Absenteísmo", value: "2,8%", icon: CalendarX },
      { label: "Batidas inconsistentes", value: "27", icon: AlertTriangle, tone: "danger" },
      { label: "Banco de horas", value: "+340 h", icon: Clock },
    ],
    columns: [
      { key: "loja", label: "Loja" }, { key: "previstas", label: "Horas previstas", align: "right" },
      { key: "trabalhadas", label: "Trabalhadas", align: "right" }, { key: "extras", label: "Extras", align: "right" },
      { key: "faltas", label: "Faltas", align: "right" }, { key: "status", label: "Fechamento", status: true },
    ],
    rows: [
      ["Loja Centro", "5.984", "6.112", "128", "6", "Em andamento"], ["Loja Norte", "4.576", "4.660", "84", "4", "Pendente"],
      ["Loja Sul", "4.224", "4.316", "92", "5", "Pendente"], ["Loja Shopping", "5.456", "5.597", "141", "7", "Em andamento"],
      ["Loja Leste", "3.872", "3.930", "58", "2", "Aprovado"], ["Loja Oeste", "3.696", "3.743", "47", "3", "Aprovado"],
    ].map(([loja, previstas, trabalhadas, extras, faltas, status]) => ({ loja, previstas, trabalhadas, extras, faltas, status })),
    future: "A importação de arquivos (AFD/AEJ) e a integração com relógios e sistemas de ponto externos estão previstas para uma próxima etapa.",
  },
  ferias: {
    title: "Férias e afastamentos",
    description: "Programação de férias, períodos aquisitivos e afastamentos médicos ou legais.",
    tableTitle: "Programação e afastamentos",
    actions: ["Programar férias", "Registrar afastamento"],
    kpis: [
      { label: "Em férias agora", value: "9", icon: Palmtree },
      { label: "Férias vencidas", value: "2", icon: AlertTriangle, tone: "danger" },
      { label: "A vencer em 60 dias", value: "11", icon: FileClock, tone: "warning" },
      { label: "Afastados", value: "4", icon: CalendarX },
    ],
    columns: [
      { key: "nome", label: "Colaborador" }, { key: "loja", label: "Loja" }, { key: "tipo", label: "Tipo" },
      { key: "inicio", label: "Início" }, { key: "fim", label: "Fim" }, { key: "status", label: "Status", status: true },
    ],
    rows: [
      { nome: "Ana Souza (demo)", loja: "Loja Centro", tipo: "Férias", inicio: "06/10/2026", fim: "04/11/2026", status: "Em andamento" },
      { nome: "Diego Rocha (demo)", loja: "Loja Shopping", tipo: "Férias", inicio: "03/11/2026", fim: "22/11/2026", status: "Aprovado" },
      { nome: "Henrique Dias (demo)", loja: "Loja Matriz", tipo: "Licença médica", inicio: "29/09/2026", fim: "28/10/2026", status: "Em andamento" },
      { nome: "Paula Cardoso (demo)", loja: "Loja Sul", tipo: "Férias vencidas", inicio: "—", fim: "—", status: "Vencido" },
      { nome: "Lucas Barbosa (demo)", loja: "Loja Norte", tipo: "Licença paternidade", inicio: "12/10/2026", fim: "01/11/2026", status: "Em andamento" },
    ],
  },
  folha: {
    title: "Folha de pagamento",
    description: "Prévia, conferência e aprovação da folha antes do envio ao sistema oficial.",
    tableTitle: "Prévia da folha — outubro/2026",
    actions: ["Gerar prévia", "Aprovar", "Exportar para sistema oficial"],
    kpis: [
      { label: "Bruto (prévia)", value: brl(612300), icon: Wallet },
      { label: "Encargos estimados", value: brl(168200), icon: Activity },
      { label: "Divergências", value: "7", icon: AlertTriangle, tone: "warning" },
      { label: "Etapa", value: "Conferência", icon: CheckCircle2 },
    ],
    columns: [
      { key: "loja", label: "Loja" }, { key: "colab", label: "Colaboradores", align: "right" },
      { key: "bruto", label: "Bruto estimado", align: "right" }, { key: "extras", label: "Horas extras", align: "right" },
      { key: "status", label: "Conferência", status: true },
    ],
    rows: [
      ["Loja Centro", "34", 112400, 9800, "Pendente"], ["Loja Norte", "26", 84200, 6100, "Aprovado"],
      ["Loja Sul", "24", 79100, 6700, "Pendente"], ["Loja Shopping", "31", 104900, 10400, "Em andamento"],
      ["Loja Leste", "22", 71200, 4300, "Aprovado"], ["Loja Oeste", "21", 68400, 3500, "Aprovado"],
    ].map(([loja, colab, bruto, extras, status]) => ({ loja: String(loja), colab: String(colab), bruto: brl(Number(bruto)), extras: brl(Number(extras)), status: String(status) })),
    future: "Os valores são estimativas fictícias. Cálculos oficiais (INSS, IRRF, FGTS) não estão implementados; o fluxo de aprovação e a exportação serão ligados ao sistema oficial de folha.",
  },
  beneficios: {
    title: "Benefícios e custos de pessoal",
    description: "Benefícios concedidos e composição do custo total de pessoal. Acesso restrito a RH e diretoria.",
    tableTitle: "Benefícios",
    actions: ["Novo benefício"],
    kpis: [
      { label: "Custo total de pessoal", value: brl(812400), icon: Wallet },
      { label: "Benefícios / mês", value: brl(96800), icon: HeartHandshake },
      { label: "Custo médio por colaborador", value: brl(4415), icon: Users },
      { label: "Adesão plano de saúde", value: "68%", icon: Activity },
    ],
    columns: [
      { key: "beneficio", label: "Benefício" }, { key: "fornecedor", label: "Fornecedor" },
      { key: "ativos", label: "Beneficiários", align: "right" }, { key: "custo", label: "Custo mensal", align: "right" },
      { key: "status", label: "Status", status: true },
    ],
    rows: [
      ["Vale-transporte", "Operadora demo", "142", 31200], ["Vale-refeição", "Fornecedor demo A", "184", 38600],
      ["Plano de saúde", "Operadora demo B", "125", 21400], ["Plano odontológico", "Operadora demo C", "98", 2900],
      ["Seguro de vida", "Seguradora demo", "184", 2700],
    ].map(([beneficio, fornecedor, ativos, custo]) => ({ beneficio: String(beneficio), fornecedor: String(fornecedor), ativos: String(ativos), custo: brl(Number(custo)), status: "Ativo" })),
  },
  documentos: {
    title: "Documentos e vencimentos",
    description: "ASOs, contratos, certificados e documentos com controle de validade.",
    tableTitle: "Documentos monitorados",
    actions: ["Enviar documento"],
    kpis: [
      { label: "Documentos válidos", value: "1.248", icon: FileText, tone: "success" },
      { label: "A vencer (30 dias)", value: "18", icon: FileClock, tone: "warning" },
      { label: "Vencidos", value: "3", icon: AlertTriangle, tone: "danger" },
      { label: "Pendentes de envio", value: "6", icon: Upload },
    ],
    columns: [
      { key: "nome", label: "Colaborador" }, { key: "doc", label: "Documento" }, { key: "loja", label: "Loja" },
      { key: "venc", label: "Vencimento" }, { key: "status", label: "Situação", status: true },
    ],
    rows: [
      { nome: "Bruno Lima (demo)", doc: "ASO periódico", loja: "Loja Norte", venc: "22/10/2026", status: "A vencer" },
      { nome: "Carla Mendes (demo)", doc: "ASO periódico", loja: "Loja Sul", venc: "24/10/2026", status: "A vencer" },
      { nome: "Fábio Nunes (demo)", doc: "Certificado NR-23", loja: "Loja Oeste", venc: "02/10/2026", status: "Vencido" },
      { nome: "Gabriela Alves (demo)", doc: "Contrato de experiência", loja: "Loja Matriz", venc: "25/10/2026", status: "A vencer" },
      { nome: "Isabela Moraes (demo)", doc: "CNH", loja: "Loja Centro", venc: "18/03/2028", status: "Válido" },
    ],
    future: "O armazenamento privado de arquivos, com acesso controlado por perfil, será ativado junto com o backend.",
  },
  recrutamento: {
    title: "Recrutamento e seleção",
    description: "Vagas abertas, candidatos e etapas do processo seletivo.",
    tableTitle: "Vagas",
    actions: ["Abrir vaga"],
    kpis: [
      { label: "Vagas abertas", value: "8", icon: Briefcase },
      { label: "Candidatos", value: "143", icon: Users },
      { label: "Em entrevista", value: "17", icon: Activity },
      { label: "Tempo médio p/ fechar", value: "21 dias", icon: Clock },
    ],
    columns: [
      { key: "vaga", label: "Vaga" }, { key: "loja", label: "Loja" }, { key: "candidatos", label: "Candidatos", align: "right" },
      { key: "etapa", label: "Etapa" }, { key: "status", label: "Status", status: true },
    ],
    rows: [
      { vaga: "Vendedor(a)", loja: "Loja Shopping", candidatos: "42", etapa: "Entrevistas", status: "Em andamento" },
      { vaga: "Operador(a) de caixa", loja: "Loja Centro", candidatos: "37", etapa: "Triagem", status: "Em andamento" },
      { vaga: "Estoquista", loja: "Loja Norte", candidatos: "21", etapa: "Proposta", status: "Pendente" },
      { vaga: "Fiscal de loja", loja: "Loja Leste", candidatos: "15", etapa: "Encerrada", status: "Concluído" },
    ],
  },
  desempenho: {
    title: "Desempenho e treinamentos",
    description: "Ciclos de avaliação, metas e trilhas de treinamento obrigatórias.",
    tableTitle: "Treinamentos",
    actions: ["Novo ciclo de avaliação", "Novo treinamento"],
    kpis: [
      { label: "Avaliações concluídas", value: "72%", icon: CheckCircle2, tone: "success" },
      { label: "Treinamentos no mês", value: "6", icon: GraduationCap },
      { label: "Obrigatórios pendentes", value: "4", icon: AlertTriangle, tone: "warning" },
      { label: "Horas de capacitação", value: "318 h", icon: Clock },
    ],
    columns: [
      { key: "treino", label: "Treinamento" }, { key: "publico", label: "Público" },
      { key: "inscritos", label: "Inscritos", align: "right" }, { key: "data", label: "Data" }, { key: "status", label: "Status", status: true },
    ],
    rows: [
      { treino: "Atendimento ao cliente", publico: "Vendas", inscritos: "48", data: "21/10/2026", status: "Aprovado" },
      { treino: "NR-23 Brigada de incêndio", publico: "Todas as lojas", inscritos: "22", data: "28/10/2026", status: "Pendente" },
      { treino: "Prevenção de perdas", publico: "Caixa e estoque", inscritos: "35", data: "04/11/2026", status: "Pendente" },
      { treino: "Liderança para gerentes", publico: "Gerência", inscritos: "7", data: "30/09/2026", status: "Concluído" },
    ],
  },
  integracoes: {
    title: "Integrações",
    description: "Conexões com sistemas externos. Nenhuma integração está ativa nesta etapa.",
    tableTitle: "Integrações previstas",
    kpis: [
      { label: "Conectadas", value: "0", icon: Plug },
      { label: "Previstas", value: "5", icon: Activity },
    ],
    columns: [
      { key: "sistema", label: "Sistema" }, { key: "finalidade", label: "Finalidade" }, { key: "status", label: "Status", status: true },
    ],
    rows: [
      { sistema: "Sistema oficial de folha", finalidade: "Exportar folha aprovada", status: "Não conectado" },
      { sistema: "Relógio / sistema de ponto", finalidade: "Importar marcações", status: "Não conectado" },
      { sistema: "eSocial (via folha)", finalidade: "Eventos trabalhistas", status: "Não conectado" },
      { sistema: "Operadoras de benefícios", finalidade: "Conciliar faturas", status: "Não conectado" },
      { sistema: "OpenAI", finalidade: "Assistente de IA", status: "Não conectado" },
    ],
    future: "Credenciais de integrações serão guardadas apenas no servidor e nunca expostas no navegador.",
  },
  usuarios: {
    title: "Usuários, permissões e auditoria",
    description: "11 contas previstas: 6 RH, 4 diretoria e 1 administrador. Gerentes de loja não possuem conta.",
    tableTitle: "Contas previstas",
    actions: ["Convidar usuário", "Ver logs de erro"],
    kpis: [
      { label: "Equipe de RH", value: "6", icon: Users },
      { label: "Diretoria", value: "4", icon: ShieldCheck },
      { label: "Administrador", value: "1", icon: ShieldCheck },
      { label: "Contas ativas", value: "0", icon: Activity, hint: "Autenticação pendente" },
    ],
    columns: [
      { key: "perfil", label: "Perfil" }, { key: "qtd", label: "Contas", align: "right" },
      { key: "acesso", label: "Acesso" }, { key: "status", label: "Status", status: true },
    ],
    rows: [
      { perfil: "RH", qtd: "6", acesso: "Cadastros, ponto, férias, documentos, folha (prévia)", status: "Pendente" },
      { perfil: "Diretoria", qtd: "4", acesso: "Dashboard, relatórios, salários e custos de pessoal", status: "Pendente" },
      { perfil: "Administrador", qtd: "1", acesso: "Configurações, usuários, logs e auditoria", status: "Pendente" },
    ],
    future: "Autenticação segura, papéis de acesso e trilha de auditoria serão implementados no backend. Nada nesta tela concede acesso real ainda.",
  },
} satisfies Record<string, ModuleConfig>;
