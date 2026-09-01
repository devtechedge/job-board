import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/site-footer";
import { CompanyMark } from "@/components/company-mark";
import { Button } from "@/components/ui/button";
import {
  adminBoardFn,
  adminCrawlFn,
  adminDeleteCompanyFn,
  adminMetaFn,
  adminSaveCompanyFn,
  adminUnlockFn,
} from "@/lib/admin.functions";
import { ago } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  loader: () => adminMetaFn(),
  head: () => ({ meta: [{ title: "Admin — Jobrow" }] }),
  component: AdminPage,
});

type Board = Awaited<ReturnType<typeof adminBoardFn>>;

function AdminPage() {
  const meta = Route.useLoaderData();
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [board, setBoard] = useState<Board | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    ats: "greenhouse",
    board_token: "",
    careers_url: "",
    website: "",
  });

  async function loadBoard() {
    const data = await adminBoardFn({ data: { password } });
    setBoard(data);
  }

  async function unlock() {
    setError(null);
    try {
      await adminUnlockFn({ data: { password } });
      await loadBoard();
      setUnlocked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unlock");
    }
  }

  async function crawl(slug?: string) {
    setBusy(true);
    setError(null);
    try {
      await adminCrawlFn({ data: { password, slug, all: !slug } });
      await loadBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Crawl failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveCompany() {
    setBusy(true);
    setError(null);
    try {
      await adminSaveCompanyFn({
        data: {
          password,
          ...form,
          ats: form.ats as "greenhouse" | "ashby" | "lever" | "workable",
        },
      });
      setForm({ name: "", slug: "", ats: "greenhouse", board_token: "", careers_url: "", website: "" });
      await loadBoard();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold">Admin</h1>
        <p className="mt-2 text-sm text-muted">
          {meta.configured ? "Password required." : "Set ADMIN_PASSWORD to enable admin."}
        </p>
        <p className="mt-1 text-sm tabular-nums text-muted">
          Database: {meta.db === "neon" ? "Neon (persistent)" : "PGLite (ephemeral demo)"}
        </p>
        {!unlocked ? (
          <form
            className="mt-6 max-w-md space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void unlock();
            }}
          >
            <input
              className="ledger-input"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Button type="submit">Unlock</Button>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
          </form>
        ) : (
          <div className="mt-6 space-y-8">
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={busy} onClick={() => void crawl()}>
                Crawl all enabled
              </Button>
            </div>
            <section className="overflow-x-auto border border-rule">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-inset text-[11px] uppercase tracking-[0.14em] text-muted">
                  <tr>
                    <th className="px-3 py-2">Company</th>
                    <th className="px-3 py-2">ATS</th>
                    <th className="px-3 py-2">Token</th>
                    <th className="px-3 py-2">Open</th>
                    <th className="px-3 py-2">Last ok</th>
                    <th className="px-3 py-2">Error</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {(board?.companies ?? []).map((company) => (
                    <tr key={company.id} className="border-t border-rule align-top">
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-2 font-medium">
                          <CompanyMark name={company.name} website={company.website} />
                          {company.name}
                        </span>
                      </td>
                      <td className="px-3 py-2">{company.ats}</td>
                      <td className="px-3 py-2 font-mono text-xs">{company.board_token}</td>
                      <td className="px-3 py-2 tabular-nums">{company.open_count}</td>
                      <td className="px-3 py-2 text-muted">{ago(company.last_ok_at)}</td>
                      <td className="max-w-xs px-3 py-2 text-xs text-danger">
                        {company.last_error ?? ""}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => void crawl(company.slug)}
                          >
                            Crawl
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={busy}
                            onClick={() => {
                              void adminDeleteCompanyFn({ data: { password, id: company.id } }).then(
                                () => loadBoard(),
                              );
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
            <section className="max-w-xl space-y-3 border border-rule p-4">
              <h2 className="font-serif text-xl font-semibold">Add a company</h2>
              {(
                [
                  ["name", "Name"],
                  ["slug", "Slug"],
                  ["board_token", "Board token"],
                  ["careers_url", "Careers URL"],
                  ["website", "Website"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted">
                    {label}
                  </span>
                  <input
                    className="ledger-input"
                    value={form[key]}
                    onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  />
                </label>
              ))}
              <label className="block">
                <span className="mb-1 block text-[11px] uppercase tracking-wide text-muted">ATS</span>
                <select
                  className="ledger-select"
                  value={form.ats}
                  onChange={(event) => setForm((prev) => ({ ...prev, ats: event.target.value }))}
                >
                  <option value="greenhouse">greenhouse</option>
                  <option value="ashby">ashby</option>
                  <option value="lever">lever</option>
                  <option value="workable">workable</option>
                </select>
              </label>
              <Button type="button" disabled={busy} onClick={() => void saveCompany()}>
                Save company
              </Button>
            </section>
            <section>
              <h2 className="font-serif text-xl font-semibold">Recent crawls</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {(board?.runs ?? []).map((run) => (
                  <li key={run.id} className="border border-rule px-3 py-2">
                    {ago(run.started_at)} · ok {run.companies_ok} · fail {run.companies_fail} ·
                    upserted {run.jobs_upserted} · closed {run.jobs_closed}
                    {run.error_sample ? ` · ${run.error_sample}` : ""}
                  </li>
                ))}
                {(board?.runs ?? []).length === 0 ? (
                  <li className="text-muted">No crawl runs recorded yet.</li>
                ) : null}
              </ul>
            </section>
          </div>
        )}
      </main>
    </AppShell>
  );
}
