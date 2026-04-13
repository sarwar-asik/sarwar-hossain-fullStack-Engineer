import { useState } from "react";
import Icon from "../ui/Icon";
import profile from "../../data/profile.json";

const WHATSAPP_NUM = "8801602819933"; // +880 1602 819933 without + and spaces
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUM}?text=Hi%20Sarwar%2C%20I%20came%20across%20your%20portfolio%20and%20wanted%20to%20connect.`;

const CONTACT_METHODS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: "+880 1602 819933",
    href: WHATSAPP_URL,
    icon: "whatsapp",
    color: "#25d366",
    bgColor: "rgba(37,211,102,0.08)",
    borderColor: "rgba(37,211,102,0.25)",
    newTab: true,
  },
  {
    id: "email",
    label: "Email",
    value: "sarwarasik@gmail.com",
    href: `mailto:${profile.email}`,
    icon: "mail",
    color: "#f59e0b",
    bgColor: "rgba(245,158,11,0.08)",
    borderColor: "rgba(245,158,11,0.25)",
    copyable: true,
    newTab: false,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: "/in/sarwar-asik",
    href: profile.social.find((s) => s.name === "LinkedIn")?.url ?? "#",
    icon: "linkedin",
    color: "#0a66c2",
    bgColor: "rgba(10,102,194,0.08)",
    borderColor: "rgba(10,102,194,0.25)",
    newTab: true,
  },
  {
    id: "github",
    label: "GitHub",
    value: "/sarwar-asik",
    href: profile.social.find((s) => s.name === "GitHub")?.url ?? "#",
    icon: "github",
    color: "#e4e4e7",
    bgColor: "rgba(228,228,231,0.06)",
    borderColor: "rgba(228,228,231,0.18)",
    newTab: true,
  },
];

function ContactCard({ method }) {
  const [copied, setCopied] = useState(false);

  function handleCopy(e) {
    if (!method.copyable) return;
    e.preventDefault();
    navigator.clipboard.writeText(method.value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <a
      href={method.href}
      target={method.newTab ? "_blank" : undefined}
      rel={method.newTab ? "noopener noreferrer" : undefined}
      onClick={method.copyable ? handleCopy : undefined}
      className="group relative flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: method.borderColor,
        backgroundColor: method.bgColor,
      }}
      aria-label={`Contact via ${method.label}`}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${method.color}18`, color: method.color }}>
        <Icon name={method.icon} className="w-5 h-5" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-[10px] text-zinc-600 mb-0.5">{method.label}</p>
        <p className="text-sm font-medium text-zinc-200 truncate">{method.value}</p>
      </div>

      {/* Action */}
      <div className="shrink-0">
        {method.copyable ? (
          <span className="flex items-center gap-1 font-mono text-[10px] transition-colors" style={{ color: copied ? "#22c55e" : method.color }}>
            <Icon name={copied ? "check" : "copy"} className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Copy"}
          </span>
        ) : (
          <Icon name="arrowRight" className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
        )}
      </div>
    </a>
  );
}

export default function Contact() {
  const qrTarget = WHATSAPP_URL;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrTarget)}&color=ffffff&bgcolor=18181b&margin=10&format=svg`;

  return (
    <section id="contact" className="py-24 bg-zinc-900 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-5">
            <span className="font-mono text-xs text-amber-500">// 08 · contact</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">Reach Me Directly</h2>
          <p className="mt-3 text-zinc-500 max-w-lg leading-relaxed text-sm">
            Available for new opportunities, freelance work, or a good technical conversation. I typically respond within a few hours.
          </p>

          {/* Availability badge */}
          {profile.available && (
            <div className="mt-5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-emerald-400 border border-emerald-500/25 rounded-md px-3 py-1.5 bg-emerald-500/5 max-w-full">
              <span className="flex items-center gap-2 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                open_to_work = true
              </span>
              <span className="whitespace-nowrap text-emerald-600">· response within 24 hrs</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-10 items-start">
          {/* ── Left: contact method cards ── */}
          <div>
            <p className="font-mono text-xs text-zinc-600 mb-4">// pick your channel</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {CONTACT_METHODS.map((m) => (
                <ContactCard key={m.id} method={m} />
              ))}
            </div>

            {/* Location + timezone */}
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-zinc-600">
              <span className="flex items-center gap-1.5">
                <Icon name="mapPin" className="w-3.5 h-3.5 text-amber-500/60" />
                Dhaka, Bangladesh (UTC+6)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Best hours: 9 AM – 11 PM
              </span>
            </div>
          </div>

          {/* ── Right: QR code + resume ── */}
          <div className="flex flex-col gap-4">
            {/* QR card */}
            <div className="flex flex-col items-center gap-4 p-6 rounded-lg border border-zinc-800 bg-zinc-950/50">
              <p className="font-mono text-[10px] text-zinc-600 self-start">// scan_to_connect()</p>

              {/* QR code image */}
              <div className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-700">
                <img src={qrSrc} alt="Scan to open WhatsApp" width={160} height={160} loading="lazy" className="rounded block" style={{ imageRendering: "pixelated" }} />
                {/* WhatsApp overlay badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 rounded-full px-2.5 py-0.5 whitespace-nowrap">
                  <Icon name="whatsapp" className="w-3 h-3 text-[#25d366]" />
                  <span className="font-mono text-[9px] text-zinc-500">WhatsApp</span>
                </div>
              </div>

              <p className="font-mono text-[10px] text-zinc-600 text-center mt-2">Opens chat on WhatsApp</p>
            </div>

            {/* Resume card */}
            <a
              href={profile.resumeUrl !== "#" ? profile.resumeUrl : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                <Icon name="download" className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-200">Download Resume</p>
                <p className="font-mono text-[10px] text-zinc-600 mt-0.5">PDF · Backend Engineer</p>
              </div>
              <Icon name="arrowRight" className="w-4 h-4 text-amber-500/60 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
