import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, Globe, Mail, User } from "lucide-react";
import { getClubBySlug } from "@/lib/repositories/clubs-repository";
import { listEvents } from "@/lib/repositories/events-repository";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/layout/fade-in";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ClubDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);

  if (!club) {
    notFound();
  }

  // Get events hosted by this club
  const clubEvents = await listEvents({
    clubSlug: slug,
    isPublished: true,
    sortBy: "date_asc",
  });

  return (
    <FadeIn className="space-y-8">
      {/* Back button */}
      <div>
        <Button
          asChild
          variant="ghost"
          className="rounded-full text-black/60 hover:text-black pl-2 pr-4"
        >
          <Link href="/dashboard/clubs">
            <ArrowLeft className="size-4 mr-2" />
            Back to directory
          </Link>
        </Button>
      </div>

      {/* Hero Header */}
      <section className="paper-card p-6 lg:p-8 grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
        <span className="flex size-24 items-center justify-center rounded-[2rem] border border-black/10 bg-black text-white text-4xl shadow-md font-semibold select-none mx-auto md:mx-0">
          {club.icon}
        </span>
        <div className="space-y-3 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {club.category && (
              <Badge
                variant="secondary"
                className="rounded-full border-black/10 bg-black/5 text-black/70"
              >
                {club.category}
              </Badge>
            )}
            <Badge
              variant="outline"
              className="rounded-full border-emerald-200 bg-emerald-50/20 text-emerald-800 text-xs font-normal"
            >
              {club.focus}
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black">
            {club.name}
          </h1>
          <p className="text-black/60 max-w-2xl text-sm sm:text-base leading-relaxed">
            {club.description}
          </p>
        </div>
      </section>

      {/* Detailed Info Cards */}
      <div className="grid gap-6 md:grid-cols-[0.4fr_0.6fr]">
        {/* Info & Coordinator Directory */}
        <div className="space-y-6">
          <Card className="paper-card border-black/10 bg-white/80 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg text-black">Club Directory info</CardTitle>
              <CardDescription>Leadership and coordinates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-black/70">
              {club.facultyCoordinator && (
                <div className="flex items-start gap-2.5">
                  <User className="size-4 mt-0.5 text-black/40" />
                  <div>
                    <p className="font-medium text-black">Faculty Coordinator</p>
                    <p className="text-black/60">{club.facultyCoordinator}</p>
                  </div>
                </div>
              )}

              {club.studentCoordinator && (
                <div className="flex items-start gap-2.5">
                  <User className="size-4 mt-0.5 text-black/40" />
                  <div>
                    <p className="font-medium text-black">Student Lead</p>
                    <p className="text-black/60">{club.studentCoordinator}</p>
                  </div>
                </div>
              )}

              <hr className="border-black/5" />

              {club.contactEmail && (
                <div className="flex items-start gap-2.5">
                  <Mail className="size-4 mt-0.5 text-black/40" />
                  <div>
                    <p className="font-medium text-black">Contact Email</p>
                    <a
                      href={`mailto:${club.contactEmail}`}
                      className="text-black/60 hover:text-black underline"
                    >
                      {club.contactEmail}
                    </a>
                  </div>
                </div>
              )}

              {club.websiteUrl && (
                <div className="flex items-start gap-2.5">
                  <Globe className="size-4 mt-0.5 text-black/40" />
                  <div>
                    <p className="font-medium text-black">Official Website</p>
                    <a
                      href={club.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black/60 hover:text-black underline inline-flex items-center gap-1"
                    >
                      Visit site
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Hosted Events */}
        <Card className="paper-card border-black/10 bg-white/80 shadow-none">
          <CardHeader>
            <CardTitle className="text-xl text-black">Upcoming & Active Events</CardTitle>
            <CardDescription>Join in on our events and workshops</CardDescription>
          </CardHeader>
          <CardContent>
            {clubEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-2xl border border-dashed border-black/10 bg-black/[0.01]">
                <CalendarDays className="size-8 text-black/25 mb-3" />
                <p className="text-sm font-medium text-black/60">No events scheduled</p>
                <p className="text-xs text-black/40 mt-1">
                  {"This club hasn't published any upcoming events yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {clubEvents.map(
                  ({
                    event,
                  }: {
                    event: {
                      id: string;
                      title: string;
                      category: string;
                      eventDate: Date | string;
                      startTime: string;
                      venue: string;
                    };
                  }) => {
                    const eventDate = new Date(event.eventDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <div
                        key={event.id}
                        className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-black/8 bg-white hover:bg-black/[0.01] hover:border-black/15 transition-all duration-300"
                      >
                        <div>
                          <Badge
                            variant="outline"
                            className="rounded-full bg-black/5 text-black/60 border-transparent text-[10px] uppercase font-semibold"
                          >
                            {event.category}
                          </Badge>
                          <h4 className="font-semibold text-black text-base mt-1">{event.title}</h4>
                          <p className="text-xs text-black/50 mt-1 flex items-center gap-1.5">
                            <CalendarDays className="size-3.5" />
                            {eventDate} at {event.startTime} • {event.venue}
                          </p>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-full shrink-0"
                        >
                          <Link href="/dashboard/events">View Workspace</Link>
                        </Button>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  );
}
