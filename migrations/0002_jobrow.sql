-- Jobrow public ATS index. Unowned rows (auth off).
-- PGLite-safe: no extensions, no generated columns, text ids.

create table if not exists companies (
  id               text primary key,
  slug             text unique not null,
  name             text not null,
  ats              text not null check (ats in ('greenhouse', 'ashby', 'lever', 'workable', 'rippling', 'gem')),
  board_token      text not null,
  careers_url      text,
  website          text,
  logo_url         text,
  hq_country       text not null default 'US',
  enabled          boolean not null default true,
  last_crawled_at  timestamptz,
  last_ok_at       timestamptz,
  last_error       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists jobs (
  id                 text primary key,
  company_id         text not null references companies (id) on delete cascade,
  source_ats         text not null,
  source_id          text not null,
  title              text not null,
  slug               text not null,
  apply_url          text not null,
  location_raw       text,
  locations          text[] not null default '{}',
  workplace          text not null default 'unknown'
                     check (workplace in ('remote', 'hybrid', 'onsite', 'unknown')),
  salary_min_cents   int,
  salary_max_cents   int,
  salary_currency    text not null default 'USD',
  salary_source      text not null default 'none'
                     check (salary_source in ('posted', 'inferred', 'none')),
  yoe_min            int,
  function           text,
  seniority          text,
  skills             text[] not null default '{}',
  description_html   text,
  description_text   text,
  summary            text,
  posted_at          timestamptz,
  first_seen_at      timestamptz not null,
  last_seen_at       timestamptz not null,
  closed_at          timestamptz,
  status             text not null default 'open' check (status in ('open', 'closed')),
  us_eligible        boolean not null default true,
  tech_eligible      boolean not null default true,
  raw_json           text,
  search_text        text,
  unique (source_ats, source_id)
);

create index if not exists jobs_status_last_seen_idx
  on jobs (status, last_seen_at desc);
create index if not exists jobs_workplace_idx on jobs (workplace);
create index if not exists jobs_function_idx on jobs (function);
create index if not exists jobs_salary_min_idx on jobs (salary_min_cents);
create index if not exists jobs_company_id_idx on jobs (company_id);
create index if not exists jobs_open_public_idx
  on jobs (status, us_eligible, tech_eligible, last_seen_at desc);
create index if not exists jobs_title_idx on jobs (title);

create table if not exists crawl_runs (
  id              text primary key,
  started_at      timestamptz not null default now(),
  finished_at     timestamptz,
  shard           int,
  shard_of        int,
  companies_ok    int not null default 0,
  companies_fail  int not null default 0,
  jobs_upserted   int not null default 0,
  jobs_closed     int not null default 0,
  jobs_opened     int not null default 0,
  error_sample    text
);
