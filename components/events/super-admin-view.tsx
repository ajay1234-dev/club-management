"use client";

import { useState } from "react";
import {
  Search,
  CalendarDays,
  MapPin,
  Users,
  Info,
  BarChart3,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type EventDetails = {
  id: string;
  clubId: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  eventDate: Date | string;
  startTime: string;
  endTime: string;
  registrationDeadline: Date | string;
  maxParticipants: number;
  organizerDetails: string;
  posterUrl?: string | null;
  status: string;
  isPublished: boolean;
  createdAt: Date | string;
};

type ClubDetails = {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
};

type JoinedEvent = {
  event: EventDetails;
  club: ClubDetails;
  registrationCount: number;
};

type SuperAdminViewProps = {
  eventsList: JoinedEvent[];
  clubsList: ClubDetails[];
  stats: {
    totalEvents: number;
    publishedEvents: number;
    upcomingEvents: number;
    totalRegistrations: number;
  };
};

export function SuperAdminView({ eventsList, clubsList, stats }: SuperAdminViewProps) {
  const [search, setSearch] = useState("");
  const [clubFilter, setClubFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_asc");

  const [selectedEvent, setSelectedEvent] = useState<JoinedEvent | null>(null);

  // Filtering
  const filteredEvents = eventsList.filter(({ event, club }) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.venue.toLowerCase().includes(search.toLowerCase());

    const matchesClub = clubFilter === "all" || club.slug === clubFilter;
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;

    return matchesSearch && matchesClub && matchesCategory && matchesStatus;
  });

  // Sorting
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.event.eventDate).getTime();
    const dateB = new Date(b.event.eventDate).getTime();
    const createdA = new Date(a.event.createdAt).getTime();
    const createdB = new Date(b.event.createdAt).getTime();

    if (sortBy === "date_asc") return dateA - dateB;
    if (sortBy === "date_desc") return dateB - dateA;
    if (sortBy === "latest") return createdB - createdA;
    if (sortBy === "oldest") return createdA - createdB;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Super Admin Events Section Header */}
      <section className="paper-card p-6 bg-white/80 space-y-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">Campus Event Monitor</h1>
          <p className="text-sm text-black/60 mt-0.5">
            Global overview of all draft and published events across all 11 clubs.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
          {/* Search Input */}
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-semibold text-black/55 uppercase tracking-wider">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-black/40" />
              <Input
                type="text"
                placeholder="Search event names, venues..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-2xl border-black/10 bg-white"
              />
            </div>
          </div>

          {/* Club Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black/55 uppercase tracking-wider">
              Club
            </label>
            <select
              className="h-10 w-full rounded-2xl border border-black/10 bg-white px-3 text-xs outline-none"
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
            >
              <option value="all">All Clubs</option>
              {clubsList.map((club) => (
                <option key={club.id} value={club.slug}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black/55 uppercase tracking-wider">
              Category
            </label>
            <select
              className="h-10 w-full rounded-2xl border border-black/10 bg-white px-3 text-xs outline-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Literary">Literary</option>
              <option value="Sports">Sports</option>
              <option value="Social Service">Social Service</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black/55 uppercase tracking-wider">
              Status
            </label>
            <select
              className="h-10 w-full rounded-2xl border border-black/10 bg-white px-3 text-xs outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between border-t border-black/5 pt-3 gap-2 text-xs">
          <div className="text-black/50 font-medium">Showing {sortedEvents.length} events</div>
          <div className="flex items-center gap-2">
            <span className="text-black/45 font-medium">Sort by:</span>
            <select
              className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date_asc">Event Date (Soonest first)</option>
              <option value="date_desc">Event Date (Latest first)</option>
              <option value="latest">Newly Posted</option>
              <option value="oldest">Oldest Posted</option>
            </select>
          </div>
        </div>
      </section>

      {/* Global Event Statistics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Campus Events",
            value: stats.totalEvents,
            icon: BarChart3,
            desc: "Draft + Published",
          },
          {
            label: "Active Published",
            value: stats.publishedEvents,
            icon: Sparkles,
            desc: "Currently live",
          },
          {
            label: "Upcoming Events",
            value: stats.upcomingEvents,
            icon: AlertCircle,
            desc: "Awaiting execution",
          },
          {
            label: "Global Registrations",
            value: stats.totalRegistrations,
            icon: Users,
            desc: "Total database applications",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="rounded-3xl border-black/10 bg-white/85 shadow-sm p-5 space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-black/45 uppercase tracking-wider font-semibold">
                {stat.label}
              </span>
              <stat.icon className="size-4 text-black/35" />
            </div>
            <p className="text-3xl font-semibold text-black tracking-tight mt-1">{stat.value}</p>
            <p className="text-[10px] text-black/40 mt-1">{stat.desc}</p>
          </Card>
        ))}
      </div>

      {/* Grid of Events */}
      {sortedEvents.length === 0 ? (
        <Card className="rounded-[2rem] border border-dashed border-black/10 bg-black/[0.01] p-12 text-center flex flex-col items-center justify-center">
          <CalendarDays className="size-10 text-black/25 mb-3" />
          <p className="text-sm font-semibold text-black/60">No events found</p>
          <p className="text-xs text-black/40 mt-1">Try broadening your filter criteria.</p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedEvents.map((joined) => {
            const { event, club, registrationCount } = joined;
            const formattedDate = new Date(event.eventDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <Card
                key={event.id}
                className="group flex flex-col justify-between rounded-3xl border border-black/10 bg-white shadow-sm hover:shadow-[0_12px_24px_-10px_rgba(0,0,0,0.12)] transition-all duration-300"
              >
                <div>
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
                    <Badge
                      variant={event.isPublished ? "secondary" : "destructive"}
                      className={`absolute bottom-3 left-3 rounded-full text-[9px] font-semibold py-0.5 border ${
                        event.isPublished
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {event.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-black/50 font-medium">
                        <span className="font-semibold text-black">{club.name}</span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                      </div>
                      <CardTitle className="text-lg font-semibold tracking-tight text-black mt-0.5 line-clamp-1">
                        {event.title}
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4 space-y-4">
                    <p className="text-xs text-black/60 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="space-y-1 text-[11px] text-black/55">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0 text-black/35" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="size-3.5 shrink-0 text-black/35" />
                        <span>
                          Seats Reserved: {registrationCount} / {event.maxParticipants}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="border-t border-black/5 p-4 bg-black/[0.01] rounded-b-3xl">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedEvent(joined)}
                    className="w-full rounded-full h-9 text-xs bg-white border-black/10 hover:bg-black/5 font-medium flex items-center justify-center gap-1.5"
                  >
                    <Info className="size-4" />
                    Inspect Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        {selectedEvent && (
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border border-black/10 bg-white p-6 shadow-xl">
            <DialogHeader className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-full bg-black/5 text-black border-transparent uppercase text-[9px] font-bold"
                >
                  {selectedEvent.event.category}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full border-black/10 text-black/60 text-[10px]"
                >
                  Hosted by {selectedEvent.club.name}
                </Badge>
                <Badge
                  className={
                    selectedEvent.event.isPublished
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }
                >
                  {selectedEvent.event.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-semibold tracking-tight text-black mt-1">
                {selectedEvent.event.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-black/45">
                Event Status: {selectedEvent.event.status}
              </DialogDescription>
            </DialogHeader>

            {/* Poster if present */}
            {selectedEvent.event.posterUrl && (
              <div className="my-2 rounded-xl overflow-hidden max-h-56 w-full border bg-neutral-50 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedEvent.event.posterUrl}
                  alt={selectedEvent.event.title}
                  className="object-cover w-full max-h-56"
                />
              </div>
            )}

            <div className="space-y-4 my-2 text-sm leading-relaxed text-black/75">
              <div>
                <h4 className="font-semibold text-black mb-1">About the Event</h4>
                <p className="whitespace-pre-line text-black/70 text-sm leading-relaxed">
                  {selectedEvent.event.description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 border-y border-black/5 py-4 my-3 text-xs leading-relaxed text-black/65">
                <div className="space-y-2">
                  <p className="font-semibold text-black uppercase tracking-wider text-[10px] text-black/45">
                    Schedule & Venue
                  </p>
                  <p>
                    <span className="font-medium text-black">Date:</span>{" "}
                    {new Date(selectedEvent.event.eventDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p>
                    <span className="font-medium text-black">Time:</span>{" "}
                    {selectedEvent.event.startTime} - {selectedEvent.event.endTime}
                  </p>
                  <p>
                    <span className="font-medium text-black">Location:</span>{" "}
                    {selectedEvent.event.venue}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-black uppercase tracking-wider text-[10px] text-black/45">
                    Organizer details
                  </p>
                  <p className="whitespace-pre-line">{selectedEvent.event.organizerDetails}</p>
                </div>
              </div>

              <div className="bg-black/[0.01] border border-black/8 rounded-2xl p-4 space-y-2 text-xs">
                <p className="font-semibold text-black uppercase tracking-wider text-[10px] text-black/45">
                  Governance audit
                </p>
                <div className="grid gap-2 sm:grid-cols-2 text-black/65">
                  <p>
                    <span className="font-medium text-black">Max Capacity:</span>{" "}
                    {selectedEvent.event.maxParticipants} students
                  </p>
                  <p>
                    <span className="font-medium text-black">Total Signups:</span>{" "}
                    {selectedEvent.registrationCount} students
                  </p>
                  <p className="sm:col-span-2">
                    <span className="font-medium text-black">Registration Deadline:</span>{" "}
                    {new Date(selectedEvent.event.registrationDeadline).toLocaleString("en-US")}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-black/5 pt-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedEvent(null)}
                className="rounded-full px-5"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
