-- T-47: deleting a patient failed with "Database error deleting user" when they had
-- log rows: the entered_by FK was checked before the rows were removed through
-- rehabilitacije → logs (on delete cascade). Checking it at commit lets the cascade finish.
-- Deleting a zadolženec who entered rows for someone else is still refused on purpose:
-- "Označila: Ana (hčerka)" is part of the patient's record.

alter table public.dose_logs alter constraint dose_logs_entered_by_fkey deferrable initially deferred;
alter table public.checkins alter constraint checkins_entered_by_fkey deferrable initially deferred;
alter table public.rehab_logs alter constraint rehab_logs_entered_by_fkey deferrable initially deferred;
