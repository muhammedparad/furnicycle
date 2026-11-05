import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { FurnitureArt } from "@/components/furniture-art";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <main className="page grid gap-12 pb-28 pt-10 md:grid-cols-12 md:gap-8 md:pt-16">
      <div className="md:col-span-5">
        <h1 className="text-head">Create an account</h1>
        <p className="mt-4 text-muted-foreground">Free. Takes a minute. Then list as many pieces as you like.</p>
        <div className="paper mt-8 p-6">
          <Suspense>
            <AuthForm mode="register" />
          </Suspense>
        </div>
      </div>
      <div className="paper hidden overflow-hidden p-3 md:col-span-6 md:col-start-7 md:block">
        <FurnitureArt category="wardrobe" seed={11} className="drift aspect-[4/5] w-full rounded-2xl" label="Drawing of a wardrobe" />
      </div>
    </main>
  );
}
