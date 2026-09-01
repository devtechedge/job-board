const ALLOWED = new Set(["p", "br", "ul", "ol", "li", "strong", "em", "b", "i", "a", "h2", "h3", "h4"]);

const NAMED: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  lt: "<",
  gt: ">",
  apos: "'",
  bull: "\u2022",
  mdash: "\u2014",
  ndash: "\u2013",
  hellip: "\u2026",
  rsquo: "\u2019",
  lsquo: "\u2018",
  rdquo: "\u201D",
  ldquo: "\u201C",
  copy: "\u00A9",
  reg: "\u00AE",
  trade: "\u2122",
  times: "\u00D7",
  divide: "\u00F7",
  middot: "\u00B7",
  deg: "\u00B0",
  plusmn: "\u00B1",
};

function decodeEntitiesOnce(text: string): string {
  return text
    .replace(/&([a-z]+);/gi, (full, name: string) => NAMED[name.toLowerCase()] ?? full)
    .replace(/&#(\d+);/g, (full, n: string) => {
      const code = Number(n);
      if (!Number.isFinite(code) || code < 1 || code > 0x10ffff) return full;
      try {
        return String.fromCodePoint(code);
      } catch {
        return full;
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (full, n: string) => {
      const code = parseInt(n, 16);
      if (!Number.isFinite(code) || code < 1 || code > 0x10ffff) return full;
      try {
        return String.fromCodePoint(code);
      } catch {
        return full;
      }
    });
}

/** Unfold nested entities (`&amp;bull;` → `•`) so stored postings render as HTML, not literals. */
export function decodeEntities(text: string): string {
  let current = text;
  for (let i = 0; i < 5; i += 1) {
    const next = decodeEntitiesOnce(current);
    if (next === current) break;
    current = next;
  }
  return current;
}

export function escapeText(text: string): string {
  return text
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

export function htmlToText(html: string | null | undefined): string {
  if (!html) return "";
  return decodeEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h1|h2|h3|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function safeHref(raw: string): string | null {
  const href = decodeEntities(raw.trim());
  if (!/^https:\/\//i.test(href)) return null;
  try {
    const url = new URL(href);
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";
  // Decode first so `&lt;p&gt;` stored by a prior escape pass becomes real tags we can allowlist.
  const source = decodeEntities(input);
  const stripped = source
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const out: string[] = [];
  const re = /<\/?([a-z0-9]+)([^>]*)>/gi;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(stripped))) {
    out.push(escapeText(stripped.slice(last, match.index)));
    const [full, rawName, attrs] = match;
    const name = rawName.toLowerCase();
    last = match.index + full.length;
    if (!ALLOWED.has(name)) continue;
    const isClose = full.startsWith("</");
    if (isClose) {
      out.push(`</${name}>`);
      continue;
    }
    if (name === "br") {
      out.push("<br />");
      continue;
    }
    if (name === "a") {
      const hrefMatch = attrs.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const href = safeHref(hrefMatch?.[2] ?? hrefMatch?.[3] ?? hrefMatch?.[4] ?? "");
      if (!href) {
        out.push("<span>");
        continue;
      }
      out.push(`<a href="${escapeText(href)}" rel="noopener noreferrer" target="_blank">`);
      continue;
    }
    out.push(`<${name}>`);
  }
  out.push(escapeText(stripped.slice(last)));
  return out.join("").slice(0, 80_000);
}

export function firstSentence(text: string, max = 240): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const cut = clean.match(/^(.{40,240}?[.!?])\s/)?.[1] ?? clean.slice(0, max);
  return cut.trim();
}
