-- T-78: composed check-in plans from the modular questionnaire (src/lib/moduli/,
-- docs/modular-questionnaire.md).
--
-- patient_facts: what staff enter at discharge (DejstvaPacienta), one row per
--   rehabilitacija, editable by staff. Changing facts never changes an approved
--   plan; staff compose and approve a new plan version instead.
-- patient_plans: the approved plan snapshot (Nacrt after odobriNacrt), append-only.
--   The current plan is the highest version of the rehabilitacija. Later changes
--   to the item bank never touch a stored snapshot.
-- checkins.plan_version: the plan a check-in was answered under. Answers stay in
--   checkins.answers, keyed by the versioned item id ("sp.teza.v1"), so trends stay
--   comparable across plan versions without another table. Null = the legacy
--   template check-in (rehabilitacije.questions).

create table public.patient_facts (
  rehab_id uuid primary key references public.rehabilitacije (id) on delete cascade,
  discharge_date date not null,
  -- ICD-10 codes, e.g. {I50.0, J18.9}
  icd10 text[] not null default '{}',
  -- procedure keys, e.g. {endoproteza-kolena}
  procedures text[] not null default '{}',
  -- [{atc: "J01CA04", ime?: "Amoksicilin", konec?: "2026-11-30"}], konec = last day of a finite course
  medicines jsonb not null default '[]'::jsonb check (jsonb_typeof(medicines) = 'array'),
  entered_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger patient_facts_updated_at before update on public.patient_facts
  for each row execute function public.set_updated_at();

create table public.patient_plans (
  id uuid primary key default gen_random_uuid(),
  rehab_id uuid not null references public.rehabilitacije (id) on delete cascade,
  -- 1, 2, 3 … per rehabilitacija
  version int not null check (version >= 1),
  -- Nacrt.verzija: version of the item bank the plan was composed from
  bank_version int not null,
  -- the approved Nacrt (status "odobren"), frozen
  plan jsonb not null check (jsonb_typeof(plan) = 'object'),
  approved_by uuid not null default auth.uid() references public.profiles (id),
  approved_at timestamptz not null default now(),
  unique (rehab_id, version)
);

alter table public.checkins
  add column plan_version int,
  add constraint checkins_plan_fk foreign key (rehab_id, plan_version)
    references public.patient_plans (rehab_id, version);

alter table public.patient_facts enable row level security;
alter table public.patient_plans enable row level security;

-- Facts: read with the rehabilitacija (patient, approved zadolženec, staff); staff write.
create policy "patient_facts select" on public.patient_facts for select to authenticated
  using (public.can_read_rehab(rehab_id));
create policy "patient_facts staff write" on public.patient_facts for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Plans: read with the rehabilitacija (the check-in needs it); only staff approve,
-- as themselves. No update or delete: a change is a new version.
create policy "patient_plans select" on public.patient_plans for select to authenticated
  using (public.can_read_rehab(rehab_id));
create policy "patient_plans staff insert" on public.patient_plans for insert to authenticated
  with check (public.is_staff() and approved_by = auth.uid());
