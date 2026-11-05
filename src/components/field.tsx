import { cn } from "@/lib/utils";

/** Native select styled like the shadcn input: simplest, accessible, and good on phones. */
export function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-11 w-full appearance-none rounded-xl border border-input bg-paper pr-9 pl-3 text-ink text-base transition-colors outline-none focus-visible:border-ring disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="m1 1.5 5 5 5-5" />
      </svg>
    </div>
  );
}

export function FieldHint({ id, children, error }: { id?: string; children: React.ReactNode; error?: boolean }) {
  return (
    <p id={id} className={cn("text-small", error ? "text-destructive" : "text-muted-foreground")}>
      {children}
    </p>
  );
}
