-- Public desk notes: corrections and board-inclusion requests.
-- Unowned rows (auth off). No resume files.

create table if not exists desk_notes (
  id            text primary key,
  kind          text not null check (kind in ('write', 'board_request')),
  name          text,
  email         text not null,
  topic         text,
  body          text,
  listing_url   text,
  company       text,
  ats           text,
  board_token   text,
  careers_url   text,
  website       text,
  country       text,
  created_at    timestamptz not null default now()
);

create index if not exists desk_notes_created_idx on desk_notes (created_at desc);
create index if not exists desk_notes_kind_idx on desk_notes (kind, created_at desc);
