-- Normalizes spreadsheet-style values on quiz_questions before the existing
-- check constraints run, so uploads like "TenaBall", "Timer", "True Evergreen",
-- "Competition End" or "Needs Review" are stored as the canonical values.
-- Also trims question text and drops blank answer cells. Already applied.

create or replace function public.quiz_questions_normalize()
returns trigger
language plpgsql
as $$
declare
  canon text;
begin
  new.question_text := btrim(new.question_text);
  new.sport := lower(btrim(new.sport));

  canon := regexp_replace(lower(btrim(coalesce(new.game_type, ''))), '[\s-]+', '_', 'g');
  new.game_type := case
    when canon in ('tenable', 'tenaball') then 'tenable'
    when canon in ('against_the_clock', 'timer', 'clock') then 'against_the_clock'
    else nullif(canon, '')
  end;

  new.difficulty := nullif(lower(btrim(coalesce(new.difficulty, ''))), '');
  new.status := coalesce(nullif(regexp_replace(lower(btrim(coalesce(new.status, ''))), '[\s-]+', '_', 'g'), ''), 'draft');
  new.evergreen_type := nullif(regexp_replace(lower(btrim(coalesce(new.evergreen_type, ''))), '[\s-]+', '_', 'g'), '');
  new.review_frequency := nullif(regexp_replace(lower(btrim(coalesce(new.review_frequency, ''))), '[\s-]+', '_', 'g'), '');
  new.answers := coalesce(array(select btrim(a) from unnest(new.answers) a where btrim(coalesce(a, '')) <> ''), '{}');
  return new;
end;
$$;

drop trigger if exists quiz_questions_normalize on public.quiz_questions;
create trigger quiz_questions_normalize
before insert or update on public.quiz_questions
for each row execute function public.quiz_questions_normalize();
