-- Rate-card waitlist notes share desk_notes.
alter table desk_notes drop constraint if exists desk_notes_kind_check;
alter table desk_notes add constraint desk_notes_kind_check
  check (kind in ('write', 'board_request', 'bound_pass', 'placement'));
