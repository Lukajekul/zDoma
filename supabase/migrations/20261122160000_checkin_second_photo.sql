-- T-72: up to two wound photos per check-in. Existing rows keep their single
-- photo in photo_path; the optional second one goes in photo_path_2.
-- Covered by the existing checkins RLS policies and the wound-photos storage policies.

alter table public.checkins add column photo_path_2 text;

alter table public.checkins add constraint checkins_photo_path_2_needs_first
  check (photo_path_2 is null or photo_path is not null);
