const ALLOWED = new Set(["p", "br", "ul", "ol", "li", "strong", "em", "b", "i", "a", "h2", "h3", "h4"]);

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&/gi, "&")
    .replace(/"/gi, '"')
    .replace(/&#39;|'/gi, "'")
    .replace(/</gi, "<")
    .replace(/>/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

export function htmlToText(html: string | null | undefined): string {
  if (!html) return "";
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h1|h2|h3|li|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim(),
  );
}

function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (!/^https:\/\//i.test(href)) return null;
  try {
    const url = new URL(href);
    if (url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";
  const stripped = input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const out: string[] = [];
  const re = /<\/?([a-z0-9]+)([^>]*)>/gi;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(stripped))) {
    out.push(stripped.slice(last, match.index));
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
      out.push(`<a href="${href}" rel="noopener noreferrer" target="_blank">`);
      continue;
    }
    out.push(`<${name}>`);
  }
  out.push(stripped.slice(last));
  return out.join("").slice(0, 80_000);
}

export function firstSentence(text: string, max = 240): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const cut = clean.match(/^(.{40,240}?[.!?])\s/)?.[1] ?? clean.slice(0, max);
  return cut.trim();
}
