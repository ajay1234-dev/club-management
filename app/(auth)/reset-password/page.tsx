import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <Card className="border-none bg-transparent shadow-none ring-0">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-semibold tracking-tight text-black">
          Choose a new password
        </CardTitle>
        <CardDescription className="text-sm leading-6 text-black/60">
          The reset link is time-limited and only works once.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-sm text-black/60">
            Missing reset token.{" "}
            <Link href="/forgot-password" className="underline-offset-4 hover:underline">
              Request a new link
            </Link>
            .
          </p>
        )}
      </CardContent>
    </Card>
  );
}
