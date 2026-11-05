import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { FurnitureArt } from "@/components/furniture-art";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <main className="page grid gap-12 pb-28 pt-10 md:grid-cols-12 md:gap-8 md:pt-16">
      <div className="md:col-span-5">
        <h1 className="text-head">Log in</h1>
        <p className="mt-4 text-muted-foreground">One account to sell, give away and save furniture.</p>
        <div className="paper mt-8 p-6">
          <Suspense>
            <AuthForm mode="login" />
          </Suspense>
        </div>
      </div>
      <div className="paper hidden overflow-hidden p-3 md:col-span-6 md:col-start-7 md:block">
        <FurnitureArt category="sofa" seed={3} className="drift aspect-[4/5] w-full rounded-2xl" label="Drawing of a sofa" />
      </div>
    </main>
  );
}
