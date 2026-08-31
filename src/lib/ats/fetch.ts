const USER_AGENT =
  "JobrowIndex/1.0 (+https://github.com/devtechedge/job-board; public employer ATS board index)";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
): Promise<{ ok: true; status: number; data: T } | { ok: false; status: number; body: string }> {
  let lastStatus = 0;
  let lastBody = "";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          accept: "application/json, text/plain;q=0.9, */*;q=0.1",
          "user-agent": USER_AGENT,
          ...(init.headers ?? {}),
        },
      });
      lastStatus = response.status;
      if (response.status === 429) {
        await sleep(1500 * 2 ** attempt);
        continue;
      }
      const text = await response.text();
      lastBody = text.slice(0, 400);
      if (!response.ok) {
        return { ok: false, status: response.status, body: lastBody };
      }
      if (!text) {
        return { ok: false, status: response.status, body: "empty body" };
      }
      try {
        return { ok: true, status: response.status, data: JSON.parse(text) as T };
      } catch {
        return { ok: false, status: response.status, body: "invalid json" };
      }
    } catch (error) {
      lastBody = error instanceof Error ? error.message : "fetch failed";
      lastStatus = 0;
      const aborted =
        (error instanceof Error && error.name === "AbortError") ||
        /aborted|timeout/i.test(lastBody);
      if (aborted) {
        return { ok: false, status: 0, body: "timeout" };
      }
      await sleep(300 * 2 ** attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, status: lastStatus, body: lastBody || "request failed" };
}

const hostClocks = new Map<string, number>();

export async function paceHost(url: string, minGapMs = 180): Promise<void> {
  let host = "unknown";
  try {
    host = new URL(url).host;
  } catch {
    /* ignore */
  }
  const last = hostClocks.get(host) ?? 0;
  const wait = last + minGapMs - Date.now();
  if (wait > 0) await sleep(wait);
  hostClocks.set(host, Date.now());
}
