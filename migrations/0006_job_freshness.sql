-- Reclaim storage by not rewriting every job row on every crawl.
--
-- The crawler used to upsert all ~6,000 listings four times a day, and every
-- upsert rewrote the row's large text columns (description_html,
-- description_text, raw_json, search_text). Each rewrite minted a fresh set of
-- TOAST chunks plus index tuples, so the project's storage grew far faster than
-- the posting data it actually holds.
--
-- 1) content_hash fingerprints the stored posting. The crawler now skips a row
--    entirely when the fingerprint is unchanged, so the description text is only
--    re-TOASTed when the employer actually edits the posting. Existing rows are
--    left NULL on purpose: the next crawl fills them in, which costs one last
--    full pass and then stops.
-- 2) Neither replacement index contains last_seen_at, which the crawler bumps on
--    every run for every still-listed role. Dropping it from the indexes makes
--    those updates HOT - no new index tuples, and the dead tuples are pruned at
--    page level instead of waiting on a full vacuum pass.

alter table jobs add column if not exists content_hash text;

drop index if exists jobs_status_last_seen_idx;
drop index if exists jobs_open_public_idx;

-- Posted/first-seen timestamps never change after insert, so these stay cold and
-- keep the public list and the freshness window selective.
create index if not exists jobs_status_first_seen_idx
  on jobs (status, first_seen_at desc);

create index if not exists jobs_open_public_posted_idx
  on jobs (status, us_eligible, tech_eligible, posted_at desc nulls last);
