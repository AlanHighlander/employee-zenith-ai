-- Pessoas360 — base inicial para Supabase
-- Execute somente em um projeto NOVO/de teste. Revise antes de aplicar em produção.
create extension if not exists pgcrypto;

create type public.p360_role as enum ('admin', 'diretoria', 'rh');
create type public.employee_status as enum ('ativo', 'afastado', 'desligado');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  code text not null,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, code)
);

-- O perfil é criado pelo administrador; o usuário não escolhe seu próprio papel.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete restrict,
  company_id uuid not null references public.companies(id),
  full_name text not null,
  role public.p360_role not null default 'rh',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.user_store_access (
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete restrict,
  primary key (user_id, store_id)
);

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  store_id uuid not null references public.stores(id),
  employee_code text not null,
  full_name text not null,
  job_title text,
  admission_date date,
  termination_date date,
  status public.employee_status not null default 'ativo',
  salary numeric(12,2) check (salary is null or salary >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, employee_code)
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  company_id uuid not null references public.companies(id),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index employees_company_store_idx on public.employees(company_id, store_id);
create index audit_logs_company_created_idx on public.audit_logs(company_id, created_at desc);

create or replace function public.current_p360_role()
returns public.p360_role
language sql stable security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.user_id = (select auth.uid()) and p.active = true
  limit 1
$$;

create or replace function public.can_access_store(target_store_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.stores s
    join public.profiles p on p.company_id = s.company_id
    where s.id = target_store_id
      and p.user_id = (select auth.uid())
      and p.active = true
      and (
        p.role in ('admin', 'diretoria')
        or exists (
          select 1 from public.user_store_access usa
          where usa.user_id = p.user_id and usa.store_id = s.id
        )
      )
  )
$$;

alter table public.companies enable row level security;
alter table public.stores enable row level security;
alter table public.profiles enable row level security;
alter table public.user_store_access enable row level security;
alter table public.employees enable row level security;
alter table public.audit_logs enable row level security;

create policy "company members can read their company"
on public.companies for select
using (exists (
  select 1 from public.profiles p
  where p.company_id = companies.id and p.user_id = (select auth.uid()) and p.active
));

create policy "authorized users can read stores"
on public.stores for select
using (public.can_access_store(id) or exists (
  select 1 from public.profiles p
  where p.company_id = stores.company_id
    and p.user_id = (select auth.uid())
    and p.active and p.role = 'rh'
    and exists (select 1 from public.user_store_access usa
      where usa.user_id = p.user_id and usa.store_id = stores.id)
));

create policy "users can read own profile; admin can read company profiles"
on public.profiles for select
using (
  user_id = (select auth.uid())
  or (
    public.current_p360_role() = 'admin'
    and company_id = (select p.company_id from public.profiles p where p.user_id = (select auth.uid()) and p.active)
  )
);

create policy "users can read their assigned store access"
on public.user_store_access for select
using (
  user_id = (select auth.uid())
  or public.current_p360_role() = 'admin'
);

create policy "employees read according to role and store scope"
on public.employees for select
using (
  public.current_p360_role() in ('admin', 'diretoria')
  and company_id = (select p.company_id from public.profiles p where p.user_id = (select auth.uid()) and p.active)
  or public.can_access_store(store_id)
);

-- Escritas serão feitas por operações de servidor autorizadas, após implementar
-- a camada administrativa. Não habilitamos INSERT/UPDATE/DELETE diretamente
-- para usuários comuns nesta primeira migração.
create policy "audit log visible to admin only"
on public.audit_logs for select
using (
  public.current_p360_role() = 'admin'
  and company_id = (select p.company_id from public.profiles p where p.user_id = (select auth.uid()) and p.active)
);

-- IMPORTANTE:
-- 1) Criar o primeiro administrador por processo seguro no servidor; nunca via cadastro público.
-- 2) Não colocar SUPABASE_SERVICE_ROLE_KEY no frontend.
-- 3) Antes de produção, acrescentar trilha de auditoria imutável, histórico de salário/cargo/loja,
--    políticas de escrita e testes RLS para cada papel.
