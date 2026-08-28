import Image from "next/image";

import { comingSoonAssets } from "@/components/features/coming-soon/assets";
import { ComingSoonSignupForm } from "@/components/features/coming-soon/components/coming-soon-signup-form";
import { FooterSection } from "@/components/features/landing/components/footer-section";

export function ComingSoonPageView() {
  return (
    <>
      <main className="bg-background relative min-h-screen overflow-hidden">
        <Image
          src={comingSoonAssets.background}
          alt=""
          fill
          priority
          className="pointer-events-none object-cover"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="from-background/55 via-background/40 to-background/80 absolute inset-0 bg-gradient-to-b"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_color-mix(in_oklab,var(--nova-teal)_25%,transparent)_100%)]"
        />

        <div className="relative z-10 flex min-h-screen flex-col px-6 pt-28 pb-10 md:px-12 lg:pt-40">
          <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center py-12 text-center">
            <div className="border-foreground/10 bg-card/70 rounded-3xl border px-8 py-12 shadow-lg backdrop-blur-xl sm:px-12 sm:py-16">
              <span className="border-nova-gold/40 bg-background/60 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] tracking-[0.35em] uppercase">
                <span className="bg-nova-gold size-1.5 animate-pulse rounded-full" />
                In Progress
              </span>

              <h1 className="font-display text-foreground text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                System Enhancement
                <br />
                <span className="text-primary italic">in Progress.</span>
              </h1>

              <div
                aria-hidden
                className="via-nova-gold mx-auto my-7 h-px w-16 bg-gradient-to-r from-transparent to-transparent"
              />

              <p className="text-muted-foreground mx-auto max-w-lg text-base leading-relaxed sm:text-lg">
                We are currently upgrading our online experience to deliver a
                higher standard of digital wellness tracking, insights, and
                care.
              </p>

              <ComingSoonSignupForm />
            </div>
          </section>
        </div>

      </main>
      <FooterSection />
    </>
  );
}
