# Pessoas360 — preparar Supabase sem créditos do Lovable

## Objetivo
Manter o frontend atual e conectar um banco PostgreSQL e autenticação usando o plano gratuito do Supabase. O projeto atual ainda contém dados de demonstração e troca de perfil simulada; não é um sistema autenticado.

## 1. Criar projeto
1. Acesse https://supabase.com/ e crie uma conta.
2. Crie um projeto no plano Free, escolha uma senha forte para o banco e guarde-a fora do repositório.
3. Abra **SQL Editor** e execute o arquivo `supabase/schema.sql` somente em um projeto novo de teste.
4. Copie o Project URL e a publishable/anon key para um arquivo local `.env.local` quando a integração frontend for implementada. Nunca compartilhe chaves secretas em mensagens ou no GitHub.

## 2. Executar o frontend no computador
1. Instale Node.js (versão LTS) e Git.
2. No terminal:
   ```bash
   git clone https://github.com/AlanHighlander/employee-zenith-ai.git
   cd employee-zenith-ai
   npm install
   npm run dev
   ```
3. Abra o endereço local indicado pelo terminal.

## 3. Segurança antes do login real
- Desativar cadastro público; novas contas serão convidadas/criadas apenas por um administrador.
- Atribuir papel e lojas no servidor, nunca confiar em campos enviados pelo navegador.
- Criar o primeiro administrador por um procedimento seguro no servidor; não usar senha padrão nem expor a chave service role.
- Ativar e testar Row Level Security (RLS) para cada papel: admin técnico, diretoria e RH por loja.
- Registrar criação/bloqueio de contas, consultas sensíveis e alterações salariais em trilha de auditoria.
- Usar dados fictícios durante a implementação. Não importar dados pessoais ou salariais reais até testar as permissões e recuperação de dados.

## 4. Limitações do plano gratuito
O plano Free é ótimo para desenvolvimento, mas tem cotas, pode pausar projetos inativos e não inclui backups automáticos para download. Confira os limites atuais antes de decidir usar em produção: https://supabase.com/docs/guides/platform/billing-on-supabase

## Estado atual
Este commit adiciona a primeira estrutura de banco e o roteiro de configuração. Ainda não implementa o formulário de login nem cria usuários reais. Isso será feito em seguida, depois de configurar o projeto Supabase e validar as políticas de acesso.
