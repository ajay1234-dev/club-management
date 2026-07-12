import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-semibold tracking-tight text-black">
          Reset access
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-black/60">
          Enter the email tied to your Campus Club Hub account and we’ll send a secure reset link.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <ForgotPasswordForm />
        <p className="mt-4 text-sm text-black/55">
          Back to{" "}
          <Link href="/login" className="underline-offset-4 hover:underline">
            login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
