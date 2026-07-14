import Link from "next/link";
import { ArrowRight, PencilLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ModulePlaceholderProps = {
  title: string;
  description: string;
  badge: string;
  ctaHref: string;
  ctaLabel: string;
  points: string[];
};

export function ModulePlaceholder({
  title,
  description,
  badge,
  ctaHref,
  ctaLabel,
  points,
}: ModulePlaceholderProps) {
  return (
    <Card className="paper-card border-black/10 bg-white/80">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between gap-3">
          <Badge
            variant="secondary"
            className="rounded-full border-black/10 bg-black/5 text-black/70"
          >
            <PencilLine className="size-3.5" />
            {badge}
          </Badge>
          <span className="text-xs uppercase tracking-[0.24em] text-black/35">Future module</span>
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight text-black">{title}</CardTitle>
        <CardDescription className="max-w-2xl text-sm leading-6 text-black/65">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {points.map((point) => (
            <div
              key={point}
              className="rounded-2xl border border-black/8 bg-black/[0.02] px-4 py-3 text-sm text-black/70"
            >
              {point}
            </div>
          ))}
        </div>
        <Button asChild className="rounded-full px-5">
          <Link href={ctaHref}>
            {ctaLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
