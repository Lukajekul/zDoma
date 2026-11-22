-- T-98: the občine a študent pomočnik covers, so the patronažna sestra can
-- assign students near their patients ("Razporedi študente"). Set by an admin
-- (service role) with the internship; empty = covers nowhere in particular.
alter table public.profiles add column student_obcine text[] not null default '{}';
