import Link from "next/link";
import { ArrowRight, Globe, Mail, ShieldAlert } from "lucide-react";
import { listClubs } from "@/lib/repositories/clubs-repository";
import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/layout/fade-in";

export const dynamic = "force-dynamic";

type ClubItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  focus: string;
  color: string;
  icon: string;
  websiteUrl?: string | null;
  contactEmail?: string | null;
  logoUrl?: string | null;
  facultyCoordinator?: string | null;
  studentCoordinator?: string | null;
  category?: string | null;
  isActive: boolean;
};

export default async function ClubsPage() {
  const session = await auth();
  const allClubs = (await listClubs()) as ClubItem[];

  // Filter inactive clubs for students / anonymous, super admins and club admins can see all
  const isPrivileged =
    session?.user?.role === "super_admin" || session?.user?.role === "club_admin";
  const visibleClubs = isPrivileged ? allClubs : allClubs.filter((c: ClubItem) => c.isActive);

  return (
    <FadeIn className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-black">Clubs Directory</h1>
          <p className="text-black/60 mt-1">
            Explore all official college clubs, categories, and leadership teams.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleClubs.map((club: ClubItem) => {
          const colorMap: Record<string, string> = {
            Stone: "border-stone-200 bg-stone-50/50 hover:bg-stone-50",
            Graphite: "border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50",
            Ink: "border-slate-300 bg-slate-50/50 hover:bg-slate-50",
            Paper: "border-orange-100 bg-orange-50/20 hover:bg-orange-50/30",
            Charcoal: "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50",
            Slate: "border-slate-200 bg-slate-50/50 hover:bg-slate-50",
            Ash: "border-gray-200 bg-gray-50/50 hover:bg-gray-50",
            Olive: "border-olive-200 bg-emerald-50/20 hover:bg-emerald-50/30",
            Steel: "border-blue-200 bg-blue-50/10 hover:bg-blue-50/20",
          };

          const cardStyle = colorMap[club.color] || "border-black/10 bg-white/80 hover:bg-white";

          return (
            <Card
              key={club.id}
              className={`group flex flex-col justify-between rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.12)] ${cardStyle}`}
            >
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {club.category && (
                          <Badge
                            variant="outline"
                            className="rounded-full border-black/10 bg-white/60 text-xs font-normal text-black/75"
                          >
                            {club.category}
                          </Badge>
                        )}
                        {!club.isActive && (
                          <Badge
                            variant="destructive"
                            className="rounded-full text-xs font-normal flex items-center gap-1"
                          >
                            <ShieldAlert className="size-3" /> Inactive
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-semibold text-black tracking-tight mt-1">
                        {club.name}
                      </CardTitle>
                      <CardDescription className="text-black/50 text-xs leading-normal">
                        {club.focus}
                      </CardDescription>
                    </div>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-white text-base shadow-sm font-semibold">
                      {club.icon}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-black/60 pb-6">
                  {club.description.length > 130
                    ? `${club.description.slice(0, 130)}...`
                    : club.description}
                </CardContent>
              </div>

              <div className="border-t border-black/5 p-4 flex items-center justify-between bg-black/[0.01] rounded-b-3xl">
                <div className="flex items-center gap-3">
                  {club.websiteUrl && (
                    <a
                      href={club.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full hover:bg-black/5 text-black/40 hover:text-black transition-colors"
                      title="Website"
                    >
                      <Globe className="size-4" />
                    </a>
                  )}
                  {club.contactEmail && (
                    <a
                      href={`mailto:${club.contactEmail}`}
                      className="p-1.5 rounded-full hover:bg-black/5 text-black/40 hover:text-black transition-colors"
                      title="Email Contact"
                    >
                      <Mail className="size-4" />
                    </a>
                  )}
                </div>
                <Link
                  href={`/dashboard/clubs/${club.slug}`}
                  className="flex items-center gap-1.5 text-xs font-medium text-black/80 hover:text-black group-hover:translate-x-0.5 transition-transform"
                >
                  View Details
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </FadeIn>
  );
}
