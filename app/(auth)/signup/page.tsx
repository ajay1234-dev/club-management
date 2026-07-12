import Link from "next/link";

import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/layout/fade-in";

export default function SignupPage() {
  return (
    <FadeIn>
      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-3xl font-extrabold tracking-tighter text-black sm:text-4xl">
            Create your account
          </CardTitle>
          <CardDescription className="text-sm leading-6 text-black/60">
            Start as a student or club admin. Super admin access is provisioned separately. Already
            registered?{" "}
            <Link href="/login" className="underline-offset-4 hover:underline">
              Log in
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <SignupForm />
        </CardContent>
      </Card>
    </FadeIn>
  );
}
