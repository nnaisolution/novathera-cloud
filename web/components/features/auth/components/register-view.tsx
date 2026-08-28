"use client";

import { useState } from "react";

import { AuthSplitShell } from "@/components/features/auth/components/auth-split-shell";
import { RegisterStep1Form } from "@/components/features/auth/components/register-step1-form";
import { RegisterStep2Form } from "@/components/features/auth/components/register-step2-form";
import { RegisterStep3Form } from "@/components/features/auth/components/register-step3-form";
import { RegisterStep4Form } from "@/components/features/auth/components/register-step4-form";

import { useRegister } from "../hooks/use-register";
import type {
  RegisterStep1Values,
  RegisterStep2Values,
  RegisterStep3Values,
  RegisterStep4Values,
} from "../schemas/register.schema";

const STEP_CONFIG = {
  1: {
    title: "Create Account",
    subtitle: undefined,
    contentClassName: undefined,
  },
  2: {
    title: "Tell me about yourself",
    subtitle: undefined,
    contentClassName: "max-w-[680px]",
  },
  3: {
    title: "You’re almost done!",
    subtitle: undefined,
    contentClassName: undefined,
  },
  4: {
    title: "Choose your membership",
    subtitle: "Select the plan that's right for you. You can change it anytime.",
    contentClassName: "max-w-[680px]",
  },
} as const;

export function RegisterView() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [step1Values, setStep1Values] = useState<RegisterStep1Values | null>(
    null,
  );
  const [step2Values, setStep2Values] = useState<RegisterStep2Values | null>(
    null,
  );
  const [step3Values, setStep3Values] = useState<RegisterStep3Values | null>(
    null,
  );
  const [step4Values, setStep4Values] = useState<RegisterStep4Values | null>(
    null,
  );

  const {
    register: submitRegister,
    signUpWithGoogle,
    signUpWithApple,
    signUpWithFacebook,
    isPending,
    isGooglePending,
    isApplePending,
    isFacebookPending,
    isSocialPending,
    error,
  } = useRegister();

  const submitRegistration = (membershipPlan: RegisterStep4Values) => {
    if (!step1Values || !step2Values || !step3Values) return;

    setStep4Values(membershipPlan);
    void submitRegister({
      ...step1Values,
      ...step2Values,
      ...step3Values,
      ...membershipPlan,
      name: `${step2Values.firstName} ${step2Values.lastName}`.trim(),
    });
  };

  const handleStep1Continue = (values: RegisterStep1Values) => {
    setStep1Values(values);
    setStep(2);
  };

  const handleStep2Continue = (values: RegisterStep2Values) => {
    setStep2Values(values);
    setStep(3);
  };

  const handleStep3Continue = (values: RegisterStep3Values) => {
    setStep3Values(values);
    setStep(4);
  };

  const stepConfig = STEP_CONFIG[step];

  return (
    <AuthSplitShell
      title={stepConfig.title}
      subtitle={stepConfig.subtitle}
      contentClassName={stepConfig.contentClassName}
    >
      {step === 1 ? (
        <RegisterStep1Form
          defaultValues={step1Values ?? undefined}
          onContinue={handleStep1Continue}
          onGoogleSignUp={signUpWithGoogle}
          onAppleSignUp={signUpWithApple}
          onFacebookSignUp={signUpWithFacebook}
          isGooglePending={isGooglePending}
          isApplePending={isApplePending}
          isFacebookPending={isFacebookPending}
          isSocialPending={isSocialPending}
          error={error}
        />
      ) : null}

      {step === 2 ? (
        <RegisterStep2Form
          email={step1Values?.email ?? ""}
          defaultValues={step2Values ?? undefined}
          onBack={() => setStep(1)}
          onContinue={handleStep2Continue}
          error={error}
        />
      ) : null}

      {step === 3 ? (
        <RegisterStep3Form
          defaultValues={step3Values ?? undefined}
          onBack={() => setStep(2)}
          onContinue={handleStep3Continue}
          error={error}
        />
      ) : null}

      {step === 4 ? (
        <RegisterStep4Form
          defaultValues={step4Values ?? undefined}
          onContinue={submitRegistration}
          onSkip={() => submitRegistration({ membershipPlan: null })}
          isPending={isPending}
          error={error}
        />
      ) : null}
    </AuthSplitShell>
  );
}
