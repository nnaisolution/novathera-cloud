"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { useResetPassword } from "../hooks/use-reset-password";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/reset-password.schema";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-destructive text-sm">{message}</p>;
}

function FieldShell({
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

export function ResetPasswordForm() {
  const { resetPassword, isPending, error, hasToken } = useResetPassword();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  if (!hasToken) {
    return (
      <div className="flex w-full flex-col gap-5">
        <p className="text-destructive rounded-2xl bg-red-50 px-4 py-3 text-sm">
          This reset link is invalid or has expired. Request a new one to
          continue.
        </p>
        <Link
          href="/forgot-password"
          className="text-center text-base font-semibold text-[#185b50] underline underline-offset-2"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(resetPassword)}
      className="flex w-full flex-col gap-5"
    >
      {error ? (
        <p className="text-destructive rounded-2xl bg-red-50 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="password"
            className="text-base font-semibold tracking-[0.01em] text-[#185b50]"
          >
            New password
          </Label>
          <FieldShell className="justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <LockKeyhole
                className="size-6 shrink-0 text-[#185b50]"
                aria-hidden
              />
              <Input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter a new password"
                className="h-auto border-0 bg-transparent p-0 text-base tracking-[0.01em] text-[#222] shadow-none placeholder:text-[#222]/70 focus-visible:ring-0 md:text-base"
                {...register("password")}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-5 shrink-0 p-0 text-[#185b50] hover:bg-transparent hover:text-[#185b50]/80"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
              aria-label={
                isPasswordVisible ? "Hide password" : "Show password"
              }
            >
              {isPasswordVisible ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </Button>
          </FieldShell>
          <FieldError message={errors.password?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="confirmPassword"
            className="text-base font-semibold tracking-[0.01em] text-[#185b50]"
          >
            Confirm password
          </Label>
          <FieldShell className="justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <LockKeyhole
                className="size-6 shrink-0 text-[#185b50]"
                aria-hidden
              />
              <Input
                id="confirmPassword"
                type={isConfirmPasswordVisible ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm your new password"
                className="h-auto border-0 bg-transparent p-0 text-base tracking-[0.01em] text-[#222] shadow-none placeholder:text-[#222]/70 focus-visible:ring-0 md:text-base"
                {...register("confirmPassword")}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-5 shrink-0 p-0 text-[#185b50] hover:bg-transparent hover:text-[#185b50]/80"
              onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
              aria-label={
                isConfirmPasswordVisible
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {isConfirmPasswordVisible ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </Button>
          </FieldShell>
          <FieldError message={errors.confirmPassword?.message} />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-[52px] w-full rounded-2xl bg-[#185b50] px-[30px] text-base font-normal text-white hover:bg-[#185b50]/90"
      >
        {isPending ? "Updating..." : "Reset password"}
      </Button>
    </form>
  );
}
