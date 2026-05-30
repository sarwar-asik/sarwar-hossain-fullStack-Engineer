/* global process */
export const config = { runtime: "edge" };

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redis(cmd, ...args) {
  const path = [cmd, ...args].map(encodeURIComponent).join("/");
  const res = await fetch(`${REDIS_URL}/${path}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  const { result } = await res.json();
  return result;
}

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
    return new Response(JSON.stringify({ count: 0 }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const totalKey = "portfolio:visits:total";
  const ipKey = `portfolio:visits:ip:${ip}`;

  const alreadyVisited = await redis("get", ipKey);

  let count;
  if (!alreadyVisited) {
    await redis("setex", ipKey, "86400", "1");
    count = await redis("incr", totalKey);
  } else {
    count = parseInt(await redis("get", totalKey), 10) || 0;
  }

  return new Response(JSON.stringify({ count: Number(count) }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    },
  });
}
