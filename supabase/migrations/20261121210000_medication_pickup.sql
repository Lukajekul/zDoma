-- T-31: pharmacy pick-up per medicine (mock eRecept; in production from eRecept via CEZIH).
-- picked_up_at null = "ni prevzeto". Pack size from the pick-up is for T-32 (days left).

alter table public.medications
  add column picked_up_at date,
  add column pickup_pack_size int check (pickup_pack_size is null or pickup_pack_size > 0);

-- Alerts about one medicine (not picked up) point to it, so they can be closed
-- when it is picked up and are never raised twice.
alter table public.alerts
  add column medication_id uuid references public.medications (id) on delete cascade;

create unique index alerts_one_open_per_medication
  on public.alerts (medication_id)
  where state = 'odprto' and medication_id is not null;
