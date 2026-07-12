"use client";

import { useState } from "react";
import { Search, CalendarDays, MapPin, Users, Info, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { registerForEventAction } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EventCountdown } from "./event-countdown";

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
  logoUrl?: string | null;
  contactEmail?: string | null;
  websiteUrl?: string | null;
  facultyCoordinator?: string | null;
  studentCoordinator?: string | null;
};

type JoinedEvent = {
  event: EventDetails;
  club: ClubDetails;
  registrationCount: number;
  isUserRegistered: boolean;
};

type StudentViewProps = {
  eventsList: JoinedEvent[];
  clubsList: ClubDetails[];
};

export function StudentView({ eventsList, clubsList }: StudentViewProps) {
  const [search, setSearch] = useState("");
  const [clubFilter, setClubFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("Upcoming"); // Default to upcoming events
  const [sortBy, setSortBy] = useState("date_asc");

  const [selectedEvent, setSelectedEvent] = useState<JoinedEvent | null>(null);
  const [isRegistering, setIsRegistering] = useState<string | null>(null); // holds eventId during action execution

  // Filtering
  const filteredEvents = eventsList.filter(({ event, club }) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase()) ||
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

  const handleRegister = async (eventId: string, title: string) => {
    setIsRegistering(eventId);
    try {
      const res = await registerForEventAction(eventId);
      if (res.success) {
        toast.success(`Successfully registered for "${title}".`);
        // Refresh detail modal if open
        if (selectedEvent && selectedEvent.event.id === eventId) {
          setSelectedEvent({
            ...selectedEvent,
            isUserRegistered: true,
            registrationCount: selectedEvent.registrationCount + 1,
          });
        }
      } else {
        toast.error(res.error || "Failed to register.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsRegistering(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <section className="paper-card p-6 bg-white/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black">Browse Events</h1>
            <p className="text-sm text-black/60 mt-0.5">
              Find workshops, hackathons, and gatherings across all 11 clubs.
            </p>
          </div>
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
                placeholder="Search event names, details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 rounded-2xl border-black/10 bg-white"
              />
            </div>
          </div>

          {/* Club Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-black/55 uppercase tracking-wider">
              Hosting Club
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
              Event Status
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

      {/* Events Grid */}
      {sortedEvents.length === 0 ? (
        <Card className="rounded-[2rem] border border-dashed border-black/10 bg-black/[0.01] p-12 text-center flex flex-col items-center justify-center">
          <CalendarDays className="size-10 text-black/25 mb-3" />
          <p className="text-sm font-semibold text-black/60">No events found</p>
          <p className="text-xs text-black/40 mt-1 max-w-xs">
            Try adjusting your search criteria or checking out active upcoming categories.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedEvents.map((joined) => {
            const { event, club, registrationCount, isUserRegistered } = joined;
            const now = new Date();
            const deadlinePassed = new Date(event.registrationDeadline).getTime() < now.getTime();
            const isFull = registrationCount >= event.maxParticipants;
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
                  {/* Poster image container */}
                  <div className="relative aspect-video w-full overflow-hidden border-b border-black/5 bg-black/5 rounded-t-3xl">
                    {event.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={event.posterUrl}
                        alt={event.title}
                        className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl select-none opacity-40 font-semibold bg-gradient-to-tr from-neutral-100 to-neutral-200 text-neutral-600">
                        {club.icon}
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-white/95 border-black/5 text-black hover:bg-white rounded-full text-[10px] font-semibold uppercase">
                      {event.category}
                    </Badge>

                    {event.status === "Upcoming" && !deadlinePassed && (
                      <div className="absolute bottom-3 right-3">
                        <EventCountdown deadline={event.registrationDeadline} />
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-black/50 font-medium">
                        <span className="font-semibold text-black">{club.name}</span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                      </div>
                      <CardTitle className="text-lg font-semibold tracking-tight text-black group-hover:text-black/80 transition-colors mt-0.5 line-clamp-1">
                        {event.title}
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="pb-4 space-y-4">
                    <p className="text-xs text-black/60 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="space-y-1.5 text-[11px] text-black/55">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0 text-black/35" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="size-3.5 shrink-0 text-black/35" />
                        <span>
                          Seats: {registrationCount} / {event.maxParticipants} (
                          {event.maxParticipants - registrationCount} left)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="border-t border-black/5 p-4 flex items-center gap-2 bg-black/[0.01] rounded-b-3xl">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedEvent(joined)}
                    className="rounded-full shrink-0 h-9 px-3.5 bg-white text-xs border-black/10 hover:bg-black/5"
                  >
                    <Info className="size-4" />
                  </Button>

                  {isUserRegistered ? (
                    <Button
                      disabled
                      className="flex-1 rounded-full h-9 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold cursor-not-allowed"
                    >
                      <CheckCircle2 className="size-4 mr-1.5" /> Registered
                    </Button>
                  ) : event.status === "Completed" ? (
                    <Button
                      disabled
                      className="flex-1 rounded-full h-9 bg-neutral-100 text-neutral-400 text-xs cursor-not-allowed"
                    >
                      Event Ended
                    </Button>
                  ) : deadlinePassed ? (
                    <Button
                      disabled
                      className="flex-1 rounded-full h-9 bg-rose-50 border border-rose-100 text-rose-600 text-xs cursor-not-allowed"
                    >
                      Closed
                    </Button>
                  ) : isFull ? (
                    <Button
                      disabled
                      className="flex-1 rounded-full h-9 bg-amber-50 border border-amber-100 text-amber-600 text-xs cursor-not-allowed"
                    >
                      Sold Out
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleRegister(event.id, event.title)}
                      disabled={isRegistering === event.id}
                      className="flex-1 rounded-full h-9 text-xs bg-black text-white hover:bg-black/90 font-medium"
                    >
                      {isRegistering === event.id ? "Registering..." : "Register Now"}
                    </Button>
                  )}
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
              </div>
              <DialogTitle className="text-2xl font-semibold tracking-tight text-black mt-1">
                {selectedEvent.event.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-black/45">
                Registration Deadline:{" "}
                {new Date(selectedEvent.event.registrationDeadline).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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

              {/* Hosting Club details */}
              <div className="bg-black/[0.01] border border-black/8 rounded-2xl p-4 space-y-2 text-xs">
                <p className="font-semibold text-black uppercase tracking-wider text-[10px] text-black/45">
                  Hosting Club Leadership
                </p>
                <div className="grid gap-2 sm:grid-cols-2 text-black/65">
                  {selectedEvent.club.facultyCoordinator && (
                    <p>
                      <span className="font-medium text-black">Faculty:</span>{" "}
                      {selectedEvent.club.facultyCoordinator}
                    </p>
                  )}
                  {selectedEvent.club.studentCoordinator && (
                    <p>
                      <span className="font-medium text-black">Student Lead:</span>{" "}
                      {selectedEvent.club.studentCoordinator}
                    </p>
                  )}
                  {selectedEvent.club.contactEmail && (
                    <p className="sm:col-span-2">
                      <span className="font-medium text-black">Email Contact:</span>{" "}
                      <a href={`mailto:${selectedEvent.club.contactEmail}`} className="underline">
                        {selectedEvent.club.contactEmail}
                      </a>
                    </p>
                  )}
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

              {selectedEvent.isUserRegistered ? (
                <Button
                  disabled
                  className="rounded-full px-6 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold cursor-not-allowed"
                >
                  <CheckCircle2 className="size-4 mr-1.5" /> Registered
                </Button>
              ) : selectedEvent.event.status === "Completed" ? (
                <Button
                  disabled
                  className="rounded-full px-6 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                >
                  Event Ended
                </Button>
              ) : new Date(selectedEvent.event.registrationDeadline).getTime() <
                new Date().getTime() ? (
                <Button
                  disabled
                  className="rounded-full px-6 bg-rose-50 border border-rose-100 text-rose-600 cursor-not-allowed"
                >
                  Closed
                </Button>
              ) : selectedEvent.registrationCount >= selectedEvent.event.maxParticipants ? (
                <Button
                  disabled
                  className="rounded-full px-6 bg-amber-50 border border-amber-100 text-amber-600 cursor-not-allowed"
                >
                  Sold Out
                </Button>
              ) : (
                <Button
                  onClick={() => handleRegister(selectedEvent.event.id, selectedEvent.event.title)}
                  disabled={isRegistering === selectedEvent.event.id}
                  className="rounded-full px-6 bg-black text-white hover:bg-black/90 font-medium"
                >
                  {isRegistering === selectedEvent.event.id ? "Registering..." : "Register Now"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
