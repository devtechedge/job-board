# Jobrow

Public ATS register of **still-open US tech roles**.

Working product name. Repo: [`devtechedge/job-board`](https://github.com/devtechedge/job-board). Brand and domain are not locked.

Jobrow reads the same public JSON the employer’s careers page already uses (Greenhouse, Ashby, Lever). When a successful crawl no longer sees a posting, the row is closed the same run. A failed fetch does **not** close that company’s jobs.

Independent index. Not an employer, recruiter, or agency. Apply on the company board.

## What v1 does

- Search + structured filters over still-open US tech roles
- Register / table UI (title, company, pay, workplace, posted, source)
- Company pages, original legal drafts, localStorage watchlist
- Admin password to add a board and trigger a crawl
- Twice-daily crawl via GitHub Actions hitting `POST /api/cron/crawl`

## Stack

TanStack Start, React 19, TypeScript, Tailwind v4, Postgres (Neon in production, embedded PGLite in preview).

## Data sources (public JSON only)

| ATS | Endpoint |
|---|---|
| Greenhouse | `https://boards-api.greenhouse.io/v1/boards/{token}/jobs` |
| Ashby | `https://api.ashbyhq.com/posting-api/job-board/{org}?includeCompensation=true` |
| Lever | `https://api.lever.co/v0/postings/{site}?mode=json` |

No scraping of aggregators. No login walls. Apply URLs are allowlisted to the employer / ATS host.

## Add a company

In Admin (`ADMIN_PASSWORD`, or `jobrow-preview` in the sandbox preview):

1. Name, slug, ATS type, board token
2. Careers URL + website (allowlists the apply host)
3. Save, then **Crawl** that row

## GitHub Action

Repo secrets:

- `APP_URL` — deployed origin
- `CRON_SECRET` — same value as the app env `CRON_SECRET`

Schedule: 01:20 and 13:20 UTC.

## Remaining TODOs

- Final brand, logo, domain
- Counsel review of terms / privacy / venue
- Email alerts, accounts, paid placement — out of v1 on purpose
