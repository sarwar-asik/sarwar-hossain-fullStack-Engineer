/* global process */
export const config = { runtime: "edge" };

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const MIN_UNIQUE = 500;
const MIN_TOTAL = 620;
const UNIQUE_KEY = "portfolio:visits:total";
const PAGEVIEWS_KEY = "portfolio:visits:pageviews";
const LOG_KEY = "portfolio:visits:log";
const LOG_CAP = 5000;

// ── Redis helpers ────────────────────────────────────────────

async function redis(cmd, ...args) {
  const path = [cmd, ...args].map(encodeURIComponent).join("/");
  const res = await fetch(`${REDIS_URL}/${path}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  const { result } = await res.json();
  return result;
}

async function redisPipeline(commands) {
  await fetch(`${REDIS_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });
}

// ── UA / header parsers ──────────────────────────────────────

function parseRefDomain(referer) {
  if (!referer) return "direct";
  try {
    const { hostname } = new URL(referer);
    return hostname.replace(/^www\./, "") || "direct";
  } catch {
    return "direct";
  }
}

function parseDevice(ua) {
  if (!ua) return "unknown";
  if (/Mobile|Android|iPhone|iPod/i.test(ua)) return "mobile";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  return "desktop";
}

function parseBrowser(ua) {
  if (!ua) return "unknown";
  if (/Edg\//i.test(ua)) return "Edge";
  if (/Chrome\//i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua)) return "Safari";
  return "other";
}

function parseOS(ua) {
  if (!ua) return "unknown";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iOS/i.test(ua)) return "iOS";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "other";
}

// ── Handler ──────────────────────────────────────────────────

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  }

  if (!REDIS_URL || !REDIS_TOKEN) {
    return new Response(JSON.stringify({ total: MIN_TOTAL, unique: MIN_UNIQUE }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // Always increment total visits (every scroll-triggered call)
  let pageviews = Number(await redis("incr", PAGEVIEWS_KEY));

  // ── Unique-visitor dedup (IP, 24 h TTL) ──
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";

  const ipKey = `portfolio:visits:ip:${ip}`;
  const isNew = !(await redis("get", ipKey));

  let unique;
  if (isNew) {
    await redis("setex", ipKey, "86400", "1");
    unique = Number(await redis("incr", UNIQUE_KEY));
  } else {
    unique = parseInt(await redis("get", UNIQUE_KEY), 10) || 0;
  }

  // Apply floors
  const rawTotal = pageviews;
  const rawUnique = unique;

  if (pageviews < MIN_TOTAL) {
    await redis("set", PAGEVIEWS_KEY, String(MIN_TOTAL));
    pageviews = MIN_TOTAL;
  }
  if (unique < MIN_UNIQUE) {
    await redis("set", UNIQUE_KEY, String(MIN_UNIQUE));
    unique = MIN_UNIQUE;
  }
  // Logical invariant: total visits >= unique visitors
  const total = Math.max(pageviews, unique);

  // ── Build analytics payload ──
  const ua = req.headers.get("user-agent") ?? "";
  const referer = req.headers.get("referer") ?? "";
  const country = req.headers.get("x-vercel-ip-country") ?? "XX";
  const city = decodeURIComponent(req.headers.get("x-vercel-ip-city") ?? "") || "unknown";
  const ts = Date.now();
  const day = new Date().toISOString().slice(0, 10);

  const ref = parseRefDomain(referer);
  const device = parseDevice(ua);
  const browser = parseBrowser(ua);
  const os = parseOS(ua);

  const payload = JSON.stringify({ ts, country, city, ref, device, browser, os, new: isNew });

  // ── Persist (one pipeline round-trip) ──
  const writes = [
    ["ZADD", LOG_KEY, String(ts), payload],
    ["ZREMRANGEBYRANK", LOG_KEY, "0", String(-(LOG_CAP + 1))],
  ];

  if (isNew) {
    writes.push(
      ["INCR", `portfolio:stats:country:${country}`],
      ["INCR", `portfolio:stats:device:${device}`],
      ["INCR", `portfolio:stats:browser:${browser}`],
      ["INCR", `portfolio:stats:os:${os}`],
      ["INCR", `portfolio:stats:ref:${ref}`],
      ["INCR", `portfolio:stats:day:${day}`],
    );
  }

  await redisPipeline(writes);

  return new Response(JSON.stringify({ total, unique, _d: { rawTotal, rawUnique } }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    },
  });
}
