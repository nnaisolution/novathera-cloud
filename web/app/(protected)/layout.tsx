import { ProtectedGuard } from "@/components/features/auth";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedGuard>{children}</ProtectedGuard>;
}
