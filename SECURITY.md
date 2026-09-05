# Security Policy

## Reporting a vulnerability

Do **not** open a public GitHub issue for a security report.

Use [GitHub private vulnerability reporting](https://github.com/devtechedge/job-board/security/advisories/new) on this repository.

Include:

- The affected URL or code path
- Steps to reproduce
- What you expect vs what happens
- Whether any personal data (desk-note emails) could be involved

We will acknowledge valid reports and patch production before any write-up.

## What this app is

Jobrow is a public index of employer ATS JSON (Greenhouse, Ashby, Lever, Workable). Production is Neon Postgres with 50 seeded boards. It is not an employer, recruiter, or resume database. Search does not require an account. Apply leaves this site.

## In scope

- https://jobrow.vercel.app and the `devtechedge/job-board` codebase
- Stored XSS via crawled job HTML
- Auth bypass on `/admin` or `POST /api/cron/crawl`
- SSRF from crawl/fetch helpers
- SQL injection in search or desk notes
- Leak of `ADMIN_PASSWORD`, `CRON_SECRET`, or `DATABASE_URL`
- Unauthenticated dump of admin board tokens / crawl errors

## Out of scope

- Rate limits on Vercel Hobby (in-memory, per-instance)
- Third-party ATS availability or content
- Open redirect on employer apply URLs we did not mint
- Missing `HSTS` until a custom domain is attached
- Self-XSS, logout CSRF on a product with no user sessions
- Reports that require physical access to the operator's Vercel/GitHub account

## Hardening already in the tree

- Parameterized SQL only
- Job HTML is tag-allowlisted; text nodes are escaped; `javascript:` links dropped
- JSON-LD is serialized with `<` escaped so it cannot break out of `<script>`
- Contact notes: size cap, honeypot, rate limit, public-https URLs only (no loopback / RFC1918)
- Admin board dump and crawl require the password; guesses are rate-limited; compare is SHA-256 + `timingSafeEqual`
- Cron accepts `Authorization: Bearer` only — not `?secret=`
- Outbound crawl fetch: HTTPS, no redirects, host allowlist (Greenhouse / Ashby / Lever / Workable), no private IPs
- Board tokens are `[A-Za-z0-9._-]{1,80}`
- Security headers (CSP, `nosniff`, `SAMEORIGIN`, COOP, Permissions-Policy) via `vercel.json`
- Public company pages do not show board tokens or raw crawl errors

## Secrets the operator must set

| Name | Where | Why |
|---|---|---|
| `DATABASE_URL` | Vercel (Neon) | Persistent index. Without it, production admin stays locked. |
| `ADMIN_PASSWORD` | Vercel | `/admin`. Use a long random string. Never commit it. |
| `CRON_SECRET` | Vercel **and** GitHub Actions | `POST /api/cron/crawl`. Hex, ≥ 32 bytes. |
| `APP_URL` | GitHub Actions | Origin the Action calls. |

Rotate any of the above if it was pasted into chat, a ticket, or a screenshot.

## Residual risk (honest)

No public internet app is “unhackable.” Remaining limits:

- Vercel Hobby cron/desk rate limits reset per isolate
- CSP still allows `'unsafe-inline'` scripts because of the theme boot + TanStack hydration
- Crawled employer HTML can still contain *links* to third-party HTTPS sites
- Counsel has not reviewed the legal drafts

If you run a fork, set the secrets above before exposing `/admin`.
