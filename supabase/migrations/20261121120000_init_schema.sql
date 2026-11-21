-- T-03: initial schema for zDoma (AGENTS.md §6, §9). Mirrors src/lib/types.ts.

-- ============ Enums ============
create type public.rehab_status as enum ('aktivna', 'zakljucena');
create type public.triage_status as enum ('zeleno', 'rumeno', 'rdece');
create type public.access_status as enum ('pending', 'approved', 'rejected');
create type public.dose_status as enum ('vzeto', 'izpusceno');
create type public.time_of_day as enum ('zjutraj', 'opoldne', 'zvecer', 'ponoci');
create type public.medication_change as enum ('novo', 'spremenjeno', 'nespremenjeno', 'ukinjeno');
create type public.alert_state as enum ('odprto', 'zaprto');
create type public.alert_source as enum ('checkin', 'zdravila', 'brez_pregleda', 'drugo');

-- ============ Helpers without table deps ============

-- Davčna številka: 8 digits, check digit per AGENTS.md §6.
create function public.valid_davcna(d text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  s int := 0;
  r int;
begin
  if d is null or d !~ '^[0-9]{8}$' then
    return false;
  end if;
  for i in 1..7 loop
    s := s + substr(d, i, 1)::int * (9 - i);
  end loop;
  r := 11 - (s % 11);
  if r = 11 then
    return false;
  end if;
  if r = 10 then
    r := 0;
  end if;
  return r = substr(d, 8, 1)::int;
end;
$$;

create function public.today_lj()
returns date
language sql
stable
set search_path = ''
as $$ select (now() at time zone 'Europe/Ljubljana')::date $$;

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ============ Tables ============

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  davcna text not null unique check (public.valid_davcna(davcna)),
  first_name text not null default '',
  last_name text not null default '',
  is_staff boolean not null default false,
  address text,
  obcina text,
  naselje text,
  phone text,
  photo_url text,
  checkin_time time not null default '08:00',
  created_at timestamptz not null default now()
);

create table public.rehabilitacije (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  template_id text not null check (template_id in (
    'srcno-popuscanje', 'srce-po-infarktu', 'kolk-koleno', 'kopb', 'mozganska-kap', 'rak-sistemsko'
  )),
  diagnosis text,
  status public.rehab_status not null default 'aktivna',
  start_date date not null default public.today_lj(),
  end_date date not null,
  created_by uuid references public.profiles (id) on delete set null,
  assigned_nurse_id uuid references public.profiles (id) on delete set null,
  questions text[] not null default '{}',
  patient_values jsonb not null default '{}',
  lace jsonb,
  current_status public.triage_status not null default 'zeleno',
  installed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);
create index on public.rehabilitacije (patient_id);
create index on public.rehabilitacije (assigned_nurse_id);
create trigger rehabilitacije_updated_at before update on public.rehabilitacije
  for each row execute function public.set_updated_at();

create table public.tereni (
  id uuid primary key default gen_random_uuid(),
  nurse_id uuid not null references public.profiles (id) on delete cascade,
  obcina text not null,
  naselja text[],
  postcodes text[]
);
create index on public.tereni (obcina);

create table public.nadomescanje (
  id uuid primary key default gen_random_uuid(),
  nurse_id uuid not null references public.profiles (id) on delete cascade,
  substitute_id uuid not null references public.profiles (id) on delete cascade,
  until_date date not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check (nurse_id <> substitute_id)
);

create table public.family_access (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  status public.access_status not null default 'pending',
  relation text,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  unique (requester_id, patient_id),
  check (requester_id <> patient_id)
);
create index on public.family_access (patient_id);

create table public.medications (
  id uuid primary key default gen_random_uuid(),
  rehab_id uuid not null references public.rehabilitacije (id) on delete cascade,
  name text not null,
  active_substance text,
  dose text not null,
  times public.time_of_day[] not null default '{}',
  purpose text,
  change public.medication_change not null default 'novo',
  previous_dose text,
  photo_url text,
  start_date date not null default public.today_lj(),
  end_date date,
  created_at timestamptz not null default now()
);
create index on public.medications (rehab_id);

create table public.dose_logs (
  id uuid primary key default gen_random_uuid(),
  medication_id uuid not null references public.medications (id) on delete cascade,
  rehab_id uuid not null references public.rehabilitacije (id) on delete cascade,
  scheduled_date date not null default public.today_lj(),
  time_of_day public.time_of_day not null,
  status public.dose_status not null,
  entered_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (medication_id, scheduled_date, time_of_day)
);
create index on public.dose_logs (rehab_id, scheduled_date);

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  rehab_id uuid not null references public.rehabilitacije (id) on delete cascade,
  checkin_date date not null default public.today_lj(),
  answers jsonb not null default '{}',
  same_as_yesterday boolean not null default false,
  triage_status public.triage_status not null default 'zeleno',
  reasons text[] not null default '{}',
  photo_path text,
  entered_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (rehab_id, checkin_date)
);

create table public.rehab_exercises (
  id uuid primary key default gen_random_uuid(),
  rehab_id uuid not null references public.rehabilitacije (id) on delete cascade,
  exercise_id text not null,
  title text not null,
  repetitions text,
  times_per_day int not null default 1 check (times_per_day > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.rehab_exercises (rehab_id);

create table public.rehab_logs (
  id uuid primary key default gen_random_uuid(),
  rehab_exercise_id uuid not null references public.rehab_exercises (id) on delete cascade,
  rehab_id uuid not null references public.rehabilitacije (id) on delete cascade,
  log_date date not null default public.today_lj(),
  done boolean not null,
  pain smallint check (pain between 0 and 10),
  entered_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now()
);
create index on public.rehab_logs (rehab_id, log_date);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  rehab_id uuid not null references public.rehabilitacije (id) on delete cascade,
  checkin_id uuid references public.checkins (id) on delete set null,
  status public.triage_status not null check (status <> 'zeleno'),
  reason text not null check (length(reason) > 0),
  source public.alert_source not null default 'checkin',
  state public.alert_state not null default 'odprto',
  action text,
  resolved_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.alerts (rehab_id, state);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid default auth.uid() references public.profiles (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ============ Access helpers (security definer, bypass RLS to avoid recursion) ============

create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select p.is_staff from public.profiles p where p.id = auth.uid()), false)
$$;

-- The caller is an approved zadolženec of this patient.
create function public.is_carer_of(p_patient uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.family_access f
    where f.patient_id = p_patient and f.requester_id = auth.uid() and f.status = 'approved'
  )
$$;

-- Staff, the patient, or an approved zadolženec may read this rehabilitacija's data.
create function public.can_read_rehab(p_rehab uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_staff() or exists (
    select 1 from public.rehabilitacije r
    where r.id = p_rehab
      and (r.patient_id = auth.uid() or public.is_carer_of(r.patient_id))
  )
$$;

-- The patient or an approved zadolženec may log for an active rehabilitacija.
create function public.can_log_rehab(p_rehab uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.rehabilitacije r
    where r.id = p_rehab
      and r.status = 'aktivna'
      and public.today_lj() <= r.end_date
      and (r.patient_id = auth.uid() or public.is_carer_of(r.patient_id))
  )
$$;

-- ============ Profile on sign-up ============

-- davcna comes from the internal email `<davcna>@zdoma.local`, never from metadata.
-- is_staff is never set here; staff are marked by seed/admin with the service role.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email like '%@zdoma.local' then
    insert into public.profiles (id, davcna, first_name, last_name)
    values (
      new.id,
      split_part(new.email, '@', 1),
      coalesce(new.raw_user_meta_data ->> 'first_name', ''),
      coalesce(new.raw_user_meta_data ->> 'last_name', '')
    );
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ Family access request (never reveals whether the number exists) ============

create function public.request_family_access(p_davcna text, p_relation text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_patient uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  select id into v_patient from public.profiles where davcna = p_davcna;
  if v_patient is null or v_patient = auth.uid() then
    return;
  end if;
  insert into public.family_access (requester_id, patient_id, relation)
  values (auth.uid(), v_patient, nullif(trim(p_relation), ''))
  on conflict (requester_id, patient_id) do update
    set status = 'pending', relation = excluded.relation, decided_at = null, created_at = now()
    where public.family_access.status = 'rejected';
end;
$$;
revoke execute on function public.request_family_access(text, text) from public, anon;
grant execute on function public.request_family_access(text, text) to authenticated;

-- ============ Staff directory (names only, for "Vaša patronažna sestra: …") ============

create view public.staff_directory as
  select id, first_name, last_name, photo_url from public.profiles where is_staff;
revoke all on public.staff_directory from public, anon;
grant select on public.staff_directory to authenticated;

-- ============ Row-level security ============

alter table public.profiles enable row level security;
alter table public.rehabilitacije enable row level security;
alter table public.tereni enable row level security;
alter table public.nadomescanje enable row level security;
alter table public.family_access enable row level security;
alter table public.medications enable row level security;
alter table public.dose_logs enable row level security;
alter table public.checkins enable row level security;
alter table public.rehab_exercises enable row level security;
alter table public.rehab_logs enable row level security;
alter table public.alerts enable row level security;
alter table public.audit_log enable row level security;

-- profiles: own, staff all, an approved zadolženec sees the patient,
-- a patient sees who asked to follow them.
create policy "profiles select" on public.profiles for select to authenticated using (
  id = auth.uid()
  or public.is_staff()
  or public.is_carer_of(id)
  or exists (
    select 1 from public.family_access f
    where f.requester_id = profiles.id and f.patient_id = auth.uid() and f.status <> 'rejected'
  )
);
create policy "profiles update" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_staff())
  with check (id = auth.uid() or public.is_staff());
-- Clients may never change davcna or is_staff.
revoke update on public.profiles from authenticated, anon;
grant update (first_name, last_name, address, obcina, naselje, phone, photo_url, checkin_time)
  on public.profiles to authenticated;

-- rehabilitacije: read if allowed, write staff only.
create policy "rehab select" on public.rehabilitacije for select to authenticated
  using (public.can_read_rehab(id));
create policy "rehab insert" on public.rehabilitacije for insert to authenticated
  with check (public.is_staff());
create policy "rehab update" on public.rehabilitacije for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- tereni, nadomescanje: staff only.
create policy "tereni staff" on public.tereni for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "nadomescanje staff" on public.nadomescanje for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- family_access: requests go through request_family_access(); the patient decides or removes.
create policy "family select" on public.family_access for select to authenticated
  using (requester_id = auth.uid() or patient_id = auth.uid() or public.is_staff());
create policy "family decide" on public.family_access for update to authenticated
  using (patient_id = auth.uid()) with check (patient_id = auth.uid());
create policy "family remove" on public.family_access for delete to authenticated
  using (patient_id = auth.uid() or requester_id = auth.uid());
revoke update on public.family_access from authenticated, anon;
grant update (status, decided_at) on public.family_access to authenticated;

-- medications, rehab_exercises: read if allowed, write staff only.
create policy "medications select" on public.medications for select to authenticated
  using (public.can_read_rehab(rehab_id));
create policy "medications staff write" on public.medications for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy "exercises select" on public.rehab_exercises for select to authenticated
  using (public.can_read_rehab(rehab_id));
create policy "exercises staff write" on public.rehab_exercises for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- dose_logs, rehab_logs: patient or approved zadolženec inserts as self; undo only own entries.
create policy "dose_logs select" on public.dose_logs for select to authenticated
  using (public.can_read_rehab(rehab_id));
create policy "dose_logs insert" on public.dose_logs for insert to authenticated
  with check (
    entered_by = auth.uid()
    and public.can_log_rehab(rehab_id)
    and exists (select 1 from public.medications m where m.id = medication_id and m.rehab_id = dose_logs.rehab_id)
  );
create policy "dose_logs delete own" on public.dose_logs for delete to authenticated
  using (entered_by = auth.uid());

create policy "rehab_logs select" on public.rehab_logs for select to authenticated
  using (public.can_read_rehab(rehab_id));
create policy "rehab_logs insert" on public.rehab_logs for insert to authenticated
  with check (
    entered_by = auth.uid()
    and public.can_log_rehab(rehab_id)
    and exists (select 1 from public.rehab_exercises x where x.id = rehab_exercise_id and x.rehab_id = rehab_logs.rehab_id)
  );
create policy "rehab_logs delete own" on public.rehab_logs for delete to authenticated
  using (entered_by = auth.uid());

-- checkins: insert as self, never edited by clients.
create policy "checkins select" on public.checkins for select to authenticated
  using (public.can_read_rehab(rehab_id));
create policy "checkins insert" on public.checkins for insert to authenticated
  with check (entered_by = auth.uid() and public.can_log_rehab(rehab_id));

-- alerts: readable with the rehab; raised by triage when the patient/zadolženec saves, or by staff;
-- only staff resolve them.
create policy "alerts select" on public.alerts for select to authenticated
  using (public.can_read_rehab(rehab_id));
create policy "alerts insert" on public.alerts for insert to authenticated
  with check (public.is_staff() or (state = 'odprto' and public.can_log_rehab(rehab_id)));
create policy "alerts update" on public.alerts for update to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- audit_log: append-only, written as self, read by staff.
create policy "audit insert" on public.audit_log for insert to authenticated
  with check (actor_id = auth.uid());
create policy "audit select" on public.audit_log for select to authenticated
  using (public.is_staff());

-- Keep the patient's dashboard status in sync with their latest check-in.
create function public.checkin_sets_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.rehabilitacije set current_status = new.triage_status where id = new.rehab_id;
  return new;
end;
$$;
create trigger checkins_set_status after insert on public.checkins
  for each row execute function public.checkin_sets_status();

-- ============ Storage: wound photos, path `<rehab_id>/<file>` ============

insert into storage.buckets (id, name, public) values ('wound-photos', 'wound-photos', false)
  on conflict (id) do nothing;

create policy "wound photos read" on storage.objects for select to authenticated using (
  bucket_id = 'wound-photos'
  and public.can_read_rehab(((storage.foldername(name))[1])::uuid)
);
create policy "wound photos upload" on storage.objects for insert to authenticated with check (
  bucket_id = 'wound-photos'
  and public.can_log_rehab(((storage.foldername(name))[1])::uuid)
);

-- ============ Realtime for the live nurse dashboard ============

alter publication supabase_realtime add table public.rehabilitacije, public.alerts, public.checkins;
