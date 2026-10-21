-- Scrumbão | Migração aditiva para o MESMO projeto Supabase que já contém kanban_cards.
-- Execute no SQL Editor do Supabase depois de exportar/backup do banco.
-- Não apaga nem altera public.kanban_cards. A demonstração do app deve usar estado local.
-- Reexecutar é tolerado para tabelas/policies/triggers/funções desta migração,
-- mas revise erros de uma execução anterior antes de tentar novamente.

begin;

-- Contas privadas do Scrumbão
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nome text not null default '',
  avatar_url text not null default '',
  ultimo_acesso timestamptz not null default now()
);
alter table public.perfis add column if not exists email text;
alter table public.perfis add column if not exists nome text not null default '';
alter table public.perfis add column if not exists avatar_url text not null default '';
alter table public.perfis add column if not exists ultimo_acesso timestamptz not null default now();

create table if not exists public.scrums (
  id uuid primary key default gen_random_uuid(),
  criador uuid not null references public.perfis(id) on delete cascade,
  nome text not null,
  estado jsonb not null,
  revisao integer not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists public.scrum_membros (
  scrum_id uuid not null references public.scrums(id) on delete cascade,
  usuario_id uuid not null references public.perfis(id) on delete cascade,
  papel text not null check (papel in ('criador', 'convidado')),
  primary key (scrum_id, usuario_id)
);

create table if not exists public.sprints (
  id uuid primary key default gen_random_uuid(),
  scrum_id uuid not null references public.scrums(id) on delete cascade,
  numero integer not null,
  dados jsonb not null,
  encerrada boolean not null default false,
  unique (scrum_id, numero)
);

create table if not exists public.cards (
  id text not null,
  scrum_id uuid not null references public.scrums(id) on delete cascade,
  dados jsonb not null,
  prioridade integer not null,
  arquivado boolean not null default false,
  primary key (scrum_id, id)
);

create table if not exists public.convites (
  id uuid primary key default gen_random_uuid(),
  scrum_id uuid not null references public.scrums(id) on delete cascade,
  email text not null,
  criado_em timestamptz not null default now(),
  unique (scrum_id, email)
);

create index if not exists scrum_membros_usuario_idx on public.scrum_membros(usuario_id);
create index if not exists sprints_scrum_idx on public.sprints(scrum_id);
create index if not exists cards_scrum_prioridade_idx on public.cards(scrum_id, prioridade);
create index if not exists convites_email_idx on public.convites(email);

-- Apenas leitura direta para membros; toda escrita passa pelas RPCs validadas abaixo.
grant select on public.perfis, public.scrums, public.scrum_membros,
  public.sprints, public.cards, public.convites to authenticated;
grant all on public.perfis, public.scrums, public.scrum_membros,
  public.sprints, public.cards, public.convites to service_role;
revoke all on public.perfis, public.scrums, public.scrum_membros,
  public.sprints, public.cards, public.convites from anon;

alter table public.perfis enable row level security;
alter table public.scrums enable row level security;
alter table public.scrum_membros enable row level security;
alter table public.sprints enable row level security;
alter table public.cards enable row level security;
alter table public.convites enable row level security;

-- Funções auxiliares das políticas. São SECURITY DEFINER para evitar recursão de RLS.
create or replace function public.scrum_acesso(sid uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.scrum_membros m
    where m.scrum_id = sid and m.usuario_id = auth.uid()
  );
$$;

create or replace function public.scrum_dono(sid uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.scrums s
    where s.id = sid and s.criador = auth.uid()
  );
$$;

revoke all on function public.scrum_acesso(uuid) from public, anon;
revoke all on function public.scrum_dono(uuid) from public, anon;
grant execute on function public.scrum_acesso(uuid), public.scrum_dono(uuid) to authenticated;

-- Recriar políticas para que a migração possa ser retomada após falha parcial.
drop policy if exists perfil_leitura on public.perfis;
drop policy if exists scrum_leitura on public.scrums;
drop policy if exists membros_leitura on public.scrum_membros;
drop policy if exists sprint_leitura on public.sprints;
drop policy if exists cards_leitura on public.cards;
drop policy if exists convites_leitura on public.convites;

create policy perfil_leitura on public.perfis for select to authenticated
  using (
    id = (select auth.uid()) or exists (
      select 1 from public.scrum_membros m
      where m.usuario_id = perfis.id and public.scrum_acesso(m.scrum_id)
    )
  );
create policy scrum_leitura on public.scrums for select to authenticated
  using (public.scrum_acesso(id));
create policy membros_leitura on public.scrum_membros for select to authenticated
  using (public.scrum_acesso(scrum_id));
create policy sprint_leitura on public.sprints for select to authenticated
  using (public.scrum_acesso(scrum_id));
create policy cards_leitura on public.cards for select to authenticated
  using (public.scrum_acesso(scrum_id));
create policy convites_leitura on public.convites for select to authenticated
  using (public.scrum_dono(scrum_id) or email = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Limites globais e por conta, serializados para evitar duas criações concorrentes.
create or replace function public.validar_limites()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(7812026);
  if tg_table_name = 'perfis' then
    if (select count(*) from public.perfis) >= 50 then
      raise exception 'Limite de 50 usuários atingido';
    end if;
  elsif tg_table_name = 'scrums' then
    if (select count(*) from public.scrums) >= 100 then
      raise exception 'Limite de 100 Scrums atingido';
    end if;
    if (select count(*) from public.scrums where criador = new.criador) >= 2 then
      raise exception 'Você já criou 2 Scrums';
    end if;
  elsif tg_table_name = 'scrum_membros' then
    if (select count(*) from public.scrum_membros where scrum_id = new.scrum_id) >= 6 then
      raise exception 'Equipe completa: máximo 6 pessoas';
    end if;
    if new.papel = 'convidado' and (
      select count(*) from public.scrum_membros
      where usuario_id = new.usuario_id and papel = 'convidado'
    ) >= 2 then
      raise exception 'Máximo 2 Scrums como convidado';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.validar_limites() from public, anon, authenticated;
drop trigger if exists limite_perfis on public.perfis;
drop trigger if exists limite_scrums on public.scrums;
drop trigger if exists limite_membros on public.scrum_membros;
create trigger limite_perfis before insert on public.perfis
  for each row execute function public.validar_limites();
create trigger limite_scrums before insert on public.scrums
  for each row execute function public.validar_limites();
create trigger limite_membros before insert on public.scrum_membros
  for each row execute function public.validar_limites();

-- Cria o perfil no cadastro do Supabase Auth. Erro no limite cancela o cadastro.
create or replace function public.criar_perfil()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, email, nome, avatar_url)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', '')
  );
  return new;
end;
$$;
revoke all on function public.criar_perfil() from public, anon, authenticated;
drop trigger if exists scrumbao_perfil on auth.users;
create trigger scrumbao_perfil after insert on auth.users
  for each row execute function public.criar_perfil();

-- Atualiza nome/foto e registra acesso. A confirmação do e-mail é exigida nas ações críticas.
create or replace function public.scrumbao_conta(p_nome text default null, p_avatar text default null)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Entre na sua conta'; end if;
  if p_nome is not null and length(trim(p_nome)) > 120 then raise exception 'Nome muito longo'; end if;
  if p_avatar is not null and length(p_avatar) > 2048 then raise exception 'Link de avatar muito longo'; end if;
  update public.perfis
  set ultimo_acesso = now(),
      nome = coalesce(nullif(trim(p_nome), ''), nome),
      avatar_url = coalesce(p_avatar, avatar_url)
  where id = auth.uid();
end;
$$;

create or replace function public.scrumbao_criar(p_nome text, p_estado jsonb, p_origem uuid default null)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  sid uuid;
  st jsonb;
begin
  if auth.uid() is null or not exists (
    select 1 from auth.users u where u.id = auth.uid() and u.email_confirmed_at is not null
  ) then raise exception 'Confirme seu e-mail'; end if;
  if p_nome is null or length(trim(p_nome)) = 0 or length(trim(p_nome)) > 120 then
    raise exception 'Nome inválido';
  end if;
  if p_origem is not null then
    if not public.scrum_acesso(p_origem) then raise exception 'Sem acesso ao Scrum de origem'; end if;
    select s.estado into st from public.scrums s where s.id = p_origem;
  else
    st := p_estado;
  end if;
  if st is null or pg_catalog.jsonb_typeof(st) <> 'object' then raise exception 'Estado do quadro inválido'; end if;
  st := pg_catalog.jsonb_set(pg_catalog.jsonb_set(st, '{produto}', pg_catalog.to_jsonb(trim(p_nome))), '{time}', '[]'::jsonb, true);
  insert into public.scrums (criador, nome, estado) values (auth.uid(), trim(p_nome), st) returning id into sid;
  insert into public.scrum_membros (scrum_id, usuario_id, papel) values (sid, auth.uid(), 'criador');
  return sid;
end;
$$;

create or replace function public.scrumbao_salvar(p_id uuid, p_estado jsonb, p_revisao integer)
returns integer
language plpgsql security definer
set search_path = ''
as $$
declare
  atual integer;
  anterior jsonb;
  c jsonb;
  h jsonb;
  pos integer := 0;
begin
  if not public.scrum_acesso(p_id) then raise exception 'Sem acesso'; end if;
  if p_estado is null or pg_catalog.jsonb_typeof(p_estado) <> 'object'
     or pg_catalog.jsonb_typeof(p_estado -> 'itens') is distinct from 'array'
     or pg_catalog.jsonb_typeof(p_estado -> 'historico') is distinct from 'array' then
    raise exception 'Quadro inválido';
  end if;
  select s.revisao, s.estado into atual, anterior
  from public.scrums s where s.id = p_id for update;
  if atual is null then raise exception 'Scrum não encontrado'; end if;
  if atual <> p_revisao then raise exception 'O quadro mudou. Recarregue para continuar.'; end if;

  -- Mantém arquivados os itens concluídos que saíram do estado atual.
  if pg_catalog.jsonb_typeof(anterior -> 'itens') = 'array' then
    for c in select e.value from pg_catalog.jsonb_array_elements(anterior -> 'itens') e(value) loop
      if c ->> 'coluna' = 'feito' and not exists (
        select 1 from pg_catalog.jsonb_array_elements(p_estado -> 'itens') v(value)
        where v.value ->> 'id' = c ->> 'id'
      ) then
        insert into public.cards (id, scrum_id, dados, prioridade, arquivado)
        values (c ->> 'id', p_id, c, 0, true)
        on conflict (scrum_id, id) do update set dados = excluded.dados, arquivado = true;
      end if;
    end loop;
  end if;

  delete from public.cards where scrum_id = p_id and not arquivado;
  for c in select e.value from pg_catalog.jsonb_array_elements(p_estado -> 'itens') e(value) loop
    if coalesce(c ->> 'id', '') = '' then raise exception 'Item sem identificador'; end if;
    insert into public.cards (id, scrum_id, dados, prioridade, arquivado)
    values (c ->> 'id', p_id, c, pos, false)
    on conflict (scrum_id, id) do update
      set dados = excluded.dados, prioridade = excluded.prioridade, arquivado = false;
    pos := pos + 1;
  end loop;

  for h in select e.value from pg_catalog.jsonb_array_elements(p_estado -> 'historico') e(value) loop
    if coalesce(h ->> 'numero', '') !~ '^[0-9]+$' then raise exception 'Sprint no histórico inválida'; end if;
    insert into public.sprints (scrum_id, numero, dados, encerrada)
    values (p_id, (h ->> 'numero')::integer, h, true)
    on conflict (scrum_id, numero) do update set dados = excluded.dados, encerrada = true;
  end loop;

  if p_estado -> 'sprint' is not null and p_estado -> 'sprint' <> 'null'::jsonb then
    h := p_estado -> 'sprint';
    if pg_catalog.jsonb_typeof(h) <> 'object' or coalesce(h ->> 'numero', '') !~ '^[0-9]+$' then
      raise exception 'Sprint ativa inválida';
    end if;
    insert into public.sprints (scrum_id, numero, dados, encerrada)
    values (p_id, (h ->> 'numero')::integer, h, false)
    on conflict (scrum_id, numero) do update set dados = excluded.dados, encerrada = false;
  end if;

  update public.scrums s
  set estado = pg_catalog.jsonb_set(
                pg_catalog.jsonb_set(p_estado, '{produto}', pg_catalog.to_jsonb(s.nome), true),
                '{time}', '[]'::jsonb, true),
      revisao = s.revisao + 1
  where s.id = p_id;
  return atual + 1;
end;
$$;

create or replace function public.scrumbao_convidar(p_id uuid, p_email text)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  cid uuid;
  email_limpo text;
begin
  if not public.scrum_dono(p_id) then raise exception 'Só o criador pode convidar'; end if;
  perform pg_catalog.pg_advisory_xact_lock(7812026);
  email_limpo := lower(trim(coalesce(p_email, '')));
  if email_limpo !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'E-mail inválido'; end if;
  if exists (
    select 1 from public.scrum_membros m join public.perfis p on p.id = m.usuario_id
    where m.scrum_id = p_id and p.email = email_limpo
  ) then raise exception 'Esta pessoa já participa'; end if;
  if exists (select 1 from public.convites c where c.scrum_id = p_id and c.email = email_limpo) then
    raise exception 'Já existe convite pendente para este e-mail';
  end if;
  if (select count(*) from public.scrum_membros where scrum_id = p_id)
     + (select count(*) from public.convites where scrum_id = p_id) >= 6 then
    raise exception 'Equipe e convites ocupam as 6 vagas';
  end if;
  insert into public.convites (scrum_id, email) values (p_id, email_limpo) returning id into cid;
  return cid;
end;
$$;

create or replace function public.scrumbao_aceitar(p_convite uuid)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  c public.convites%rowtype;
begin
  if auth.uid() is null then raise exception 'Entre na sua conta'; end if;
  select * into c from public.convites where id = p_convite for update;
  if c.id is null or not exists (
    select 1 from auth.users u
    where u.id = auth.uid() and lower(u.email) = c.email and u.email_confirmed_at is not null
  ) then raise exception 'Convite indisponível para esta conta'; end if;
  insert into public.scrum_membros (scrum_id, usuario_id, papel)
  values (c.scrum_id, auth.uid(), 'convidado');
  delete from public.convites where id = c.id;
  return c.scrum_id;
end;
$$;

create or replace function public.scrumbao_remover(p_id uuid, p_usuario uuid default null, p_convite uuid default null)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if p_convite is not null then
    if not public.scrum_dono(p_id) then raise exception 'Sem permissão'; end if;
    delete from public.convites where id = p_convite and scrum_id = p_id;
  elsif p_usuario is null then
    if not public.scrum_dono(p_id) then raise exception 'Só o criador encerra o Scrum'; end if;
    delete from public.scrums where id = p_id;
  else
    if not public.scrum_dono(p_id) and p_usuario <> auth.uid() then raise exception 'Sem permissão'; end if;
    delete from public.scrum_membros
    where scrum_id = p_id and usuario_id = p_usuario and papel = 'convidado';
  end if;
end;
$$;

-- RPCs: authenticated pode chamar; anon e PUBLIC não.
revoke all on function public.scrumbao_conta(text, text) from public, anon;
revoke all on function public.scrumbao_criar(text, jsonb, uuid) from public, anon;
revoke all on function public.scrumbao_salvar(uuid, jsonb, integer) from public, anon;
revoke all on function public.scrumbao_convidar(uuid, text) from public, anon;
revoke all on function public.scrumbao_aceitar(uuid) from public, anon;
revoke all on function public.scrumbao_remover(uuid, uuid, uuid) from public, anon;
grant execute on function public.scrumbao_conta(text, text),
  public.scrumbao_criar(text, jsonb, uuid),
  public.scrumbao_salvar(uuid, jsonb, integer),
  public.scrumbao_convidar(uuid, text),
  public.scrumbao_aceitar(uuid),
  public.scrumbao_remover(uuid, uuid, uuid) to authenticated;

commit;

-- A remoção da tabela antiga NÃO está incluída intencionalmente. Após validar
-- autenticação, demo e Scrums no app, e somente depois de exportar backup, você
-- pode remover separadamente a tabela anterior se realmente não precisar mais dela:
-- drop table public.kanban_cards;

-- Este SQL não configura exclusão automática por inatividade nem envio de e-mails.
-- Isso exige agendamento/Edge Function e política operacional separada.


-- Função que apaga contas e Scrums sem acesso há mais de 30 dias
CREATE OR REPLACE FUNCTION public.limpar_inativos()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_usuarios_deletados integer := 0;
  v_scrums_deletados integer := 0;
BEGIN
  -- 1. Identifica e exclui da tabela auth.users os usuários inativos há mais de 30 dias.
  -- O ON DELETE CASCADE configurado no banco vai apagar automaticamente o perfil,
  -- os scrums criados por ele, participações e cartões.
  WITH usuarios_alvo AS (
    SELECT id FROM auth.users
    WHERE (
      (last_sign_in_at IS NULL AND created_at < now() - interval '30 days')
      OR
      (last_sign_in_at < now() - interval '30 days')
    )
  ),
  removidos AS (
    DELETE FROM auth.users
    WHERE id IN (SELECT id FROM usuarios_alvo)
    RETURNING id
  )
  SELECT count(*) INTO v_usuarios_deletados FROM removidos;

  -- 2. Exclui Scrums abandonados (onde nenhum membro acessou nos últimos 30 dias)
  WITH scrums_alvo AS (
    SELECT s.id FROM public.scrums s
    WHERE s.criado_em < now() - interval '30 days'
      AND NOT EXISTS (
        SELECT 1 FROM public.scrum_membros sm
        JOIN public.perfis p ON p.id = sm.usuario_id
        WHERE sm.scrum_id = s.id
          AND p.ultimo_acesso >= now() - interval '30 days'
      )
  ),
  removidos_scrums AS (
    DELETE FROM public.scrums
    WHERE id IN (SELECT id FROM scrums_alvo)
    RETURNING id
  )
  SELECT count(*) INTO v_scrums_deletados FROM removidos_scrums;

  RETURN json_build_object(
    'sucesso', true,
    'usuarios_removidos', v_usuarios_deletados,
    'scrums_removidos', v_scrums_deletados,
    'executado_em', now()
  );
END;
$$;

-- Permite que apenas a service_role (usada pela action) execute essa limpeza
REVOKE ALL ON FUNCTION public.limpar_inativos() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.limpar_inativos() FROM authenticated;
REVOKE ALL ON FUNCTION public.limpar_inativos() FROM anon;
GRANT EXECUTE ON FUNCTION public.limpar_inativos() TO service_role;
