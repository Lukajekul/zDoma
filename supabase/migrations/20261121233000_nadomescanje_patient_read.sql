-- T-49: a patient (and their approved zadolženec) may read the nadomeščanje of
-- the patronažna sestra assigned to one of their rehabilitacije, so "Danes" can
-- say who visits them while she is away. Read only; staff policy unchanged.
create policy "nadomescanje patient read" on public.nadomescanje
  for select to authenticated
  using (
    exists (
      select 1 from public.rehabilitacije r
      where r.assigned_nurse_id = nadomescanje.nurse_id
        and public.can_read_rehab(r.id)
    )
  );
