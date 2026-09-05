# Changelog

All notable changes to Jobrow are documented here.

## [0.2.0] — 2026-09-05

Product polish and scale-up session. Live: [jobrow.vercel.app](https://jobrow.vercel.app).

### Scale
- Expanded the seed from **34 → 50** US-tech ATS boards (`d9d2e61`)
- New boards: Alpaca, Affirm, Brex, Plaid, Scale AI, Anduril, Snowflake, HubSpot, DoorDash, Elastic, Confluent, Glean, Sentry, Chime, Flexport, Samsara
- Open US-tech roles on the live board: **5,000+** (was ~2,000+)
- Company pages list up to **5,000** open roles (was capped at 200)

### UI / copy
- Light-mode silver lifted site-wide (paper `#fafbfc`, stronger sheen)
- Plain-language labels: Register→Jobs, Index→Search, Watched→Saved, Crawl slot→Add a board, Rates→Pricing, Placements→Promote, Desk→Contact
- Masthead: “Public listings. Not an employer.”; New in 24h; Added / closed; boards→companies
- Home **Latest**: 8 roles max, **one company per row**
- Home **Companies** strip: **8** rows (was 12)
- Header order: Jobs · Search · Companies · About · Saved · **Closed**

### Closed roles
- New `/closed` page + `/api/closed` for roles that left a board after a successful crawl
- Renamed Expired→Closed; `/expired` redirects; footer link removed

### Discovery
- Sitemap includes all `/companies/{slug}` URLs (plus jobs + static pages)
- Shared `pageHead` meta (description, OG/Twitter fields, canonical) on key routes
- Public [`/llms.txt`](https://jobrow.vercel.app/llms.txt) for AI assistants; noted in `robots.txt`
- Grok share-card bake: `site.json` description + `origin` so `og:image` works on `*.vercel.app`

## [0.1.0] — 2026-08-31

Initial public release: Jobs register, Search, Companies, JSON API, Expo mobile client, Neon production, twice-daily crawl.
