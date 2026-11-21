-- T-39: Web Push subscriptions and the daily check-in reminder log.

-- One row per browser/device that allowed notifications.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;
create policy "push own select" on public.push_subscriptions for select to authenticated
  using (user_id = auth.uid());
create policy "push own insert" on public.push_subscriptions for insert to authenticated
  with check (user_id = auth.uid());
create policy "push own delete" on public.push_subscriptions for delete to authenticated
  using (user_id = auth.uid());

-- Which reminder steps were sent for a rehabilitacija on a day, so the
-- scheduled job never sends one twice. Written only by the job (service role).
create table public.reminders_sent (
  rehab_id uuid not null references public.rehabilitacije (id) on delete cascade,
  day date not null,
  kind text not null check (kind in ('prvi', 'drugi', 'zadolzenec')),
  sent_at timestamptz not null default now(),
  primary key (rehab_id, day, kind)
);

alter table public.reminders_sent enable row level security;
-- Staff may read it (e.g. "Opomnjen ob 8:00, 10:00"); no client writes.
create policy "reminders staff select" on public.reminders_sent for select to authenticated
  using (public.is_staff());
