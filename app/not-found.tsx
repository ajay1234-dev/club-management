import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-20">
      <div className="paper-card space-y-4 p-8 text-center">
        <h2 className="text-2xl font-semibold text-black">This page is not in the sketchbook.</h2>
        <p className="text-sm leading-6 text-black/60">
          The requested route does not exist or is not ready yet.
        </p>
        <Button asChild className="rounded-full px-5">
          <Link href="/dashboard">Return to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
