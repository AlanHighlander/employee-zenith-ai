# Employee Zenith Ai

Crie uma aplicação web chamada Pessoas360, um sistema profissional de gestão de Recursos Humanos para uma empresa brasileira com 5 a 10 lojas.

Objetivo: centralizar toda a vida funcional dos colaboradores e gerar indicadores operacionais, trabalhistas e financeiros em um único sistema.

Design: interface em português brasileiro, moderna, profissional e responsiva, com menu lateral, dashboard executivo, tabelas organizadas, filtros, gráficos e visual limpo. Utilize azul-marinho, azul e tons neutros. O sistema deve funcionar bem em computadores e celulares.

Perfis de acesso previstos:

6 usuários da equipe de RH.

4 usuários da diretoria, com acesso gerencial a salários e custos de pessoal.

1 administrador do sistema, responsável por configurações, usuários, logs e investigação de erros.

Total: 11 contas. Gerentes de loja não terão contas próprias.

Módulos do menu:

Dashboard executivo.

Funcionários e histórico funcional.

Admissões e desligamentos.

Ponto e jornada, com importação futura de arquivos e integração com sistemas externos.

Férias e afastamentos.

Folha de pagamento, com cálculos preliminares, conferência, aprovação e exportação para o sistema oficial.

Benefícios e custos de pessoal.

Documentos e vencimentos.

Recrutamento e seleção.

Desempenho e treinamentos.

Relatórios com filtros por loja, período, cargo e departamento.

Assistente de IA.

Integrações.

Usuários, permissões e auditoria.

Dashboard: mostrar quadro ativo, admissões, desligamentos, turnover, absenteísmo, horas extras, custo de pessoal e alertas pendentes. Utilizar dados fictícios claramente identificados como demonstração.

Relatórios: preparar a interface para exportação de PDF e Excel.

Assistente de IA: criar uma tela de chat preparada para integração futura com a API da OpenAI. A IA deverá respeitar as permissões do usuário e consultar dados por funções autorizadas.

Arquitetura: utilizar React/TypeScript e uma estrutura organizada para conectar posteriormente PostgreSQL, autenticação segura, armazenamento privado e serviços de backend. Não expor chaves secretas no navegador.

Importante: nesta primeira etapa, priorize um protótipo navegável, com telas coerentes, dados de demonstração e componentes reutilizáveis. Não simule que integrações externas, cálculos oficiais, autenticação real ou exportações já funcionam se ainda não estiverem implementados. Deixe a estrutura preparada para essas etapas futuras.

Comece pela interface e pelo dashboard, mantendo a arquitetura preparada para a evolução do sistema completo.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/87dca7c0-e505-52a0-a377-428012f10b68).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
