-- Študent pomočnik: medical students on their internship do simple home tasks
-- a family member would do (pill reminders, blood pressure, weight, watching
-- exercises), assigned by staff, approved by the patient. No nursing work.
--
-- profiles.student_until: last day of the internship. Set only by an admin
--   (service role) when the account is created; null = not a student.
--   Access ends automatically after this day.
-- student_assignments: one student per patient. Staff assign, the patient
--   approves or rejects. Only staff remove an assignment (delete).
-- student_reminders_sent: which visit reminders the scheduled job sent, so it
--   never sends one twice. Written only by the job (service role).

alter table public.profiles add column student_until date;

create table public.student_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  patient_id uuid not null references public.profiles (id) on delete cascade,
  assigned_by uuid not null default auth.uid() references public.profiles (id) on delete set null,
  status public.access_status not null default 'pending',
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  check (student_id <> patient_id)
);
-- One student per patient: at most one pending or approved assignment.
create unique index student_assignments_one_per_patient
  on public.student_assignments (patient_id) where status <> 'rejected';
create index on public.student_assignments (student_id);

create table public.student_reminders_sent (
  assignment_id uuid not null references public.student_assignments (id) on delete cascade,
  day date not null,
  slot public.time_of_day not null,
  kind text not null check (kind in ('prej', 'zamuda')),
  sent_at timestamptz not null default now(),
  primary key (assignment_id, day, slot, kind)
);

-- ============ Access helpers ============

-- The caller is a student whose internship has not ended.
create function public.is_active_student()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select p.student_until >= public.today_lj() from public.profiles p where p.id = auth.uid()
  ), false)
$$;

-- The caller is this patient's approved student helper, during the internship.
create function public.is_student_of(p_patient uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_active_student() and exists (
    select 1 from public.student_assignments s
    where s.patient_id = p_patient and s.student_id = auth.uid() and s.status = 'approved'
  )
$$;

-- Same as before, plus the approved student helper.
create or replace function public.can_read_rehab(p_rehab uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_staff() or exists (
    select 1 from public.rehabilitacije r
    where r.id = p_rehab
      and (r.patient_id = auth.uid() or public.is_carer_of(r.patient_id) or public.is_student_of(r.patient_id))
  )
$$;

create or replace function public.can_log_rehab(p_rehab uuid)
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
      and (
        r.patient_id = auth.uid() or public.is_carer_of(r.patient_id)
        or public.is_student_of(r.patient_id) or public.is_staff()
      )
  )
$$;

-- ============ Row-level security ============

alter table public.student_assignments enable row level security;
alter table public.student_reminders_sent enable row level security;

create policy "student assignments select" on public.student_assignments for select to authenticated
  using (student_id = auth.uid() or patient_id = auth.uid() or public.is_staff());
create policy "student assignments staff insert" on public.student_assignments for insert to authenticated
  with check (public.is_staff() and assigned_by = auth.uid() and status = 'pending');
-- The patient decides a pending assignment; nobody else changes it.
create policy "student assignments patient decide" on public.student_assignments for update to authenticated
  using (patient_id = auth.uid() and status = 'pending')
  with check (patient_id = auth.uid() and status in ('approved', 'rejected'));
create policy "student assignments staff remove" on public.student_assignments for delete to authenticated
  using (public.is_staff());
revoke update on public.student_assignments from authenticated, anon;
grant update (status, decided_at) on public.student_assignments to authenticated;

create policy "student reminders staff select" on public.student_reminders_sent for select to authenticated
  using (public.is_staff());

-- Profiles: the student sees the assigned patient (name, address, phone);
-- the patient sees who was assigned to them.
create policy "profiles student sees patient" on public.profiles for select to authenticated
  using (public.is_student_of(id));
create policy "profiles patient sees student" on public.profiles for select to authenticated
  using (exists (
    select 1 from public.student_assignments s
    where s.student_id = profiles.id and s.patient_id = auth.uid() and s.status <> 'rejected'
  ));

-- Less health data for students: no diagnosis codes, procedures or the
-- family's observations. They work from the medicines, exercises and check-in.
drop policy "patient_facts select" on public.patient_facts;
create policy "patient_facts select" on public.patient_facts for select to authenticated
  using (
    public.can_read_rehab(rehab_id)
    and not exists (
      select 1 from public.rehabilitacije r where r.id = rehab_id and public.is_student_of(r.patient_id)
    )
  );
drop policy "carer observations select" on public.carer_observations;
create policy "carer observations select" on public.carer_observations for select to authenticated
  using (
    public.can_read_rehab(rehab_id)
    and not exists (
      select 1 from public.rehabilitacije r where r.id = rehab_id and public.is_student_of(r.patient_id)
    )
  );
