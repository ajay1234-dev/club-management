import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, MapPin, ClipboardList, ArrowUpRight } from "lucide-react";
import { auth } from "@/auth";
import { getStudentApplications } from "@/lib/repositories/events-repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/layout/fade-in";

export const dynamic = "force-dynamic";

type ApplicationItem = {
  application: {
    id: string;
    status: string;
    createdAt: Date | string;
  };
  event: {
    id: string;
    title: string;
    description: string;
    category: string;
    venue: string;
    eventDate: Date | string;
    startTime: string;
    endTime: string;
    posterUrl: string | null;
  };
  club: {
    id: string;
    name: string;
    icon: string;
  };
};

export default async function StudentApplicationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "student") {
    redirect("/dashboard");
  }

  const applications = (await getStudentApplications(
    session.user.id,
  )) as unknown as ApplicationItem[];

  return (
    <FadeIn className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-black">My Applications</h1>
        <p className="text-sm text-black/60 mt-0.5">
          Track your registrations, view schedules, and manage event passes.
        </p>
      </div>

      {applications.length === 0 ? (
        <Card className="rounded-[2rem] border border-dashed border-black/10 bg-black/[0.01] p-12 text-center flex flex-col items-center justify-center">
          <ClipboardList className="size-10 text-black/25 mb-3" />
          <p className="text-sm font-semibold text-black/60">No registrations yet</p>
          <p className="text-xs text-black/40 mt-1 max-w-xs">
            {
              "You haven't registered for any events. Check out the Events workspace to find activities!"
            }
          </p>
          <Button
            asChild
            className="rounded-full mt-4 bg-black text-white hover:bg-black/90 font-medium"
          >
            <Link href="/dashboard/events">Browse Events</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map(({ application, event, club }: ApplicationItem) => {
            const eventDate = new Date(event.eventDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            });

            return (
              <Card
                key={application.id}
                className="group flex flex-col justify-between rounded-3xl border border-black/10 bg-white shadow-sm hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.12)] transition-all duration-300"
              >
                <div>
                  {/* Poster Image Container */}
                  <div className="relative aspect-video w-full overflow-hidden border-b border-black/5 bg-black/5 rounded-t-3xl">
                    {event.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.posterUrl}
                        alt={event.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl select-none opacity-40 font-semibold bg-gradient-to-tr from-neutral-100 to-neutral-200 text-neutral-600">
                        {club.icon}
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-white/95 border-black/5 text-black hover:bg-white rounded-full text-[10px] font-semibold uppercase">
                      {event.category}
                    </Badge>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-black/50 font-medium">
                        <span className="font-semibold text-black">{club.name}</span>
                      </div>
                      <CardTitle className="text-lg font-semibold tracking-tight text-black mt-0.5 line-clamp-1">
                        {event.title}
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4 space-y-4">
                    <div className="space-y-1.5 text-xs text-black/65">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="size-4 shrink-0 text-black/35" />
                        <span>
                          {eventDate} at {event.startTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 shrink-0 text-black/35" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="border-t border-black/5 p-4 flex items-center justify-between bg-black/[0.01] rounded-b-3xl">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-black/45 font-medium">Status:</span>
                    <Badge className="rounded-full text-[10px] py-0 bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase font-semibold">
                      {application.status}
                    </Badge>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="rounded-full text-xs hover:bg-black/5 pl-2 pr-3"
                  >
                    <Link href="/dashboard/events">
                      Workspace
                      <ArrowUpRight className="size-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </FadeIn>
  );
}
