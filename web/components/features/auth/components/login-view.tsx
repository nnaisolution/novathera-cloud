import { AuthSplitShell } from "@/components/features/auth/components/auth-split-shell";
import { LoginForm } from "./login-form";

export function LoginView() {
  return (
    <AuthSplitShell
      title="Welcome Back"
      subtitle="Continue your wellness journey with Nova Thera."
    >
      <LoginForm />
    </AuthSplitShell>
  );
}
