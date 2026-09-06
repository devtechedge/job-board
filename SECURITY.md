# Security Policy

**Date:** 2026-09-06  

## Reporting a vulnerability

Do **not** open a public GitHub issue for a security report.

Use GitHub private vulnerability reporting on this repository:
https://github.com/devtechedge/job-board/security/advisories/new

Include:

- The affected URL or code path
- Steps to reproduce
- What you expect vs what happens
- Whether any personal data (desk-note emails) could be involved

We will acknowledge valid reports and patch production before any write-up.

## Honest scope

No public website is "impossible to hack." Jobrow is hardened for a **public read-only index** with a small password-gated admin and a secret-gated crawl. Making the GitHub repo private reduces source disclosure; it does **not** replace strong `ADMIN_PASSWORD` / `CRON_SECRET` / Neon credentials on Vercel.

## What this app is

Jobrow is a public index of employer ATS JSON (Greenhouse, Ashby, Lever, Workable). Production is Neon Postgres with 50 seeded boards. It is not an employer, recruiter, or resume database. Search does not require an account. Apply leaves this site for employer HTTPS URLs only.

## In scope

- https://jobrow.vercel.app and the `devtechedge/job-board` codebase
- Stored XSS via crawled job HTML
- Auth bypass on `/admin` or `POST /api/cron/crawl`
- SSRF from crawl/fetch helpers
- SQL injection in search or desk notes
- Leak of `ADMIN_PASSWORD`, `CRON_SECRET`, or `DATABASE_URL`
- Unauthenticated dump of admin board tokens / crawl errors
- Abuse of public JSON API / desk endpoint

## Out of scope

- Perfect global rate limits on Vercel Hobby (in-memory, per-isolate)
- Third-party ATS availability or content
- Open redirect on employer apply URLs we did not mint (we only emit allowlisted HTTPS apply links)
- Self-XSS; CSRF on a product with no end-user sessions
- Reports that require account access to the operator Vercel / GitHub / Neon console


## Hardening in the tree

- Parameterized SQL only
- Job HTML tag-allowlisted; text escaped; `javascript:` links dropped
- JSON-LD serialized with `<` escaped (no script breakout)
- Apply buttons only render `publicHttpsUrl()` targets (`rel="noopener noreferrer"`)
- Contact desk: size cap, honeypot, rate limit, public-https URLs only (no loopback / RFC1918)
- Admin: password required; production rejects missing/weak/`change-me` passwords; IP-keyed rate limit; SHA-256 + `timingSafeEqual`
- Cron: `Authorization: Bearer` only (no `?secret=`); production/DB hosts fail closed without a strong `CRON_SECRET`
- Outbound crawl: HTTPS, no redirects, ATS host allowlist, no private IPs, short timeout
- Board tokens: `[A-Za-z0-9._-]{1,80}`
- Public JSON API: best-effort per-IP rate limit (429)
- Security headers via `vercel.json`: CSP, HSTS, `nosniff`, `X-Frame-Options: DENY`, COOP, Permissions-Policy
- `/admin` robots `Disallow` + `noindex`; `/api/cron` and `/api/desk` disallowed in `robots.txt`
- Public company pages never show board tokens or raw crawl errors

## Secrets the operator must set

| Name | Where | Why |
|---|---|---|
| `DATABASE_URL` | Vercel (Neon) | Persistent index (`sslmode=require`) |
| `ADMIN_PASSWORD` | Vercel | `/admin`. At least 16 chars, not a placeholder. Never commit. |
| `CRON_SECRET` | Vercel **and** GitHub Actions | `POST /api/cron/crawl`. At least 16 chars; prefer 32+ random bytes hex. |
| `APP_URL` | GitHub Actions | Origin the Action calls (`https://jobrow.vercel.app`) |
| `VITE_SITE_URL` | Vercel | Sitemap / OG origin |

Rotate any secret that was pasted into chat, a ticket, or a screenshot.

### Making the GitHub repo private

Recommended when you are done open-sourcing the build story. Still required after that:

1. Confirm Vercel env vars are strong and not reused elsewhere
2. Confirm GitHub Actions secrets `CRON_SECRET` + `APP_URL`
3. Keep a private way to receive vulnerability reports if you disable public advisories

## Residual risk

- Hobby rate limits reset per serverless isolate
- CSP still allows `unsafe-inline` scripts (theme boot + framework hydration)
- Crawled employer HTML may contain links to third-party HTTPS sites
- Legal copy is draft until counsel reviews

If you run a fork, set the secrets above before exposing `/admin` or enabling the crawl Action.
