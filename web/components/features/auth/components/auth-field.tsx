import { cn } from "@/lib/utils";

export function AuthFieldShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-[52px] w-full items-center gap-2.5 rounded-2xl bg-white px-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AuthFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-sm">{message}</p>;
}

export function AuthFieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-base font-semibold tracking-[0.01em] text-[#185b50]"
    >
      {children}
    </label>
  );
}

export function AuthRequiredLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-start gap-1 text-base font-semibold tracking-[0.01em]"
    >
      <span className="text-[#185b50]">{children}</span>
      <span className="text-[#fd3018]" aria-hidden>
        *
      </span>
    </label>
  );
}
