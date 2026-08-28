import { AuthSplitShell } from "@/components/features/auth/components/auth-split-shell";
import { ResetPasswordForm } from "./reset-password-form";

export function ResetPasswordView() {
  return (
    <AuthSplitShell
      title="Reset password"
      subtitle="Choose a new password for your Nova Thera account."
    >
      <ResetPasswordForm />
    </AuthSplitShell>
  );
}
