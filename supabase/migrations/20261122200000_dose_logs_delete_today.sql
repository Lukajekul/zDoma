-- T-93: a zadolženec (and anyone else who may log pills for this rehabilitacija:
-- the patient, a študent pomočnik, staff on a home visit) may uncheck any of today's
-- pills, also one someone else marked. Past days stay as they are. The existing
-- "dose_logs delete own" policy still applies; policies are combined with OR.

create policy "dose_logs delete today" on public.dose_logs for delete to authenticated
  using (public.can_log_rehab(rehab_id) and scheduled_date = public.today_lj());
