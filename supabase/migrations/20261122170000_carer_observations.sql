-- T-73: opažanja svojcev. An approved zadolženec reports something they noticed:
-- chips from the template's `opazanja` list plus optional free text (max 280 chars).
-- Severity comes only from the chips or the zadolženec's own "Da, naj sestra pogleda";
-- the free text never decides it. Alerts for staff go to public.alerts (source 'drugo').

create table public.carer_observations (
  id uuid primary key default gen_random_uuid(),
  rehab_id uuid not null references public.rehabilitacije (id) on delete cascade,
  entered_by uuid not null default auth.uid()
    references public.profiles (id) deferrable initially deferred,
  chips text[] not null default '{}',
  note text check (note is null or length(note) between 1 and 280),
  -- "Ali vas to skrbi?" → true = "Da, prosim, naj sestra pogleda"
  concern boolean not null default false,
  status public.triage_status not null default 'zeleno',
  reasons text[] not null default '{}',
  read_by uuid references public.profiles (id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (cardinality(chips) > 0 or note is not null)
);
create index on public.carer_observations (rehab_id, created_at desc);
create index carer_observations_unread on public.carer_observations (created_at) where read_at is null;

alter table public.carer_observations enable row level security;

-- Patient, approved zadolženci and staff read them.
create policy "carer observations select" on public.carer_observations for select to authenticated
  using (public.can_read_rehab(rehab_id));

-- Only an approved zadolženec adds one, as themselves, on an active rehabilitacija.
create policy "carer observations insert" on public.carer_observations for insert to authenticated
  with check (
    entered_by = auth.uid()
    and read_at is null
    and read_by is null
    and public.can_log_rehab(rehab_id)
    and exists (
      select 1 from public.rehabilitacije r
      where r.id = rehab_id and public.is_carer_of(r.patient_id)
    )
  );

-- Only staff mark them read ("Prebrano").
create policy "carer observations staff update" on public.carer_observations for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

alter publication supabase_realtime add table public.carer_observations;
