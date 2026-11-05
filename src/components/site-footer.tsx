import Link from "next/link";
import { hasSupabase } from "@/lib/backend";

export function SiteFooter() {
  return (
    <footer className="page mt-auto pb-10 pt-16">
      <div className="border-t border-[rgba(59,31,18,0.16)] pt-6">
        <p className="text-small font-bold">No money passes through FurniCycle. Buyers and sellers deal directly.</p>
        <nav aria-label="Footer" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-small text-muted-foreground">
          <Link className="underline underline-offset-4 hover:text-brand" href="/explore">Explore</Link>
          <Link className="underline underline-offset-4 hover:text-brand" href="/explore?free=1">Free to collect</Link>
          <Link className="underline underline-offset-4 hover:text-brand" href="/sell">Sell or give away</Link>
          <Link className="underline underline-offset-4 hover:text-brand" href="/#questions">Questions</Link>
          <a className="underline underline-offset-4 hover:text-brand" href="mailto:hello@furnicycle.in">hello@furnicycle.in</a>
        </nav>
        <p className="mt-4 text-small text-muted-foreground">
          Kerala only. Second-hand furniture only. Free, with no ads.
          {hasSupabase ? "" : " Demo mode: data stays in this browser."}
        </p>
      </div>
    </footer>
  );
}
