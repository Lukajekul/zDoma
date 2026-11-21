-- T-24: staff edits of template plan defaults (default length, pre-ticked
-- check-in questions, pre-ticked exercises and their repetitions). The
-- guideline-based template files stay the source of truth; this row only
-- overrides those defaults. Red-flag rules, thresholds and medicines can't be
-- changed here. Every save is also written to audit_log by the app.

create table public.template_overrides (
  template_id text primary key check (template_id in (
    'srcno-popuscanje', 'srce-po-infarktu', 'kolk-koleno', 'kopb', 'mozganska-kap', 'rak-sistemsko'
  )),
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.template_overrides enable row level security;

-- Staff only: read, create and change (all doctors can edit, AGENTS.md / T-24).
create policy "template_overrides staff select" on public.template_overrides for select to authenticated
  using (public.is_staff());
create policy "template_overrides staff insert" on public.template_overrides for insert to authenticated
  with check (public.is_staff() and updated_by = auth.uid());
create policy "template_overrides staff update" on public.template_overrides for update to authenticated
  using (public.is_staff())
  with check (public.is_staff() and updated_by = auth.uid());
