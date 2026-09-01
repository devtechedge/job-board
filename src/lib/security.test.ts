import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeHtml } from "./sanitize.ts";
import {
  assertAtsFetchUrl,
  isPrivateHost,
  jsonForScript,
  publicHttpsUrl,
  secretEqual,
} from "./security.ts";

describe("sanitizeHtml", () => {
  it("escapes unclosed tags so they cannot run as HTML", () => {
    const html = sanitizeHtml(`<p>hi<img src=x onerror=alert(1)`);
    assert.equal(html.includes("<img"), false);
    assert.match(html, /\u0026lt;img/);
  });

  it("drops javascript hrefs", () => {
    const html = sanitizeHtml(`<a href="javascript:alert(1)">x</a>`);
    assert.equal(html.includes("javascript:"), false);
  });

  it("keeps https links and strips other attributes", () => {
    const html = sanitizeHtml(`<a href="https://example.com" onclick="alert(1)">x</a>`);
    assert.match(html, /href="https:\/\/example.com\/"/);
    assert.equal(html.includes("onclick"), false);
    assert.match(html, /rel="noopener noreferrer"/);
  });
});

describe("jsonForScript", () => {
  it("cannot break out of a script tag", () => {
    const dumped = jsonForScript({ title: "</script><script>alert(1)</script>" });
    assert.equal(dumped.includes("</script>"), false);
    assert.match(dumped, /\\u003c/);
  });
});

describe("secretEqual", () => {
  it("accepts the same string and rejects a mismatch of another length", () => {
    assert.equal(secretEqual("correct-horse", "correct-horse"), true);
    assert.equal(secretEqual("nope", "correct-horse"), false);
  });
});

describe("fetch URL guard", () => {
  it("allows Greenhouse and blocks metadata IPs", () => {
    assert.doesNotThrow(() =>
      assertAtsFetchUrl("https://boards-api.greenhouse.io/v1/boards/stripe/jobs"),
    );
    assert.throws(() => assertAtsFetchUrl("https://169.254.169.254/latest/meta-data"));
    assert.throws(() => assertAtsFetchUrl("https://evil.example/x"));
    assert.throws(() => assertAtsFetchUrl("http://api.lever.co/v0/postings/x"));
  });
});

describe("publicHttpsUrl", () => {
  it("rejects loopback and userinfo", () => {
    assert.equal(publicHttpsUrl("https://127.0.0.1/jobs"), null);
    assert.equal(publicHttpsUrl("https://user:pass@example.com/"), null);
    assert.ok(publicHttpsUrl("https://example.com/jobs"));
    assert.equal(isPrivateHost("192.168.0.8"), true);
  });
});
