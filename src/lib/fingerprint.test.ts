import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contentHash, type FingerprintFields } from "./fingerprint.ts";

const base: FingerprintFields = {
  title: "Senior Backend Engineer",
  applyUrl: "https://job-boards.greenhouse.io/stripe/jobs/123",
  locationRaw: "Remote - US",
  locations: ["Remote - US"],
  workplace: "remote",
  salaryMinCents: 18000000,
  salaryMaxCents: 24000000,
  salaryCurrency: "USD",
  salarySource: "posted",
  yoeMin: 5,
  function: "backend",
  seniority: "senior",
  skills: ["go", "postgres"],
  descriptionHtml: "<p>Build payments infrastructure.</p>",
  descriptionText: "Build payments infrastructure.",
  summary: "Build payments infrastructure.",
  postedAt: "2026-10-08T23:46:49.000Z",
  usEligible: true,
  techEligible: true,
  rawJson: '{"id":123}',
  searchText: "Senior Backend Engineer Stripe",
};

describe("contentHash", () => {
  it("is stable for an unchanged posting", () => {
    assert.equal(contentHash(base), contentHash({ ...base }));
  });

  it("is stable across extra crawls of the same payload", () => {
    // The crawler recomputes this every run; an unstable hash would defeat the
    // whole point by rewriting the row anyway.
    const runs = Array.from({ length: 5 }, () =>
      contentHash({ ...base, locations: [...base.locations], skills: [...base.skills] }),
    );
    assert.equal(new Set(runs).size, 1);
  });

  it("changes when the description is edited", () => {
    const edited = { ...base, descriptionHtml: "<p>Build payments infrastructure. Now hiring.</p>" };
    assert.notEqual(contentHash(base), contentHash(edited));
  });

  it("changes when the posting is reposted at a new time", () => {
    assert.notEqual(contentHash(base), contentHash({ ...base, postedAt: "2026-10-09T01:00:00.000Z" }));
  });

  it("changes when pay is updated", () => {
    assert.notEqual(contentHash(base), contentHash({ ...base, salaryMaxCents: 26000000 }));
  });

  it("changes when eligibility flips", () => {
    assert.notEqual(contentHash(base), contentHash({ ...base, techEligible: false }));
  });

  it("returns a short hex digest", () => {
    assert.match(contentHash(base), /^[0-9a-f]{32}$/);
  });
});
