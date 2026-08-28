import { AuthSplitShell } from "@/components/features/auth/components/auth-split-shell";
import { ForgotPasswordForm } from "./forgot-password-form";

export function ForgotPasswordView() {
  return (
    <AuthSplitShell
      title="Forgot password"
      subtitle="Enter your email and we will send you a reset link."
    >
      <ForgotPasswordForm />
    </AuthSplitShell>
  );
}
