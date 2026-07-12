"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Users,
  BarChart3,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { deleteEventAction, togglePublishAction } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventFormDialog } from "./event-form-dialog";

type EventDetails = {
  id: string;
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

type Registration = {
  applicationId: string;
  eventId: string;
  eventTitle: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string | null;
  appliedAt: Date | string;
};

type ClubAdminViewProps = {
  clubName: string;
  clubIcon: string;
  eventsList: { event: EventDetails }[];
  registrationsList: Registration[];
  stats: {
    totalEvents: number;
    publishedEvents: number;
    upcomingEvents: number;
    totalRegistrations: number;
  };
};

export function ClubAdminView({
  clubName,
  clubIcon,
  eventsList,
  registrationsList,
  stats,
}: ClubAdminViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventDetails | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("events");

  // Filtering events
  const filteredEvents = eventsList.filter(({ event }) => {
    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.venue.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtering registrations
  const filteredRegistrations = registrationsList.filter(
    (reg) =>
      reg.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
      reg.studentName.toLowerCase().includes(search.toLowerCase()) ||
      reg.studentEmail.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEditClick = (event: EventDetails) => {
    setEventToEdit(event);
    setIsFormOpen(true);
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await togglePublishAction(id);
      if (res.success) {
        toast.success(
          res.event?.isPublished
            ? "Event published successfully"
            : "Event unpublished successfully",
        );
      } else {
        toast.error(res.error || "Failed to toggle status");
      }
    } catch {
      toast.error("Failed to toggle publish status");
    }
  };

  const handleDeleteClick = async (id: string, title: string) => {
    if (
      confirm(`Are you sure you want to delete the event "${title}"? This action cannot be undone.`)
    ) {
      try {
        const res = await deleteEventAction(id);
        if (res.success) {
          toast.success("Event deleted successfully");
        } else {
          toast.error(res.error || "Failed to delete event");
        }
      } catch {
        toast.error("An error occurred while deleting the event");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Club Admin Banner */}
      <section className="paper-card p-6 lg:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl border border-black/10 bg-black text-xl text-white shadow-sm font-semibold select-none">
            {clubIcon}
          </span>
          <div>
            <Badge
              variant="secondary"
              className="rounded-full bg-black/5 border-black/5 text-[10px] text-black/60 font-semibold uppercase"
            >
              Club Workspace
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-black mt-0.5">{clubName}</h2>
          </div>
        </div>
        <Button
          onClick={() => {
            setEventToEdit(null);
            setIsFormOpen(true);
          }}
          className="rounded-full px-5 bg-black text-white hover:bg-black/90 shrink-0 font-medium"
        >
          <Plus className="size-4 mr-2" />
          Create Event
        </Button>
      </section>

      {/* Analytics Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Events",
            value: stats.totalEvents,
            icon: BarChart3,
            desc: "Drafts + Published",
          },
          {
            label: "Published Events",
            value: stats.publishedEvents,
            icon: Sparkles,
            desc: "Visible to students",
          },
          {
            label: "Upcoming Events",
            value: stats.upcomingEvents,
            icon: AlertCircle,
            desc: "Active upcoming feeds",
          },
          {
            label: "Registrations",
            value: stats.totalRegistrations,
            icon: Users,
            desc: "Signups across events",
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

      {/* Workspace Tabs */}
      <Tabs
        defaultValue="events"
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v);
          setSearch("");
        }}
        className="space-y-4"
      >
        <TabsList className="bg-black/5 border border-black/5 rounded-full p-1 h-auto inline-flex">
          <TabsTrigger
            value="events"
            className="rounded-full px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
          >
            Manage Events
          </TabsTrigger>
          <TabsTrigger
            value="registrations"
            className="rounded-full px-5 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
          >
            Registrations ({filteredRegistrations.length})
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mt-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-black/40" />
            <Input
              type="text"
              placeholder={
                activeTab === "events"
                  ? "Search events by title or venue..."
                  : "Search student names or emails..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 rounded-2xl border-black/10 bg-white/90"
            />
          </div>

          {activeTab === "events" && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-black/45 font-medium">Filter status:</span>
              <select
                className="h-10 rounded-2xl border border-black/10 bg-white px-3 text-xs outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Events</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Manage Events */}
        <TabsContent value="events">
          <Card className="paper-card border-black/10 bg-white/80 overflow-hidden shadow-none p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/[0.02]">
                  <TableRow>
                    <TableHead>Event Poster</TableHead>
                    <TableHead>Event details</TableHead>
                    <TableHead>Event Date & Venue</TableHead>
                    <TableHead>Max Seats</TableHead>
                    <TableHead>Publish Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-black/40">
                        No events found matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map(({ event }) => {
                      const eventDateStr = new Date(event.eventDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });

                      return (
                        <TableRow key={event.id} className="hover:bg-black/[0.01]">
                          <TableCell className="py-3">
                            <div className="w-16 h-12 rounded-lg border overflow-hidden bg-black/5 flex items-center justify-center">
                              {event.posterUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={event.posterUrl}
                                  alt={event.title}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <span className="text-[10px] text-black/40 font-bold uppercase">
                                  {clubIcon}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-black">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-sm sm:text-base">{event.title}</p>
                              <div className="flex items-center gap-1.5">
                                <Badge
                                  variant="outline"
                                  className="rounded-full text-[9px] font-normal scale-90 -ml-1 border-black/10 py-0"
                                >
                                  {event.category}
                                </Badge>
                                <span
                                  className={`text-[10px] font-semibold ${
                                    event.status === "Upcoming"
                                      ? "text-amber-600"
                                      : event.status === "Ongoing"
                                        ? "text-blue-600"
                                        : "text-neutral-500"
                                  }`}
                                >
                                  {event.status}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-black/60">
                            <p className="font-medium text-black">{eventDateStr}</p>
                            <p className="text-[10px] text-black/45 mt-0.5">
                              {event.startTime} • {event.venue}
                            </p>
                          </TableCell>
                          <TableCell className="text-xs text-black/60 font-mono">
                            {event.maxParticipants}
                          </TableCell>
                          <TableCell>
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(event.id)}
                              className="focus:outline-none"
                              title="Click to toggle publish status"
                            >
                              {event.isPublished ? (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full text-xs font-normal hover:bg-emerald-100 flex items-center gap-1 cursor-pointer">
                                  <CheckCircle className="size-3" /> Published
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="bg-zinc-100 text-zinc-600 border-zinc-200 rounded-full text-xs font-normal hover:bg-zinc-200 flex items-center gap-1 cursor-pointer"
                                >
                                  <XCircle className="size-3" /> Draft
                                </Badge>
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="text-right py-3 pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="icon-sm"
                                variant="outline"
                                onClick={() => handleEditClick(event)}
                                className="rounded-full bg-white hover:bg-black/5"
                                title="Edit"
                              >
                                <Edit className="size-3.5" />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="outline"
                                onClick={() => handleDeleteClick(event.id, event.title)}
                                className="rounded-full bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border-rose-100"
                                title="Delete"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Registrations Log */}
        <TabsContent value="registrations">
          <Card className="paper-card border-black/10 bg-white/80 overflow-hidden shadow-none p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/[0.02]">
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Student name</TableHead>
                    <TableHead>Contact details</TableHead>
                    <TableHead>Applied At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-black/40">
                        No registration applications received yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((reg) => {
                      const appliedDate = new Date(reg.appliedAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <TableRow key={reg.applicationId} className="hover:bg-black/[0.01]">
                          <TableCell className="font-semibold text-black">
                            {reg.eventTitle}
                          </TableCell>
                          <TableCell className="font-medium text-black/85">
                            {reg.studentName}
                          </TableCell>
                          <TableCell className="text-xs text-black/60 leading-relaxed">
                            <p className="font-medium text-black">{reg.studentEmail}</p>
                            {reg.studentPhone && (
                              <p className="text-[10px] text-black/45 mt-0.5">{reg.studentPhone}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-black/50">{appliedDate}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      <EventFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEventToEdit(null);
        }}
        eventToEdit={eventToEdit}
        onSuccess={() => {
          // Re-rendering happens through Next.js refresh or router.refresh in component or actions revalidation
        }}
      />
    </div>
  );
}
