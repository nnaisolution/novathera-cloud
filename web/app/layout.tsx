import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { ScrollToTopButton } from "@/components/shared/scroll-to-top-button";
import { SiteHeaderShell } from "@/components/shared/site-header-shell";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nova Thera | AI-Powered Integrative Wellness",
  description:
    "Advanced aesthetics, recovery therapies, diagnostics, and biohacking — personalized through data, science, and holistic care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppProviders>
          <ScrollToTop />
          <SiteHeaderShell />
          {children}
          <ScrollToTopButton />
        </AppProviders>
      </body>
    </html>
  );
}
