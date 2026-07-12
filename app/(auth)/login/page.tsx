import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/layout/fade-in";
import { ROLE_VALUES } from "@/lib/constants/roles";

type SearchParams = Promise<{
  role?: string;
  email?: string;
}>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedParams = await searchParams;
  const initialRole =
    resolvedParams.role && ROLE_VALUES.includes(resolvedParams.role as (typeof ROLE_VALUES)[number])
      ? (resolvedParams.role as (typeof ROLE_VALUES)[number])
      : "student";
  const initialEmail = resolvedParams.email || "";

  return (
    <FadeIn>
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-3xl font-extrabold tracking-tighter text-black sm:text-4xl">
            Welcome back
          </CardTitle>
          <CardDescription className="text-sm leading-6 text-black/60">
            Sign in as a student, club admin, or super admin. Forgot your password?{" "}
            <Link href="/forgot-password" className="underline-offset-4 hover:underline">
              Reset it here
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <LoginForm defaultRole={initialRole} defaultEmail={initialEmail} />
        </CardContent>
      </Card>
    </FadeIn>
  );
}
