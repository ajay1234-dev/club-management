"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-20">
      <div className="paper-card space-y-4 p-8 text-center">
        <h2 className="text-2xl font-semibold text-black">
          Something interrupted the paper trail.
        </h2>
        <p className="text-sm leading-6 text-black/60">
          The page hit an unexpected error. Retry the request or return to the dashboard.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset} className="rounded-full px-5">
            Try again
          </Button>
          <Button asChild variant="outline" className="rounded-full px-5">
            <a href="/dashboard">Go to dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
