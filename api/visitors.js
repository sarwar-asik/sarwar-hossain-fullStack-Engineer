/* global process */
export const config = { runtime: "edge" };

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const MIN_COUNT = 500;
const LOG_KEY = "portfolio:visits:log";
const LOG_CAP = 5000; // keep newest 5000 visit records

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
    return new Response(JSON.stringify({ count: MIN_COUNT }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  // ── Unique-visitor dedup (IP, 24 h TTL) ──
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const totalKey = "portfolio:visits:total";
  const ipKey = `portfolio:visits:ip:${ip}`;
  const isNew = !(await redis("get", ipKey));

  let count;
  if (isNew) {
    await redis("setex", ipKey, "86400", "1");
    count = Number(await redis("incr", totalKey));
  } else {
    count = parseInt(await redis("get", totalKey), 10) || 0;
  }

  // Enforce floor — preserve raw for debug
  const rawCount = count;
  if (count < MIN_COUNT) {
    await redis("set", totalKey, String(MIN_COUNT));
    count = MIN_COUNT;
  }

  // ── Build analytics payload ──
  const ua = req.headers.get("user-agent") ?? "";
  const referer = req.headers.get("referer") ?? "";
  const country = req.headers.get("x-vercel-ip-country") ?? "XX";
  const city = decodeURIComponent(req.headers.get("x-vercel-ip-city") ?? "") || "unknown";
  const ts = Date.now();
  const day = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const ref = parseRefDomain(referer);
  const device = parseDevice(ua);
  const browser = parseBrowser(ua);
  const os = parseOS(ua);

  const payload = JSON.stringify({ ts, country, city, ref, device, browser, os, new: isNew });

  // ── Persist (one pipeline round-trip) ──
  const writes = [
    // Chronological visit log, capped at LOG_CAP entries (score = timestamp)
    ["ZADD", LOG_KEY, String(ts), payload],
    ["ZREMRANGEBYRANK", LOG_KEY, "0", String(-(LOG_CAP + 1))],
  ];

  if (isNew) {
    // Bucketed counters — unique visitors only, fast O(1) reads later
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

  return new Response(JSON.stringify({ count, _d: rawCount }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    },
  });
}
