import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ashbyListUrl,
  greenhouseDetailUrl,
  greenhouseListUrl,
  leverListUrl,
  workableListUrl,
} from "./urls.ts";
import { canonicalizeApplyUrl, isAllowedApplyUrl } from "./apply-url.ts";
import { missingSourceIds } from "../close.ts";
import { parseWorkplace, isUsEligible, isTechRole } from "../classify.ts";
import { parseSalaryFromText, dollarsToCents, formatPay } from "../salary.ts";
import { sentenceToFilters } from "../query.ts";

describe("adapter URL builders", () => {
  it("builds Greenhouse list and detail URLs", () => {
    assert.equal(
      greenhouseListUrl("stripe"),
      "https://boards-api.greenhouse.io/v1/boards/stripe/jobs?content=true",
    );
    assert.equal(
      greenhouseDetailUrl("stripe", "123"),
      "https://boards-api.greenhouse.io/v1/boards/stripe/jobs/123",
    );
  });
  it("builds Ashby compensation URL", () => {
    assert.equal(
      ashbyListUrl("openai"),
      "https://api.ashbyhq.com/posting-api/job-board/openai?includeCompensation=true",
    );
  });
  it("builds Lever JSON URL", () => {
    assert.equal(
      leverListUrl("palantir"),
      "https://api.lever.co/v0/postings/palantir?mode=json",
    );
  });
  it("builds Workable widget URL", () => {
    assert.equal(
      workableListUrl("acme"),
      "https://apply.workable.com/api/v1/widget/accounts/acme",
    );
  });
});

describe("apply URL allowlist", () => {
  it("accepts ATS hosts and company domains", () => {
    assert.equal(isAllowedApplyUrl("https://jobs.ashbyhq.com/openai/abc"), true);
    assert.equal(
      isAllowedApplyUrl("https://stripe.com/jobs/search?gh_jid=1", ["https://stripe.com"]),
      true,
    );
  });
  it("upgrades http on allowed hosts and matches apex vs www", () => {
    assert.equal(canonicalizeApplyUrl("http://block.xyz/careers/jobs/1"), "https://block.xyz/careers/jobs/1");
    assert.equal(
      isAllowedApplyUrl("http://block.xyz/careers/jobs/1", ["https://block.xyz"]),
      true,
    );
    assert.equal(
      isAllowedApplyUrl("https://databricks.com/company/careers/job?gh_jid=1", [
        "https://www.databricks.com",
      ]),
      true,
    );
    assert.equal(isAllowedApplyUrl("https://app.careerpuck.com/job-board/lyft/job/1"), true);
  });
  it("rejects aggregators and non-https schemes", () => {
    assert.equal(isAllowedApplyUrl("https://www.indeed.com/viewjob?jk=1"), false);
    assert.equal(isAllowedApplyUrl("https://hotfix.jobs/x"), false);
    assert.equal(isAllowedApplyUrl("ftp://jobs.ashbyhq.com/x"), false);
  });
});

describe("close detection", () => {
  it("closes ids missing from a successful payload", () => {
    assert.deepEqual(missingSourceIds(["a", "b", "c"], ["a", "c"]), ["b"]);
  });
  it("closes the whole open set when the board is empty", () => {
    assert.deepEqual(missingSourceIds(["a", "b"], []), ["a", "b"]);
  });
  it("closes nothing when every id returned", () => {
    assert.deepEqual(missingSourceIds(["a"], ["a", "b"]), []);
  });
});

describe("workplace parser", () => {
  it("maps remote / hybrid / onsite language", () => {
    assert.equal(parseWorkplace("Remote - US", null, null), "remote");
    assert.equal(parseWorkplace("San Francisco, CA", "hybrid", true), "hybrid");
    assert.equal(parseWorkplace("New York, NY", "onsite", false), "onsite");
    assert.equal(parseWorkplace("United States (Remote)", null, null), "remote");
  });
});

describe("US eligibility", () => {
  it("keeps US cities and Remote-US", () => {
    assert.equal(
      isUsEligible({
        locationRaw: "San Francisco, CA",
        locations: ["San Francisco, CA"],
        workplace: "onsite",
        hqCountry: "US",
      }),
      true,
    );
    assert.equal(
      isUsEligible({
        locationRaw: "Remote - US",
        locations: ["Remote - US"],
        workplace: "remote",
        hqCountry: "US",
      }),
      true,
    );
  });
  it("drops clearly foreign-only roles", () => {
    assert.equal(
      isUsEligible({
        locationRaw: "London, United Kingdom",
        locations: ["London, United Kingdom"],
        workplace: "hybrid",
        country: "GB",
        hqCountry: "US",
      }),
      false,
    );
  });
});

describe("tech filter", () => {
  it("keeps engineering and drops retail", () => {
    assert.equal(isTechRole("Staff Software Engineer", "Engineering"), true);
    assert.equal(isTechRole("Senior Manager, Data Engineering", null), true);
    assert.equal(isTechRole("Engineering Manager", null), true);
    assert.equal(isTechRole("Warehouse Associate", "Operations"), false);
    assert.equal(isTechRole("Account Executive, AI Sales", "Sales"), false);
    assert.equal(isTechRole("FP&A Analyst", "Finance"), false);
    assert.equal(isTechRole("Client Services Representative", "Client Services"), false);
  });
});

describe("salary parser", () => {
  it("reads ranges and k-suffix", () => {
    const range = parseSalaryFromText("Compensation $160,000 – $220,000");
    assert.equal(range.minCents, 16000000);
    assert.equal(range.maxCents, 22000000);
    assert.equal(range.source, "inferred");
    const k = parseSalaryFromText("$180k");
    assert.equal(k.minCents, 18000000);
    assert.equal(dollarsToCents(257000), 25700000);
    assert.equal(formatPay(16000000, 22000000, "USD", "posted"), "$160k–$220k");
    assert.equal(formatPay(248000000, 310000000, "COP", "posted"), "COP 2480k–3100k");
    const noise = parseSalaryFromText("An estimated $124 trillion of assets will be invested");
    assert.equal(noise.source, "none");
    const meta = parseSalaryFromText("$160,000 – $220,000");
    assert.equal(meta.source, "inferred");
    assert.ok(meta.minCents && meta.maxCents);
  });
});

describe("sentence filters", () => {
  it("maps a plain sentence into structured fields", () => {
    const parsed = sentenceToFilters("senior remote backend in nyc 180k");
    assert.equal(parsed.workplace, "remote");
    assert.equal(parsed.seniority, "senior");
    assert.equal(parsed.fn, "backend");
    assert.equal(parsed.salaryMin, 180000);
    assert.equal(parsed.location?.toLowerCase(), "nyc");
  });
});
