"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  AuthFieldError,
  AuthFieldShell,
  AuthRequiredLabel,
} from "@/components/features/auth/components/auth-field";
import { GoogleIcon } from "@/components/features/auth/components/google-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import {
  registerStep1Schema,
  type RegisterStep1Values,
} from "../schemas/register.schema";

type RegisterStep1FormProps = {
  defaultValues?: Partial<RegisterStep1Values>;
  onContinue: (values: RegisterStep1Values) => void;
  onGoogleSignUp: () => void;
  onAppleSignUp: () => void;
  onFacebookSignUp: () => void;
  isGooglePending?: boolean;
  isApplePending?: boolean;
  isFacebookPending?: boolean;
  isSocialPending?: boolean;
  error?: string | null;
};

export function RegisterStep1Form({
  defaultValues,
  onContinue,
  onGoogleSignUp,
  onAppleSignUp,
  onFacebookSignUp,
  isGooglePending = false,
  isApplePending = false,
  isFacebookPending = false,
  isSocialPending = false,
  error,
}: RegisterStep1FormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const form = useForm<RegisterStep1Values>({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: {
      email: defaultValues?.email ?? "",
      password: defaultValues?.password ?? "",
      confirmPassword: defaultValues?.confirmPassword ?? "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form
      onSubmit={handleSubmit(onContinue)}
      className="flex w-full flex-col gap-5"
    >
      {error ? (
        <p className="text-destructive rounded-2xl bg-red-50 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-2">
          <AuthRequiredLabel htmlFor="email">
            Username or Email
          </AuthRequiredLabel>
          <AuthFieldShell>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="novathera123"
              className="h-auto border-0 bg-transparent p-0 text-base tracking-[0.01em] text-[#222] shadow-none placeholder:text-[#222]/70 focus-visible:ring-0 md:text-base"
              {...register("email")}
            />
          </AuthFieldShell>
          <AuthFieldError message={errors.email?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <AuthRequiredLabel htmlFor="password">
            Choose a Password
          </AuthRequiredLabel>
          <AuthFieldShell className="justify-between">
            <Input
              id="password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter your password"
              className="h-auto border-0 bg-transparent p-0 text-base tracking-[0.01em] text-[#222] shadow-none placeholder:text-[#222]/70 focus-visible:ring-0 md:text-base"
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-5 shrink-0 p-0 text-[#185b50] hover:bg-transparent hover:text-[#185b50]/80"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </Button>
          </AuthFieldShell>
          <p className="text-sm tracking-[0.01em] text-[#222] italic">
            Use at least 8 characters with uppercase, lowercase, a number, and a
            special character.
          </p>
          <AuthFieldError message={errors.password?.message} />
        </div>

        <div className="flex flex-col gap-2">
          <AuthRequiredLabel htmlFor="confirmPassword">
            Confirm password
          </AuthRequiredLabel>
          <AuthFieldShell className="justify-between">
            <Input
              id="confirmPassword"
              type={isConfirmPasswordVisible ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm your password"
              className="h-auto border-0 bg-transparent p-0 text-base tracking-[0.01em] text-[#222] shadow-none placeholder:text-[#222]/70 focus-visible:ring-0 md:text-base"
              {...register("confirmPassword")}
            />
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
          </AuthFieldShell>
          <AuthFieldError message={errors.confirmPassword?.message} />
        </div>
      </div>

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
          disabled={isSocialPending}
          onClick={onGoogleSignUp}
          className="h-[52px] w-full rounded-2xl border-0 bg-white px-[30px] text-base font-semibold text-[#185b50] hover:bg-white/90 hover:text-[#185b50]"
        >
          <GoogleIcon className="size-5" />
          {isGooglePending ? "Connecting..." : "Sign up with Google"}
        </Button>

        <p className="text-center text-base tracking-[0.01em] text-[#222]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#185b50] underline underline-offset-2 hover:opacity-90"
          >
            Login
          </Link>
        </p>
      </div>

      <Button
        type="submit"
        disabled={isSocialPending}
        className="h-[52px] w-full rounded-2xl bg-[#185b50] px-[30px] text-base font-normal text-white hover:bg-[#185b50]/90"
      >
        Continue
      </Button>
    </form>
  );
}
