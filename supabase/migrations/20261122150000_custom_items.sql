-- T-69: doctors' own check-in questions and exercises.
-- Template-level ones live in template_overrides.data (JSON, no schema change).
-- Per patient, the rehabilitacija keeps its own copy at discharge, so later
-- template edits never change a running plan:
--   - rehabilitacije.custom_questions: array of question definitions
--     ({id, besedilo, odgovori[{id, besedilo}], opozorilo?: {odgovor, razlog}}),
--     their ids are also listed in rehabilitacije.questions;
--   - rehab_exercises.steps: the steps of an exercise that isn't in a template file.
-- Both tables already have RLS on; the existing policies (staff write, patient,
-- approved family and staff read) cover the new columns.

alter table public.rehabilitacije
  add column custom_questions jsonb not null default '[]'::jsonb
  check (jsonb_typeof(custom_questions) = 'array');

alter table public.rehab_exercises
  add column steps text[]
  check (steps is null or cardinality(steps) between 1 and 4);
