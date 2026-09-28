-- Leashh Pet Nanny applications
-- Target: Supabase Postgres, EU region (London or Frankfurt). UK personal data.
--
-- Built against leashh-wizard-screens (1).html, wizard v2.0, 25 September 2026.
-- Where that document gives a build note, it is quoted in the comment above the thing it governs.
--
-- Shape: flat, predictably named columns on the applicant, child rows only where a value
-- genuinely carries its own data (a service carries a price, a declaration carries the wording
-- version it was agreed against). No JSON blob for the answers, because this is destined for
-- Salesforce.

begin;

-- ---------------------------------------------------------------------------
-- 1 · State
-- ---------------------------------------------------------------------------

-- "Keep the two states separate in the database and never treat verification as permission."
-- pending_verification -> the record exists, nothing has been agreed
-- verified             -> the email address is real
-- consented            -> the declarations are in. ONLY these may be exported.
create type applicant_status as enum ('pending_verification', 'verified', 'consented');

-- ---------------------------------------------------------------------------
-- 2 · Reference data
-- ---------------------------------------------------------------------------

-- "Rate data should be live. The ranges are market estimates. Once there is real supply-side
--  data, serve them from the database by postcode rather than hardcoding them."
-- The ranges live here so that change is a data change, not a deploy.
create table services (
  key              text primary key,
  name             text        not null,
  description      text        not null,
  unit             text        not null,          -- fixed per service, never chosen by the user
  typical_low      numeric(8,2) not null,
  typical_high     numeric(8,2) not null,
  requires_licence boolean     not null default false,
  sort_order       smallint    not null
);

comment on column services.unit is
  'Fixed per service. The applicant never picks it.';
comment on column services.typical_low is
  'A hint shown to the applicant, never a floor. Do not clamp what they enter.';

insert into services (key, name, description, unit, typical_low, typical_high, requires_licence, sort_order) values
  ('walk',   'Dog walking',           'Solo or small group walks, thirty to sixty minutes.',      'an hour',   14, 18, false, 1),
  ('dropin', 'Drop-in visits',        'Feeding, fresh water, a bit of fuss and a photo home.',    'a visit',   12, 16, false, 2),
  ('board',  'Home boarding',         'The pet stays at yours overnight. Licence required.',      'a night',   28, 45, true,  3),
  ('house',  'House sitting',         'You stay at theirs, so the pet never leaves home.',        'a night',   40, 65, false, 4),
  ('bath',   'Pet bathing',           'Wash, dry and brush out, at your place or theirs.',        'a session', 20, 35, false, 5),
  ('taxi',   'Pet taxi',              'Lifts to the vet, the groomer or the kennels.',            'a journey', 15, 30, false, 6),
  ('friend', 'Pet friend and play',   'Company and enrichment for pets who hate being alone.',    'an hour',   12, 16, false, 7),
  ('puppy',  'Puppy and kitten care', 'Toilet breaks, socialising, settling a new arrival.',      'a visit',   14, 20, false, 8);

-- The multi-select chip vocabularies. Held as data so the wizard and the export agree on the
-- allowed values and their labels.
create table chip_options (
  group_key  text     not null check (group_key in ('animal', 'attribute', 'credential')),
  key        text     not null,
  label      text     not null,
  sort_order smallint not null,
  primary key (group_key, key)
);

insert into chip_options (group_key, key, label, sort_order) values
  ('animal', 'small_dogs',        'Small dogs',              1),
  ('animal', 'large_dogs',        'Large dogs',              2),
  ('animal', 'puppies',           'Puppies',                 3),
  ('animal', 'cats',              'Cats',                    4),
  ('animal', 'small_pets',        'Rabbits and small pets',  5),
  ('animal', 'birds',             'Birds',                   6),
  ('animal', 'reptiles',          'Reptiles',                7),
  ('animal', 'senior_pets',       'Senior pets',             8),
  ('animal', 'medication',        'Pets needing medication', 9),
  ('attribute', 'enclosed_garden','Enclosed garden',         1),
  ('attribute', 'car',            'Car for pet taxi',        2),
  ('attribute', 'no_other_pets',  'No other pets at home',   3),
  ('attribute', 'home_all_day',   'Home most of the day',    4),
  ('attribute', 'early_mornings', 'Happy with early mornings',5),
  ('attribute', 'weekends_only',  'Weekends only',           6),
  ('credential', 'council_licence','Council animal activity licence',      1),
  ('credential', 'public_liability','Public liability insurance',          2),
  ('credential', 'dbs',            'DBS or Disclosure Scotland',           3),
  ('credential', 'canine_first_aid','Canine first aid',                    4),
  ('credential', 'grooming',       'Grooming qualification',               5),
  ('credential', 'veterinary',     'Veterinary or nursing qualification',  6),
  ('credential', 'none_yet',       'None of these yet',                    7);

comment on table chip_options is
  'Multi-select vocabularies. "none_yet" is exclusive: ticking it deselects the other credentials.';

-- ---------------------------------------------------------------------------
-- 3 · Versioned declaration wording
-- ---------------------------------------------------------------------------

-- "This screen is the compliance surface. If the transfer is ever challenged, this is the screen
--  produced in evidence. Version it and keep a rendered copy of every wording change."
-- The wording lives here, so a stored agreement can always be resolved back to the exact text
-- that was on screen at the time. The client's final copy drops in as a new version with no
-- schema change.
create table declaration_texts (
  key            text        not null,
  version        integer     not null,
  kind           text        not null check (kind in ('declaration', 'consent')),
  body           text        not null,
  effective_from timestamptz not null default now(),
  primary key (key, version)
);

comment on column declaration_texts.kind is
  'declaration = mandatory, resting on contract necessity. consent = optional and withdrawable. '
  'Never relabel a declaration as consent: that would make the transfer unwindable after the fact.';

insert into declaration_texts (key, version, kind, body) values
  ('age_uk', 1, 'declaration',
   'I am 18 or over and I live in the United Kingdom.'),
  ('accurate', 1, 'declaration',
   'The information I have given is accurate and my own. I understand that Leashh has not checked it, and that giving false information may mean my application is rejected.'),
  ('onward_transfer', 1, 'declaration',
   'I agree that Leashh may pass my details to a pet services company that operates the Pet Nanny network, and that this company may contact me directly about becoming a Pet Nanny.'),
  ('identity_checks', 1, 'declaration',
   'I understand that company will verify my identity and ask me for documents as part of its own onboarding, which may include a background check, and that it decides whether to approve me.'),
  ('self_employed', 1, 'declaration',
   'I understand I would be working on a self-employed basis. Leashh does not employ me, does not set my hours or rates, does not arrange or book work, and does not take a share of what I earn. I am responsible for my own tax and National Insurance.'),
  ('licences', 1, 'declaration',
   'I will hold any licence, insurance or registration the law requires before I carry out any service, including a council animal activity licence if I board or day care animals at my home.'),
  ('terms_privacy', 1, 'declaration',
   'I have read and agree to the Pet Nanny Terms and I have read the Privacy Notice.'),
  ('marketing_email', 1, 'consent',
   'Email me tips on getting my first enquiries, and news about Leashh.'),
  ('marketing_sms', 1, 'consent',
   'Send me text messages about my application and about work in my area.');

-- ---------------------------------------------------------------------------
-- 4 · The applicant
-- ---------------------------------------------------------------------------

create table applicants (
  id         uuid primary key default gen_random_uuid(),
  reference  text unique,                                  -- LSH-XXXXX, issued on submit
  status     applicant_status not null default 'pending_verification',

  -- step 1. "No ID, no date of birth and no address here. Four fields only,
  --          which is what makes the step convert."
  first_name text not null check (length(btrim(first_name)) > 0),
  last_name  text not null check (length(btrim(last_name))  > 0),
  email      text not null check (email = lower(email) and email like '%_@_%.__%'),
  mobile     text not null,                                -- 07 or +44, spaces and brackets stripped

  -- step 3. Postcode only. "Leashh has no reason to hold a street address, and the affiliate
  --          can collect it at onboarding."
  postcode      text,
  date_of_birth date,                                      -- self-declared, backs up the age declaration
  experience    text check (experience in (
                  'Owned pets, no paid experience yet','Under 1 year of paid experience',
                  '1 to 3 years','3 to 5 years','Over 5 years',
                  'Professional background, for example veterinary nursing or grooming')),
  hours_a_week  text check (hours_a_week in (
                  'Up to 5 hours','5 to 10 hours','10 to 20 hours','20 to 30 hours','Over 30 hours')),
  bio           text check (bio is null or length(btrim(bio)) >= 80),
  animals       text[] not null default '{}',
  attributes    text[] not null default '{}',
  credentials   text[] not null default '{}',
  travel_miles  smallint check (travel_miles between 1 and 20),

  -- evidence and lifecycle
  created_ip   inet,
  consent_ip   inet,
  verified_at  timestamptz,
  consented_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- a record cannot claim a state it has no timestamp for
  constraint verified_has_timestamp
    check (status = 'pending_verification' or verified_at is not null),
  constraint consented_has_timestamp
    check (status <> 'consented' or (consented_at is not null and reference is not null))
);

-- "A duplicate email resumes the existing record and re-sends a code rather than creating a
--  second one." That resume is only possible if the address is unique.
create unique index applicants_email_key on applicants (email);
-- "Rate limit record creation by IP. This endpoint is the obvious spam target."
create index applicants_created_ip_idx on applicants (created_ip, created_at desc);
create index applicants_status_idx      on applicants (status);

comment on column applicants.date_of_birth is
  'Self-declared and checked against nothing. It backs up the 18-or-over declaration. '
  'v2.0 deliberately dropped the hard under-18 gate that v1.0 required.';
comment on column applicants.bio is
  'Free text, and a moderation risk. Applicants put phone numbers, addresses and complaints here. '
  'Screen it before anything reaches the affiliate or a public profile.';

-- ---------------------------------------------------------------------------
-- 5 · Services offered, with the applicant's own price
-- ---------------------------------------------------------------------------

create table applicant_services (
  applicant_id uuid not null references applicants (id) on delete cascade,
  service_key  text not null references services (key),
  -- "The typical range is a hint, not a constraint. Do not clamp what the applicant enters."
  price        numeric(8,2) not null check (price > 0),
  primary key (applicant_id, service_key)
);

comment on table applicant_services is
  'At least one row with a price above zero is required before an applicant may submit. '
  'Enforced in the submit endpoint, since the rule spans rows.';

-- ---------------------------------------------------------------------------
-- 6 · Declarations, each with its own wording version and server timestamp
-- ---------------------------------------------------------------------------

-- "Store each declaration as its own boolean with the wording version and a server timestamp.
--  One 'accepted terms' flag is not enough evidence."
create table applicant_declarations (
  applicant_id uuid    not null references applicants (id) on delete cascade,
  key          text    not null,
  version      integer not null,
  accepted     boolean not null,
  accepted_at  timestamptz not null default now(),   -- server clock, never the browser's
  withdrawn_at timestamptz,                          -- consents only, and independently
  primary key (applicant_id, key),
  foreign key (key, version) references declaration_texts (key, version),
  constraint only_consents_withdraw
    check (withdrawn_at is null or accepted)
);

-- ---------------------------------------------------------------------------
-- 7 · Email verification
-- ---------------------------------------------------------------------------

-- "The code is generated server side, stored as a hash, expires in 15 minutes, and is rate
--  limited on both send and attempt." Lockout after five failures requires a fresh code, and
--  "resending invalidates the previous code".
create table verification_codes (
  id             uuid primary key default gen_random_uuid(),
  applicant_id   uuid not null references applicants (id) on delete cascade,
  code_hash      text not null,                       -- never the code itself
  expires_at     timestamptz not null,
  attempts       smallint not null default 0,
  consumed_at    timestamptz,
  invalidated_at timestamptz,                         -- set when a newer code is issued
  created_at     timestamptz not null default now(),
  constraint attempts_capped check (attempts between 0 and 5)
);

-- at most one code live per applicant at any moment
create unique index verification_codes_live
  on verification_codes (applicant_id)
  where consumed_at is null and invalidated_at is null;

create index verification_codes_sent_idx on verification_codes (applicant_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 8 · updated_at
-- ---------------------------------------------------------------------------

create function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applicants_touch
  before update on applicants
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------------------------
-- 9 · Export
-- ---------------------------------------------------------------------------

-- "Only on submit does the record become eligible for transfer. Set a distinct status such as
--  consented and make that the gate on the export."
-- Unconsented records "must never reach the affiliate and must never be marketed to".
--
-- One row per applicant, flat, ready for Salesforce. Multi-selects are semicolon joined, which
-- is what a Salesforce multi-select picklist expects. Every declaration is its own column.
create view applicant_export as
select
  a.reference,
  a.first_name,
  a.last_name,
  a.email,
  a.mobile,
  a.date_of_birth,
  a.postcode,
  a.experience,
  a.hours_a_week,
  a.travel_miles,
  a.bio,
  (select string_agg(c.label, '; ' order by c.sort_order)
     from chip_options c where c.group_key = 'animal'     and c.key = any (a.animals))     as animals,
  (select string_agg(c.label, '; ' order by c.sort_order)
     from chip_options c where c.group_key = 'attribute'  and c.key = any (a.attributes))  as attributes,
  (select string_agg(c.label, '; ' order by c.sort_order)
     from chip_options c where c.group_key = 'credential' and c.key = any (a.credentials)) as credentials,
  (select string_agg(s.name || ' at ' || to_char(x.price, 'FM£999990.00') || ' ' || s.unit, '; ' order by s.sort_order)
     from applicant_services x join services s on s.key = x.service_key
    where x.applicant_id = a.id)                                                           as services,
  d.age_uk,
  d.accurate,
  d.onward_transfer,
  d.identity_checks,
  d.self_employed,
  d.licences,
  d.terms_privacy,
  d.marketing_email,
  d.marketing_sms,
  d.declarations_version,
  a.verified_at,
  a.consented_at,
  a.created_at
from applicants a
left join lateral (
  select
    bool_or(key = 'age_uk'          and accepted and withdrawn_at is null) as age_uk,
    bool_or(key = 'accurate'        and accepted and withdrawn_at is null) as accurate,
    bool_or(key = 'onward_transfer' and accepted and withdrawn_at is null) as onward_transfer,
    bool_or(key = 'identity_checks' and accepted and withdrawn_at is null) as identity_checks,
    bool_or(key = 'self_employed'   and accepted and withdrawn_at is null) as self_employed,
    bool_or(key = 'licences'        and accepted and withdrawn_at is null) as licences,
    bool_or(key = 'terms_privacy'   and accepted and withdrawn_at is null) as terms_privacy,
    bool_or(key = 'marketing_email' and accepted and withdrawn_at is null) as marketing_email,
    bool_or(key = 'marketing_sms'   and accepted and withdrawn_at is null) as marketing_sms,
    max(version)                                                           as declarations_version
  from applicant_declarations ad where ad.applicant_id = a.id
) d on true
where a.status = 'consented';

comment on view applicant_export is
  'The ONLY thing the CSV export may read. Gated on status = consented.';

-- ---------------------------------------------------------------------------
-- 10 · Retention
-- ---------------------------------------------------------------------------

-- "If someone abandons after this step you hold their name, mobile and email, but they have not
--  seen the disclosure or agreed to anything. Those records must never reach the affiliate and
--  must never be marketed to. Flag them by status and delete them on a timer."
create function purge_unconsented(older_than interval default interval '30 days')
returns integer language plpgsql as $$
declare
  removed integer;
begin
  delete from applicants
   where status <> 'consented'
     and created_at < now() - older_than;
  get diagnostics removed = row_count;
  return removed;
end;
$$;

comment on function purge_unconsented is
  'Schedule daily, for example with pg_cron. The privacy notice commits to this, so it is a job '
  'somebody has to run, not a policy statement. Child rows cascade.';

-- ---------------------------------------------------------------------------
-- 11 · Row level security
-- ---------------------------------------------------------------------------

-- Every write goes through a server route using the service role, which bypasses RLS.
-- No policies are defined, so anon and authenticated can read and write nothing.
-- The public form must never hold database credentials.
alter table applicants             enable row level security;
alter table applicant_services     enable row level security;
alter table applicant_declarations enable row level security;
alter table verification_codes     enable row level security;
alter table services               enable row level security;
alter table chip_options           enable row level security;
alter table declaration_texts      enable row level security;

commit;
