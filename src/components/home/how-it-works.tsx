const STEPS = [
  {
    title: "Put up your furniture",
    text: "Add a photo, the price or “free”, and your town. The AI suggests what it is and a fair price.",
  },
  {
    title: "Someone nearby finds it",
    text: "Buyers search by district, price and type, and message you directly on WhatsApp or call.",
  },
  {
    title: "They collect it",
    text: "You agree the price and a pickup time between yourselves, then mark it sold in one tap.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="page py-14 md:py-20">
      <h2 id="how-heading" className="text-head">
        How it works
      </h2>
      <ol data-reveal className="mt-6 grid gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="paper relative p-5 pl-16">
            <span
              className="absolute top-5 left-5 flex size-7 items-center justify-center rounded-full border-2 border-stamp text-small font-bold text-stamp"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <h3 className="text-lead">{s.title}</h3>
            <p className="mt-1 text-body text-ink-soft">{s.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
