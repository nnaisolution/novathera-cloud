"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { useForgotPassword } from "../hooks/use-forgot-password";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/forgot-password.schema";

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

export function ForgotPasswordForm() {
  const { requestReset, isPending, error, isSuccess } = useForgotPassword();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  if (isSuccess) {
    return (
      <div className="flex w-full flex-col gap-5">
        <p className="rounded-2xl bg-white px-4 py-3 text-sm text-[#222]">
          If an account exists for that email, we sent a password reset link.
          Check your inbox and spam folder.
        </p>
        <Link
          href="/login"
          className="text-center text-base font-semibold text-[#185b50] underline underline-offset-2"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(requestReset)}
      className="flex w-full flex-col gap-5"
    >
      {error ? (
        <p className="text-destructive rounded-2xl bg-red-50 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-base font-semibold tracking-[0.01em] text-[#185b50]"
        >
          Email Address
        </Label>
        <FieldShell>
          <Mail className="size-6 shrink-0 text-[#185b50]" aria-hidden />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            className="h-auto border-0 bg-transparent p-0 text-base tracking-[0.01em] text-[#222] shadow-none placeholder:text-[#222]/70 focus-visible:ring-0 md:text-base"
            {...register("email")}
          />
        </FieldShell>
        <FieldError message={errors.email?.message} />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-[52px] w-full rounded-2xl bg-[#185b50] px-[30px] text-base font-normal text-white hover:bg-[#185b50]/90"
      >
        {isPending ? "Sending..." : "Send reset link"}
      </Button>

      <p className="text-center text-base tracking-[0.01em] text-[#222]">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#185b50] underline underline-offset-2 hover:opacity-90"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
