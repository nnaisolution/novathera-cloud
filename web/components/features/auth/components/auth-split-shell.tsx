import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { LoginImageSlider } from "@/components/features/auth/components/login-image-slider";

type AuthSplitShellProps = {
  title: string;
  subtitle?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

export function AuthSplitShell({
  title,
  subtitle,
  contentClassName,
  children,
}: AuthSplitShellProps) {
  return (
    <div className="h-dvh overflow-hidden bg-[#faf7ee] p-3 sm:p-4 lg:p-6">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1840px] flex-col lg:flex-row lg:gap-6">
        <div className="hidden h-full min-h-0 lg:block lg:w-[48%] xl:w-[50%]">
          <LoginImageSlider className="size-full" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-2 py-1 sm:px-4 lg:px-10 xl:px-14">
          <div
            className={cn(
              "flex w-full max-w-[480px] flex-col items-center gap-5 py-2 lg:gap-6",
              contentClassName,
            )}
          >
            <Link href="/" className="shrink-0">
              <Image
                src="/branding/logo_dark.svg"
                alt="NovaThera"
                width={246}
                height={60}
                className="h-10 w-auto sm:h-12"
                priority
              />
            </Link>

            <div className="flex w-full flex-col items-center gap-1.5 text-center">
              <h1 className="font-display text-[28px] leading-tight tracking-[0.01em] text-[#185b50] sm:text-[36px] lg:text-[40px]">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-sm leading-snug tracking-[0.01em] text-[#222] sm:text-base">
                  {subtitle}
                </p>
              ) : null}
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
