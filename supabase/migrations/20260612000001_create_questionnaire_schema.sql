-- Schema questionario PEI a distanza
create table public.sections (
  id smallint primary key,
  position smallint not null,
  title text not null
);

create table public.questions (
  id smallint primary key,
  section_id smallint not null references public.sections(id),
  position smallint not null,
  text text not null,
  description text,
  type text not null check (type in ('radio', 'checkbox', 'text', 'textarea')),
  options text[],
  required boolean not null default true,
  has_other boolean not null default false,
  extra_text_trigger text,
  extra_text_label text
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.answers (
  id bigint generated always as identity primary key,
  submission_id uuid not null references public.submissions(id) on delete cascade,
  question_id smallint not null references public.questions(id),
  value jsonb not null,
  unique (submission_id, question_id)
);

create index answers_submission_id_idx on public.answers(submission_id);

-- RLS: anon legge solo domande/sezioni, scrive solo via RPC
alter table public.sections enable row level security;
alter table public.questions enable row level security;
alter table public.submissions enable row level security;
alter table public.answers enable row level security;

create policy "sections leggibili da tutti"
  on public.sections for select
  to anon, authenticated
  using (true);

create policy "questions leggibili da tutti"
  on public.questions for select
  to anon, authenticated
  using (true);

-- Nessuna policy su submissions/answers: accesso solo via funzione security definer

-- RPC atomica: crea submission + answers in un'unica transazione
create or replace function public.submit_questionnaire(p_answers jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_answers is null or jsonb_typeof(p_answers) <> 'array' or jsonb_array_length(p_answers) = 0 then
    raise exception 'p_answers deve essere un array non vuoto';
  end if;

  insert into submissions default values returning id into v_id;

  insert into answers (submission_id, question_id, value)
  select v_id, (a->>'question_id')::smallint, a->'value'
  from jsonb_array_elements(p_answers) a;

  return v_id;
end;
$$;

revoke execute on function public.submit_questionnaire(jsonb) from public;
grant execute on function public.submit_questionnaire(jsonb) to anon, authenticated;
