-- T-57: a patronažna sestra on a home visit does the check-in, pills and exercises
-- together with the patient. Staff may now log for an active rehabilitacija, saved
-- under their own name (entered_by = auth.uid() is still enforced by the insert policies).

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
      and (r.patient_id = auth.uid() or public.is_carer_of(r.patient_id) or public.is_staff())
  )
$$;
