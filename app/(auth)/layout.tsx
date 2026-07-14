import type { ReactNode } from "react";

import { AuthShell } from "@/components/layout/auth-shell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthShell
      title="A calmer way to run campus clubs"
      description="Authenticate with role-aware access, secure password flows, and a foundation designed for the next two phases of the platform."
    >
      {children}
    </AuthShell>
  );
}
