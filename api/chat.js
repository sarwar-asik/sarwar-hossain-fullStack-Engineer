/* global process */
import profile from "../src/data/profile.json";
import experience from "../src/data/experience.json";
import projects from "../src/data/projects.json";
import skills from "../src/data/skills.json";
import challenges from "../src/data/challenges.json";

export const config = { runtime: "edge" };

function buildSystemPrompt() {
  const social = profile.social.map((s) => `${s.name}: ${s.url}`).join(", ");
  const stats = profile.stats.map((s) => `${s.value} ${s.label}`).join(", ");

  const exp = experience
    .map((e) => {
      const ach = e.achievements.join(" | ");
      return `${e.role} at ${e.company} (${e.period}): ${ach} Stack: ${e.tech.join(", ")}.`;
    })
    .join("\n");

  const proj = projects
    .map((p) => {
      const live = p.liveUrl ? ` Live: ${p.liveUrl}.` : "";
      return `${p.title}: ${p.description} Impact: ${p.impact}. Tech: ${p.tech.join(", ")}.${live}`;
    })
    .join("\n");

  const skillList = skills.map((s) => `${s.category}: ${s.items.map((item) => item.name ?? item).join(", ")}`).join("\n");

  const inc = challenges
    .map((c) => {
      const topMetric = c.metrics[0];
      return `[${c.severity} · ${c.date}] ${c.title}: ${c.summary} Fix: ${c.resolution} Result: ${topMetric.label} ${topMetric.before} → ${topMetric.after}.`;
    })
    .join("\n");

  return `You are an AI assistant embedded in ${profile.name}'s developer portfolio. Speak in first person as ${profile.initials} — warm, confident, direct, like talking to a potential collaborator.

PROFILE
Name: ${profile.name} | Role: ${profile.role} | Location: ${profile.location}
Email: ${profile.email} | Resume: ${profile.resumeUrl}
Available for hire: ${profile.available ? "Yes, actively open to new opportunities" : "Not currently available"}
Bio: ${profile.bio}
Social: ${social}
Stats: ${stats}

WORK EXPERIENCE
${exp}

PROJECTS
${proj}

SKILLS
${skillList}

ENGINEERING INCIDENTS I RESOLVED
${inc}

RULES — follow every one:
1. First person only: "I built", "my stack", "I solved" — never third-person
2. 2–3 sentences maximum per reply — stay concise
3. For hire / contact questions → share ${profile.email}, say I'm actively open to opportunities
4. For resume → share ${profile.resumeUrl}
5. Only answer professional and portfolio-related questions
6. Off-topic questions → politely say that falls outside what I discuss here and invite them to ask about my work
7. No markdown, no bullet points, no lists — plain conversational sentences only`;
}

export const SYSTEM = buildSystemPrompt();

export default async function handler(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let messages;
  try {
    ({ messages } = await req.json());
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const history = Array.isArray(messages) ? messages.slice(-8) : [];

  let groqRes;
  try {
    groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "system", content: SYSTEM }, ...history],
        stream: true,
        max_tokens: 200,
        temperature: 0.75,
      }),
    });
  } catch {
    return new Response("Service unavailable", { status: 502 });
  }

  if (groqRes.status === 429) {
    return new Response("rate_limited", { status: 429 });
  }

  if (!groqRes.ok) {
    return new Response("Upstream error", { status: 502 });
  }

  return new Response(groqRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
