import Link from "next/link";
import { HeroStrip } from "@/components/home/hero-strip";
import { HowItWorks } from "@/components/home/how-it-works";
import { JustListed } from "@/components/home/just-listed";
import { PriceCheck } from "@/components/home/price-check";
import { buttonVariants } from "@/components/ui/button";
import { CATEGORIES, DISTRICTS } from "@/lib/constants";

const RULES: [string, string][] = [
  ["Furniture only.", "Sofas, cots, tables, wardrobes and the like. No appliances, no new stock from shops."],
  ["You deal directly.", "Buyers contact you on WhatsApp or phone. FurniCycle never takes money or holds deposits."],
  ["See it first.", "Check it in person before paying. Never send money for something you have not seen."],
];

const FAQ: [string, string][] = [
  ["Does it cost anything?", "No. Listing, browsing and contacting sellers are free."],
  ["Who moves the furniture?", "The buyer collects, unless you agree otherwise. Mention stairs and whether it comes apart."],
  ["Can I give things away?", "Yes. Switch on “Give it away free” when you list. Free things are often gone in a day."],
  ["How does the AI price work?", "Add a photo and FurniCycle suggests what it is, its condition and a fair price range."],
  ["Is my number shown?", "Only the number you put on a listing, so buyers can reach you. Your email is never shown."],
  ["What happens when it sells?", "Mark it sold from your account. It leaves search but stays in your history."],
];

export default function HomePage() {
  return (
    <main>
      <HeroStrip />

      <HowItWorks />

      <PriceCheck />

      <JustListed />

      <section aria-labelledby="browse-heading" className="page py-14 md:py-20">
        <h2 id="browse-heading" className="text-head">
          Browse by what or where
        </h2>
        <div data-reveal className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="paper p-5">
            <h3 className="text-lead">Furniture</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <li key={c.value}>
                  <Link
                    href={`/explore?category=${c.value}`}
                    className="inline-flex h-9 items-center rounded-full bg-[#fbefe0] px-3.5 font-medium transition-colors hover:bg-stamp hover:text-paper"
                  >
                    {c.plural}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="paper p-5">
            <h3 className="text-lead">Districts</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {DISTRICTS.map((d) => (
                <li key={d.name}>
                  <Link
                    href={`/explore?district=${d.name}`}
                    className="inline-flex h-9 items-center rounded-full bg-[#fbefe0] px-3.5 font-medium transition-colors hover:bg-stamp hover:text-paper"
                  >
                    {d.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="rules-heading" className="page py-14 md:py-20">
        <h2 id="rules-heading" className="text-head">
          The rules
        </h2>
        <ul data-reveal className="mt-6 grid gap-6 md:grid-cols-3">
          {RULES.map(([title, text]) => (
            <li key={title} className="flex gap-3">
              <span className="mt-1.5 size-3 shrink-0 rounded-full bg-brand" aria-hidden="true" />
              <p className="text-body">
                <strong className="font-bold">{title}</strong> <span className="text-muted-foreground">{text}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="questions" aria-labelledby="faq-heading" className="page py-14 md:py-20">
        <h2 id="faq-heading" className="text-head">
          Questions
        </h2>
        <div data-reveal className="mt-6 grid gap-4 md:grid-cols-2">
          {FAQ.map(([q, a]) => (
            <div key={q} className="paper p-5">
              <h3 className="text-lead">{q}</h3>
              <p className="mt-1 text-body text-ink-soft">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="cta-heading" className="page py-16 md:py-24">
        <div data-reveal className="paper flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <h2 id="cta-heading" className="max-w-[24ch] text-head">
            Got a cot, a sofa or a shelf you no longer need?
          </h2>
          <Link href="/sell" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            List it in a minute
          </Link>
        </div>
      </section>
    </main>
  );
}
