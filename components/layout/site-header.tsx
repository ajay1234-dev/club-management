import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { label: "Clubs", href: "#clubs" },
  { label: "Architecture", href: "#architecture" },
  { label: "Docs", href: "#docs" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-black/10 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl border border-black/10 bg-white text-sm font-semibold shadow-sm">
            CCH
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide text-black">Campus Club Hub</span>
            <span className="text-xs text-black/55">All 11 clubs. One portal.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-black/65 hover:text-black">
              {link.label}
            </a>
          ))}
          <Badge
            variant="secondary"
            className="rounded-full border-black/10 bg-black/5 text-black/70"
          >
            Phase 1 Foundation
          </Badge>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" className="rounded-full px-5">
            <Link href="/signup">Create account</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
