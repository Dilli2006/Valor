"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Smartphone, FolderOpen, ShieldCheck, Sparkles, Layers, Zap } from "lucide-react";
import { ThemeToggle } from "./ThemeSync";
import { cn } from "@/lib/utils";

export function ValorLogo({ size = 28 }: { size?: number }) {
  return (
    <span
      className="grid place-items-center rounded-xl bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] ring-1 ring-accent/30 shadow-md shadow-accent/20"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        {/* Modern Valor V Emblem with geometric bevel */}
        <path
          d="M3 4L12 21L21 4H16.5L12 14L7.5 4H3Z"
          fill="url(#valorGrad)"
        />
        <path
          d="M12 21L7.5 4H9.5L12 15.5L14.5 4H16.5L12 21Z"
          fill="#38bdf8"
          opacity="0.4"
        />
        <defs>
          <linearGradient id="valorGrad" x1="3" y1="4" x2="21" y2="21">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

const LINKS = [
  { href: "/", label: "Studio", icon: Home },
  { href: "/projects", label: "My Projects", icon: FolderOpen },
  { href: "/disclosure", label: "AI Transparency", icon: ShieldCheck },
];

export function Navbar() {
  const pathname = usePathname();
  const [ai, setAi] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setAi(!!d.aiConfigured))
      .catch(() => setAi(false));
  }, []);

  const inWorkspace = pathname.startsWith("/project/");

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-2xl">
      <nav
        className={cn(
          "mx-auto flex h-14 items-center gap-6 px-4 sm:px-6",
          inWorkspace ? "max-w-none" : "max-w-7xl"
        )}
        aria-label="Main"
      >
        {/* Brand identity: Valor AI */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="Valor AI home">
          <ValorLogo />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-[16px] font-bold tracking-tight text-fg group-hover:text-accent transition-colors">
                Valor<span className="text-gradient">.AI</span>
              </span>
              <span className="rounded-md border border-accent-line/40 bg-accent-soft px-1.5 py-0.2 text-[9.5px] font-bold uppercase tracking-wider text-accent">
                AppStudio
              </span>
            </div>
          </div>
        </Link>

        {/* Center Nav Navigation */}
        <div className="mx-auto hidden items-center gap-1.5 md:flex bg-surface-2/60 p-1 rounded-xl border border-line/60">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition",
                  active
                    ? "bg-surface text-accent shadow-sm border border-line"
                    : "text-muted hover:text-fg hover:bg-surface/50"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={13} />
                <span>{label}</span>
              </Link>
            );
          })}
          <div className="h-3.5 w-px bg-line mx-1" />
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-subtle font-mono">
            <Zap size={11} className="text-accent" />
            <span>Mobile 6-Stage</span>
          </span>
        </div>

        {/* Right Nav Actions */}
        <div className="ml-auto flex items-center gap-2.5 md:ml-0">
          <span
            className={cn(
              "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:flex",
              ai
                ? "border-success/30 text-success bg-success/5"
                : ai === false
                ? "border-warning/30 text-warning bg-warning/5"
                : "border-line text-subtle"
            )}
            title={
              ai
                ? "Gemini model is online and ready"
                : "Zero-key sample mode active"
            }
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                ai ? "bg-success" : ai === false ? "bg-warning" : "bg-subtle"
              )}
            />
            {ai ? "AI Core Ready" : ai === false ? "Offline Sandbox" : "Connecting..."}
          </span>

          <ThemeToggle />

          <Link href="/" className="btn-primary btn-sm hidden sm:inline-flex">
            <Sparkles size={13} />
            <span>New App</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
