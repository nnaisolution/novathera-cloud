"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

import { GoogleIcon } from "@/components/features/auth/components/google-icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { useLogin } from "../hooks/use-login";
import { loginSchema, type LoginFormValues } from "../schemas/login.schema";

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

export function LoginForm() {
  const {
    login,
    loginWithGoogle,
    loginWithApple,
    loginWithFacebook,
    isPending,
    isGooglePending,
    isApplePending,
    isFacebookPending,
    isSocialPending,
    error,
  } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const isBusy = isPending || isSocialPending;

  return (
    <form onSubmit={handleSubmit(login)} className="flex w-full flex-col gap-5">
      {error ? (
        <p className="text-destructive rounded-2xl bg-red-50 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3.5">
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

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="password"
            className="text-base font-semibold tracking-[0.01em] text-[#185b50]"
          >
            Password
          </Label>
          <FieldShell>
            <LockKeyhole
              className="size-6 shrink-0 text-[#185b50]"
              aria-hidden
            />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-auto border-0 bg-transparent p-0 text-base tracking-[0.01em] text-[#222] shadow-none placeholder:text-[#222]/70 focus-visible:ring-0 md:text-base"
              {...register("password")}
            />
          </FieldShell>
          <FieldError message={errors.password?.message} />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Controller
            name="rememberMe"
            control={control}
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-2.5">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  className="size-6 rounded-[6px] border-[1.5px] border-[#185b50] data-checked:border-[#185b50] data-checked:bg-[#185b50]"
                />
                <span className="text-base tracking-[0.01em] text-[#222]">
                  Remember Me
                </span>
              </label>
            )}
          />
          <Link
            href="/forgot-password"
            className="shrink-0 text-base tracking-[0.01em] text-[#222] underline underline-offset-2 hover:text-[#185b50]"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isBusy}
        className="h-[52px] w-full rounded-2xl bg-[#185b50] px-[30px] text-base font-normal text-white hover:bg-[#185b50]/90"
      >
        {isPending ? "Signing in..." : "Login"}
      </Button>

      <div className="flex w-full items-center gap-[30px]">
        <div className="min-w-0 flex-1">
          <Separator className="bg-[#222]/20" />
        </div>
        <span className="text-base tracking-[0.01em] text-[#222]">or</span>
        <div className="min-w-0 flex-1">
          <Separator className="bg-[#222]/20" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={loginWithGoogle}
          className="h-[52px] w-full rounded-2xl border-0 bg-white px-[30px] text-base font-semibold text-[#185b50] hover:bg-white/90 hover:text-[#185b50]"
        >
          <GoogleIcon className="size-5" />
          {isGooglePending ? "Connecting..." : "Login with Google"}
        </Button>

        <p className="text-center text-base tracking-[0.01em] text-[#222]">
          Don&apos;t you have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#185b50] underline underline-offset-2 hover:opacity-90"
          >
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
}
