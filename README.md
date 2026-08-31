# Jobrow

Searchable register of still-open US tech roles, read from public employer ATS boards.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://job-board-devtechedge1.vercel.app)
[![TanStack Start](https://img.shields.io/badge/TanStack%20Start-black)](https://tanstack.com/start)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Live Demo

**https://job-board-devtechedge1.vercel.app**

> **Status:** Public Vercel Hobby. No `DATABASE_URL` is set, so the index runs on embedded PGLite and reseeds from public Greenhouse / Ashby / Lever JSON on cold start. Apply always leaves the site for the employer board. Independent index — not an employer, recruiter, or agency.

---

## Screenshots

| Register | About |
|----------|--------|
| ![Register](docs/screenshots/01-register.png) | ![About](docs/screenshots/02-about.png) |

| Role | Companies |
|------|-----------|
| ![Job detail](docs/screenshots/03-job-detail.png) | ![Companies](docs/screenshots/04-companies.png) |

---

## Features

- Table-first register: title, company, pay, workplace, posted, source
- Structured filters plus a free-text box
- Same-run close when a successful board fetch no longer lists the role
- Company pages, original legal drafts, localStorage watchlist
- Admin password to add a board token and trigger a crawl
- Twice-daily crawl Action hitting `POST /api/cron/crawl` (needs `APP_URL` + `CRON_SECRET`)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| App | TanStack Start, React 19, TypeScript, Tailwind v4 |
| Data | Postgres. Neon when `DATABASE_URL` is set; embedded PGLite on the public Vercel demo |
| Sources | Greenhouse, Ashby, Lever public JSON APIs |
| Hosting | Vercel |
| Crawl | GitHub Action, twice daily |

---

## Quick Start

```bash
npm install
npm run dev
```

Optional env: see [.env.example](.env.example).

Add a board in `/admin` (password from `ADMIN_PASSWORD`, or `jobrow-preview` in the sandbox).

The company registry (the real asset) lives in [data/companies.csv](data/companies.csv) and is seeded from [src/lib/seed-companies.ts](src/lib/seed-companies.ts).

### Add a 21st company

1. Confirm the public board JSON exists:
   - Greenhouse: `https://boards-api.greenhouse.io/v1/boards/{token}/jobs`
   - Ashby: `https://api.ashbyhq.com/posting-api/job-board/{token}?includeCompensation=true`
   - Lever: `https://api.lever.co/v0/postings/{token}?mode=json`
2. Open `/admin`, unlock, fill name / slug / ATS / board token / careers URL, save, crawl that row.
3. Or append a line to `data/companies.csv` and a matching object in `SEED_COMPANIES`, then restart so seed runs.

Do not scrape career marketing HTML when the board JSON exists.

---

## Persist the index (Neon)

Public Vercel is still PGLite until `DATABASE_URL` is on the project. I cannot create a Neon account or write Vercel env from this sandbox.

1. Create a free project at [console.neon.tech](https://console.neon.tech) (GitHub login). Name it `jobrow`. Region: AWS US East.
2. Copy the **pooled** URI (`-pooler` in the host, `sslmode=require`).
3. Vercel → `job-board` → Settings → Environment Variables, Production + Preview:
   - `DATABASE_URL` = that URI
   - `ADMIN_PASSWORD` = a password you pick
   - `CRON_SECRET` = `openssl rand -hex 24`
   - `APP_URL` = `https://job-board-devtechedge1.vercel.app`
   - `VITE_SITE_URL` = same
4. Redeploy. Hit `/api/health` — `db` should be `"neon"`.
5. GitHub → `job-board` → Settings → Secrets and variables → Actions: `APP_URL` and `CRON_SECRET`.

Then leave `/companies` open once. The index survives cold starts, and the twice-daily Action can write to the same database.

---

## Remaining

| Item | Status |
|------|--------|
| Custom domain / final brand | Working name is Jobrow. Buy a domain later. |
| Neon `DATABASE_URL` | Flagged on. Public Vercel still needs the connection string in project env. |
| GitHub Action secrets `APP_URL` + `CRON_SECRET` | Token cannot write Actions secrets. Set them in the repo after Neon. |
| Counsel | Terms / privacy / sourcing are drafts. |
| Alerts / Plus / featured listings | Out of v1. |

---

## License

MIT. See [LICENSE](LICENSE).
