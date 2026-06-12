-- Lettura dati questionari per la dashboard: solo utenti autenticati (Supabase Auth)
create policy "submissions leggibili da utenti autenticati"
  on public.submissions for select
  to authenticated
  using (true);

create policy "answers leggibili da utenti autenticati"
  on public.answers for select
  to authenticated
  using (true);
