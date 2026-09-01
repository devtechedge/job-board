import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { companyInitials, companyLogoSrc, hostFromUrl } from "./logo.ts";

describe("company logos", () => {
  it("builds a favicon URL from the company website", () => {
    const src = companyLogoSrc({ website: "https://stripe.com" });
    assert.equal(
      src,
      "https://www.google.com/s2/favicons?domain=stripe.com&sz=128",
    );
  });

  it("prefers an explicit https logo", () => {
    const src = companyLogoSrc({
      logoUrl: "https://stripe.com/favicon.ico",
      website: "https://stripe.com",
    });
    assert.equal(src, "https://stripe.com/favicon.ico");
  });

  it("rejects private hosts and javascript", () => {
    assert.equal(hostFromUrl("http://stripe.com"), null);
    assert.equal(companyLogoSrc({ website: "https://127.0.0.1" }), null);
    assert.equal(companyLogoSrc({ logoUrl: "javascript:alert(1)" }), null);
  });

  it("makes initials", () => {
    assert.equal(companyInitials("Grafana Labs"), "GL");
    assert.equal(companyInitials("Stripe"), "ST");
  });
});
