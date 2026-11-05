import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="page py-24 md:py-36">
      <h1 className="text-head">Nothing here</h1>
      <p className="mt-4 text-muted-foreground">This page has moved on, like a good sofa.</p>
      <Link href="/explore" className={`${buttonVariants()} mt-8`}>
        Explore furniture
      </Link>
    </main>
  );
}
