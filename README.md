# Jobrow

Public register of **still-open US tech roles**, read from employer ATS JSON — not from another job site.

Tagline: **Still open.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://jobrow.vercel.app)
[![Boards](https://img.shields.io/badge/Boards-50-1F6B4A)](https://jobrow.vercel.app/companies)
[![TanStack Start](https://img.shields.io/badge/TanStack%20Start-black)](https://tanstack.com/start)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Live demo

**https://jobrow.vercel.app**

Production is **Neon Postgres** on Vercel Hobby. The board currently holds **5,000+ open US tech roles across 50 companies**. Apply always leaves Jobrow for the employer ATS. Public listings — not an employer, recruiter, or agency.

`GET /api/health` reports `{ db: "neon", openJobs, pendingBoards }`.

### Public JSON API

Unauthenticated read API for the same US-tech slice Jobs shows (`status=open`, `us_eligible`, `tech_eligible`). Native apps and other clients can call these without going through server functions:

- `GET /api/jobs` — `JobQuery` as querystring (`q`, `fn`, `seniority`, `workplace`, `location`, `salaryMin`, `posted`, `ats`, `company`, `sort`, `page`). Page size 40.
- `GET /api/jobs/:id` — one role, with sanitized `description_html` plus `description_text`
- `GET /api/companies` — boards
- `GET /api/companies/:slug` — board plus open roles
- `GET /api/home` — register KPIs (open count, boards, first-seen 24h, last crawl, functions, boards) plus a latest page
- `GET /api/closed` — roles closed after a successful crawl

`/api/health`, `/api/desk`, cron, and admin are unchanged. Product auth stays off. Apply URLs are employer ATS https links. Discovery helpers: [`/sitemap.xml`](https://jobrow.vercel.app/sitemap.xml), [`/llms.txt`](https://jobrow.vercel.app/llms.txt).

### Native app

An Expo (Android + iOS) client lives in [`mobile/`](mobile/). It is a separate package so the Vercel web build does not compile it. See [mobile/README.md](mobile/README.md) to run it in the iOS simulator or Android emulator.

---

## Sister product

**[Lattice](https://lattice-devtechedge1.vercel.app)** — free board for **blockchain, crypto, and Web3 jobs** from live employer ATS boards (Coinbase, Binance, Ripple, and more). Jobrow stays US tech; Lattice covers Web3 careers. Source: [devtechedge/lattice](https://github.com/devtechedge/lattice).

---

## Screenshots

| Jobs | Search |
|----------|--------|
| ![Jobs](docs/screenshots/01-register.png) | ![Search](docs/screenshots/05-index.png) |

| Role | Companies |
|------|-----------|
| ![Job detail](docs/screenshots/03-job-detail.png) | ![Companies](docs/screenshots/04-companies.png) |

| About | Pricing |
|-------|--------|
| ![About](docs/screenshots/02-about.png) | ![Pricing](docs/screenshots/06-rates.png) |

Share card: [docs/screenshots/social-preview.png](docs/screenshots/social-preview.png)

---

## What you can do

- **Jobs** (`/`) — Latest (8 roles, one company per row), filters, KPIs, Companies strip (8)
- **Closed** (`/closed`) — roles removed after a successful crawl (filled or pulled)
- Company marks next to every listing (site icon, initials if the icon fails)
- **Search** (`/jobs`) — full paginated table of the US tech slice
- **Companies** (`/companies`) — 50 boards, US-tech count vs listed count, last successful fetch
- **Saved** — browser watchlist count in the header (nav: Jobs · Search · Companies · About · Saved · Closed)
- **Role** (`/jobs/:id`) — summary, pay, workplace, posting HTML, Apply (leaves the site)
- **Contact** (`/contact`) — corrections and legal notes (not applications)
- **Add a board** (`/employers`) — public Greenhouse / Ashby / Lever / Workable token
- **Pricing** (`/pricing`) — Bound pass waitlist (`$11` / 28 days). No live checkout
- **Promote** (`/placements`) — Ruled pin `$120` / masthead line `$55`. Waitlist only
- **Watchlist** — local to the browser (`localStorage` key `jobrow:watchlist`, max 200). No account. No resume upload
- **JSON API** (`/api/jobs`, `/api/companies`, `/api/home`) — public register contract for native apps
- **iOS / Android** — Expo app in `mobile/`. Apply opens the employer ATS. Saved jobs use local AsyncStorage.
- **Admin** (`/admin`) — password-gated crawl and board edits

A role **drops when a successful crawl no longer sees it**. A failed fetch does not close that board.

---

## Registry (50)

Seeded from [data/companies.csv](data/companies.csv) and [src/lib/seed-companies.ts](src/lib/seed-companies.ts). Tokens were confirmed against live public board JSON.

| ATS | Companies |
|-----|-----------|
| Greenhouse (36) | Stripe, Anthropic, Airbnb, Coinbase, Discord, Figma, Cloudflare, Databricks, Vercel, Dropbox, Robinhood, Block, Lyft, Pinterest, Reddit, Twilio, Datadog, MongoDB, Instacart, Roblox, GitLab, Grafana Labs, Asana, Okta, Alpaca, Affirm, Brex, Scale AI, Anduril, HubSpot, DoorDash, Elastic, Glean, Chime, Flexport, Samsara |
| Ashby (11) | OpenAI, Ramp, Linear, Notion, Cursor, Perplexity, Supabase, Plaid, Snowflake, Confluent, Sentry |
| Lever (3) | Palantir, Wealthfront, Spotify |

US-eligible **tech** titles stay on Jobs. Sales, finance, and non-US postings on the same board are ignored. The companies table shows both **US tech** and **listed** (raw JSON rows on the last good fetch).

### Add another company

1. Confirm the public board JSON exists:
   - Greenhouse: `https://boards-api.greenhouse.io/v1/boards/{token}/jobs`
   - Ashby: `https://api.ashbyhq.com/posting-api/job-board/{token}?includeCompensation=true`
   - Lever: `https://api.lever.co/v0/postings/{token}?mode=json`
2. `/admin` → unlock with `ADMIN_PASSWORD` → name / slug / ATS / board token / careers URL → crawl that row.
3. Or append a line to `data/companies.csv` and a matching object in `SEED_COMPANIES`.

Do not scrape career marketing HTML when the board JSON exists. Do not scrape other job aggregators.

---

## Stack

| Layer | Technology |
|-------|------------|
| App | TanStack Start, React 19, TypeScript, Tailwind v4 |
| Data | Neon Postgres in production; embedded PGLite when `DATABASE_URL` is omitted (local) |
| Sources | Greenhouse, Ashby, Lever public JSON (Workable adapter ready) |
| Host | Vercel Hobby |
| Crawl | GitHub Action, twice daily, `POST /api/cron/crawl` with `Authorization: Bearer` |
| Security | CSP and related headers in [vercel.json](vercel.json); see [SECURITY.md](SECURITY.md) |

---

## Quick start

```bash
npm install
npm run dev
```

Without `DATABASE_URL` the app uses embedded PGLite and seeds the 50 boards on first load.

```bash
npm test
npm run typecheck
```

Env template: [.env.example](.env.example). Never commit secrets.

| Variable | Where | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | Vercel | Neon pooled URI (`sslmode=require`) |
| `ADMIN_PASSWORD` | Vercel | `/admin` |
| `CRON_SECRET` | Vercel + GitHub Actions | Cron bearer token |
| `APP_URL` | GitHub Actions | Origin the Action calls |
| `VITE_SITE_URL` | Vercel | Sitemap / JSON-LD origin |

Production already has Neon attached. Local demos can omit `DATABASE_URL`.

---

## Security

See [SECURITY.md](SECURITY.md). Report vulnerabilities with GitHub private advisory, not a public issue.

Hardening in this tree: parameterized SQL, escaped job HTML, script-safe JSON-LD, password-gated admin dump, ATS host allowlist, no `?secret=` on cron, desk size cap, public-https URL checks.

---

## Remaining

| Item | Status |
|------|--------|
| Custom domain / final brand | Working name is Jobrow. Buy later. |
| Neon | Live. |
| GitHub Action `APP_URL` + `CRON_SECRET` | Set on the repo. |
| Counsel | Terms / privacy / sourcing are drafts. |
| Bound pass / ruled pins | Rate card exists. Checkout is not live. |

---

## License

MIT. See [LICENSE](LICENSE).
