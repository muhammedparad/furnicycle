import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FurniCycle — second-hand furniture in Kerala",
    template: "%s · FurniCycle",
  },
  description:
    "Sell, give away or find used furniture across Kerala. List in a minute, talk to the owner on WhatsApp, collect it yourself.",
};

export const viewport: Viewport = {
  themeColor: "#ffe6c9",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </AuthProvider>
        <RevealOnScroll />
        <Toaster theme="light" position="bottom-center" />
      </body>
    </html>
  );
}
