import { HomePageV2FooterSection } from "@/components/features/home-page-v2/components/home-page-v2-footer-section";

import { AccountHeader } from "./account-header";
import { AccountSidebarNav } from "./account-sidebar-nav";
import { AccountWelcomeBanner } from "./account-welcome-banner";

export function AccountShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#faf7ee]">
      <AccountHeader />

      <main className="flex flex-1 flex-col gap-10 px-6 py-16 md:px-10 lg:px-[160px] lg:py-[100px]">
        <AccountWelcomeBanner />

        <div className="flex flex-col items-start gap-10 lg:flex-row">
          <AccountSidebarNav />
          <div className="flex w-full min-w-0 flex-1 flex-col gap-10">
            {children}
          </div>
        </div>
      </main>

      <HomePageV2FooterSection />
    </div>
  );
}
