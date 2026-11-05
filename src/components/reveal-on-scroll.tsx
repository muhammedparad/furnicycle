"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Lifts each section's parts into place the first time it scrolls into view. */
export function RevealOnScroll() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.classList.add("js-reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -10% 0px" },
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    scan();
    // Sections that render after their data loads appear later; watch for them too.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
  return null;
}
