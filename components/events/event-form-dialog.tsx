"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import {
  eventInputSchema,
  createEventAction,
  updateEventAction,
  uploadPosterAction,
} from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type EventFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: {
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
  } | null;
  onSuccess: () => void;
};

type FormValues = z.infer<typeof eventInputSchema>;

// Helper to format ISO Date to YYYY-MM-DDTHH:MM local datetime string
const formatToLocalDatetime = (dateValue: Date | string | null | undefined) => {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function EventFormDialog({ isOpen, onClose, eventToEdit, onSuccess }: EventFormDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      eventInputSchema,
    ) as unknown as import("react-hook-form").Resolver<FormValues>,
    defaultValues: {
      title: "",
      description: "",
      category: "Technical",
      venue: "",
      eventDate: "",
      startTime: "10:00",
      endTime: "12:00",
      registrationDeadline: "",
      maxParticipants: 100,
      organizerDetails: "",
      posterUrl: "",
      status: "Upcoming",
      isPublished: false,
    },
  });

  const posterUrlValue = form.watch("posterUrl");

  // Load edit values
  useEffect(() => {
    if (eventToEdit) {
      form.reset({
        title: eventToEdit.title,
        description: eventToEdit.description,
        category: eventToEdit.category,
        venue: eventToEdit.venue,
        eventDate: formatToLocalDatetime(eventToEdit.eventDate),
        startTime: eventToEdit.startTime,
        endTime: eventToEdit.endTime,
        registrationDeadline: formatToLocalDatetime(eventToEdit.registrationDeadline),
        maxParticipants: eventToEdit.maxParticipants,
        organizerDetails: eventToEdit.organizerDetails,
        posterUrl: eventToEdit.posterUrl ?? "",
        status: eventToEdit.status as "Upcoming" | "Ongoing" | "Completed",
        isPublished: eventToEdit.isPublished,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        category: "Technical",
        venue: "",
        eventDate: "",
        startTime: "10:00",
        endTime: "12:00",
        registrationDeadline: "",
        maxParticipants: 100,
        organizerDetails: "",
        posterUrl: "",
        status: "Upcoming",
        isPublished: false,
      });
    }
  }, [eventToEdit, isOpen, form]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image file size should be less than 4MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const res = await uploadPosterAction(base64);

      if (res.success && res.url) {
        form.setValue("posterUrl", res.url);
        toast.success("Poster uploaded successfully.");
      } else {
        toast.error(res.error || "Failed to upload image.");
      }
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      let res;
      if (eventToEdit) {
        res = await updateEventAction(eventToEdit.id, values);
      } else {
        res = await createEventAction(values);
      }

      if (res.success) {
        toast.success(eventToEdit ? "Event updated successfully" : "Event created successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-black/10 bg-white p-6 shadow-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-black tracking-tight">
            {eventToEdit ? "Edit Event" : "Create New Event"}
          </DialogTitle>
          <DialogDescription className="text-black/60 text-sm">
            Fill in the details to publish or save a draft event for your club.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Event Title
              </Label>
              <Input
                id="title"
                className="h-11 rounded-xl border-black/10 bg-white"
                placeholder="e.g. Annual Hackathon 2026"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-rose-500 text-xs">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                rows={4}
                className="rounded-xl border-black/10 bg-white min-h-[80px]"
                placeholder="Describe the event purpose, schedule, and tracks..."
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-rose-500 text-xs">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              <select
                id="category"
                className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
                {...form.register("category")}
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Literary">Literary</option>
                <option value="Sports">Sports</option>
                <option value="Social Service">Social Service</option>
              </select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="venue" className="text-sm font-medium">
                Venue
              </Label>
              <Input
                id="venue"
                className="h-11 rounded-xl border-black/10 bg-white"
                placeholder="e.g. Seminar Hall A, Campus Ground"
                {...form.register("venue")}
              />
              {form.formState.errors.venue && (
                <p className="text-rose-500 text-xs">{form.formState.errors.venue.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="eventDate" className="text-sm font-medium">
                Event Date & Time
              </Label>
              <Input
                id="eventDate"
                type="datetime-local"
                className="h-11 rounded-xl border-black/10 bg-white"
                {...form.register("eventDate")}
              />
              {form.formState.errors.eventDate && (
                <p className="text-rose-500 text-xs">{form.formState.errors.eventDate.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="registrationDeadline" className="text-sm font-medium">
                Registration Deadline
              </Label>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                className="h-11 rounded-xl border-black/10 bg-white"
                {...form.register("registrationDeadline")}
              />
              {form.formState.errors.registrationDeadline && (
                <p className="text-rose-500 text-xs">
                  {form.formState.errors.registrationDeadline.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="startTime" className="text-sm font-medium">
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  className="h-11 rounded-xl border-black/10 bg-white"
                  {...form.register("startTime")}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="endTime" className="text-sm font-medium">
                  End Time
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  className="h-11 rounded-xl border-black/10 bg-white"
                  {...form.register("endTime")}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="maxParticipants" className="text-sm font-medium">
                Max Participants
              </Label>
              <Input
                id="maxParticipants"
                type="number"
                className="h-11 rounded-xl border-black/10 bg-white"
                {...form.register("maxParticipants")}
              />
              {form.formState.errors.maxParticipants && (
                <p className="text-rose-500 text-xs">
                  {form.formState.errors.maxParticipants.message}
                </p>
              )}
            </div>

            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="organizerDetails" className="text-sm font-medium">
                Organizer Details
              </Label>
              <Input
                id="organizerDetails"
                className="h-11 rounded-xl border-black/10 bg-white"
                placeholder="e.g. Contact Person, Phone Number, Email"
                {...form.register("organizerDetails")}
              />
              {form.formState.errors.organizerDetails && (
                <p className="text-rose-500 text-xs">
                  {form.formState.errors.organizerDetails.message}
                </p>
              )}
            </div>

            {/* Poster Upload Section */}
            <div className="grid gap-1.5 sm:col-span-2">
              <Label className="text-sm font-medium">Event Poster</Label>
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-black/10 p-5 bg-black/[0.01]">
                {posterUrlValue ? (
                  <div className="relative group rounded-xl border overflow-hidden max-h-48 w-full max-w-xs bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={posterUrlValue}
                      alt="Event Poster Preview"
                      className="object-cover w-full h-full max-h-48"
                    />
                    <button
                      type="button"
                      onClick={() => form.setValue("posterUrl", "")}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-4 w-full">
                    {isUploading ? (
                      <Loader2 className="size-8 text-black/50 animate-spin" />
                    ) : (
                      <UploadCloud className="size-8 text-black/35 mb-2" />
                    )}
                    <span className="text-sm font-medium text-black">
                      {isUploading ? "Uploading poster..." : "Upload Event Poster"}
                    </span>
                    <span className="text-xs text-black/45 mt-1">PNG, JPG, or WEBP up to 4MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>
            </div>

            {eventToEdit && (
              <div className="grid gap-1.5">
                <Label htmlFor="status" className="text-sm font-medium">
                  Event Status
                </Label>
                <select
                  id="status"
                  className="h-11 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none"
                  {...form.register("status")}
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 sm:col-span-2">
              <input
                id="isPublished"
                type="checkbox"
                className="size-4 rounded border-black/10 accent-black cursor-pointer"
                {...form.register("isPublished")}
              />
              <Label htmlFor="isPublished" className="text-sm font-medium cursor-pointer">
                Publish immediately (make visible to all students)
              </Label>
            </div>
          </div>

          <DialogFooter className="border-t border-black/5 pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full px-5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="rounded-full px-6 bg-black text-white hover:bg-black/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : eventToEdit ? (
                "Save Changes"
              ) : (
                "Create Event"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
