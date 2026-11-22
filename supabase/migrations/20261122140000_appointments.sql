-- T-64: kontrolni pregled. At a check-up the doctor sets the next appointment; the patient,
-- approved zadolženci and staff (incl. the patronažna sestra) all see it.
-- Date and time are stored as local Europe/Ljubljana values, like the rest of the app's "today".

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  rehab_id uuid not null references public.rehabilitacije (id) on delete cascade,
  appt_date date not null,
  appt_time time not null,
  place text not null check (length(trim(place)) > 0),
  doctor text,
  note text,
  status text not null default 'nacrtovano' check (status in ('nacrtovano', 'opravljeno', 'preklicano')),
  created_by uuid default auth.uid() references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.appointments (rehab_id, appt_date);
create trigger appointments_updated_at before update on public.appointments
  for each row execute function public.set_updated_at();

alter table public.appointments enable row level security;

-- Read with the rehabilitacija (patient, approved zadolženec, staff); only staff write.
create policy "appointments select" on public.appointments for select to authenticated
  using (public.can_read_rehab(rehab_id));
create policy "appointments staff write" on public.appointments for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
