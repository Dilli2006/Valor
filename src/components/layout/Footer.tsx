import Link from "next/link";
import { ValorLogo } from "./Navbar";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line/80 bg-surface/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <ValorLogo />
            <span className="font-display font-bold text-base text-fg tracking-tight">Valor.AI</span>
          </div>
          <p className="mt-3 max-w-xs text-xs text-muted leading-relaxed">
            Autonomous mobile engineering engine. Empowering aspiring builders to transition from idea to production-ready Expo apps.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-fg">Valor AppStudio</h4>
          <ul className="mt-3 space-y-2 text-xs text-muted">
            <li>
              <Link className="hover:text-accent transition-colors" href="/">
                Create New App
              </Link>
            </li>
            <li>
              <Link className="hover:text-accent transition-colors" href="/projects">
                Saved Projects
              </Link>
            </li>
            <li>
              <Link className="hover:text-accent transition-colors" href="/disclosure">
                AI & Safety Disclosure
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-fg">Engineering Stages</h4>
          <ul className="mt-3 space-y-2 text-xs text-muted">
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-accent" />
              <span>Understand & Scope</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-accent" />
              <span>Architecture Planning</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-accent" />
              <span>3-Phase Staged Build</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-accent" />
              <span>Explain & Tutor</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-accent" />
              <span>Curriculum & Quiz</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-fg">Responsible AI</h4>
          <p className="mt-3 text-xs text-muted leading-relaxed">
            All code is generated strictly within dependency allow-lists and sandboxed runtimes. Verify and test thoroughly before real-world production deployment.
          </p>
        </div>
      </div>

      <div className="border-t border-line py-5 text-center text-xs text-subtle">
        © 2026 Valor.AI Systems. All rights reserved.
      </div>
    </footer>
  );
}
