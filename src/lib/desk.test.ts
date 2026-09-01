import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDeskPayload, validateDeskPayload } from "./desk.ts";

describe("desk notes", () => {
  it("accepts a correction note", () => {
    const parsed = parseDeskPayload({
      kind: "write",
      name: "Ada",
      email: "ada@example.com",
      body: "Stripe listing 123 still shows after the board dropped it.",
    });
    assert.ok(!("error" in parsed));
    assert.equal(validateDeskPayload(parsed), null);
  });

  it("rejects a board request without a public token", () => {
    const parsed = parseDeskPayload({
      kind: "board_request",
      email: "ops@example.com",
      company: "Acme",
      ats: "greenhouse",
      boardToken: "??",
      careersUrl: "https://acme.com/jobs",
    });
    assert.ok(!("error" in parsed));
    assert.match(validateDeskPayload(parsed) ?? "", /token/i);
  });

  it("rejects aggregator-style http careers URLs", () => {
    const parsed = parseDeskPayload({
      kind: "board_request",
      email: "ops@example.com",
      company: "Acme",
      ats: "ashby",
      boardToken: "acme",
      careersUrl: "http://acme.com/jobs",
    });
    assert.ok(!("error" in parsed));
    assert.match(validateDeskPayload(parsed) ?? "", /https/i);
  });

  it("accepts a bound-pass waitlist note", () => {
    const parsed = parseDeskPayload({
      kind: "bound_pass",
      email: "ada@example.com",
      topic: "bound_pass",
      body: "remote backend 180k",
    });
    assert.ok(!("error" in parsed));
    assert.equal(validateDeskPayload(parsed), null);
  });

  it("rejects a placement without a listing URL", () => {
    const parsed = parseDeskPayload({
      kind: "placement",
      email: "ops@example.com",
      company: "Acme",
      topic: "ruled_pin",
      listingUrl: "",
    });
    assert.ok(!("error" in parsed));
    assert.match(validateDeskPayload(parsed) ?? "", /URL/i);
  });
});
