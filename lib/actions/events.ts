"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { events } from "@/config/schema";
import {
  checkApplicationExists,
  createApplication,
  createEvent,
  deleteEvent,
  getEventById,
  updateEvent,
  type UpdateEventInput,
} from "@/lib/repositories/events-repository";
import { uploadPosterToCloudinary } from "@/lib/services/cloudinary";

export async function uploadPosterAction(base64Data: string) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "club_admin" && session.user.role !== "super_admin")
  ) {
    return { success: false, error: "Unauthorized. Privileged role required." };
  }
  try {
    const url = await uploadPosterToCloudinary(base64Data);
    return { success: true, url };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image.";
    return { success: false, error: message };
  }
}

// Input validation schema for events
export const eventInputSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(160),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  venue: z.string().min(2, "Venue must be at least 2 characters").max(160),
  eventDate: z.string().min(1, "Event date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  registrationDeadline: z.string().min(1, "Registration deadline is required"),
  maxParticipants: z.coerce.number().int().min(1, "Maximum participants must be at least 1"),
  organizerDetails: z.string().min(5, "Organizer details must be at least 5 characters"),
  posterUrl: z.string().url("Enter a valid image URL").or(z.string().nullable().optional()),
  status: z.enum(["Upcoming", "Ongoing", "Completed"]).default("Upcoming"),
  isPublished: z.boolean().default(false),
});

export async function createEventAction(formData: z.infer<typeof eventInputSchema>) {
  const session = await auth();

  if (!session?.user || session.user.role !== "club_admin") {
    return { success: false, error: "Unauthorized. Club Admin privilege required." };
  }

  const clubId = session.user.clubId;
  if (!clubId) {
    return { success: false, error: "Your admin account is not linked to any club." };
  }

  const validated = eventInputSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  try {
    const event = await createEvent({
      ...validated.data,
      clubId,
      createdBy: session.user.id,
      eventDate: new Date(validated.data.eventDate),
      registrationDeadline: new Date(validated.data.registrationDeadline),
    });

    revalidatePath("/dashboard/events");
    revalidatePath("/dashboard");
    return { success: true, event };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create event.";
    return { success: false, error: message };
  }
}

export async function updateEventAction(
  id: string,
  formData: Partial<z.infer<typeof eventInputSchema>>,
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "club_admin") {
    return { success: false, error: "Unauthorized. Club Admin privilege required." };
  }

  const existing = await getEventById(id);
  if (!existing) {
    return { success: false, error: "Event not found." };
  }

  // Ensure authorization: club admins can only manage their own club's events
  if (existing.event.clubId !== session.user.clubId) {
    return { success: false, error: "Unauthorized. You cannot modify events of another club." };
  }

  const validated = eventInputSchema.partial().safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message };
  }

  try {
    const { eventDate, registrationDeadline, ...rest } = validated.data;
    const payload: Partial<typeof events.$inferInsert> = { ...rest };
    if (eventDate) payload.eventDate = new Date(eventDate);
    if (registrationDeadline) payload.registrationDeadline = new Date(registrationDeadline);

    const event = await updateEvent(id, payload as UpdateEventInput);

    revalidatePath("/dashboard/events");
    revalidatePath(`/dashboard/events/${id}`);
    revalidatePath("/dashboard");
    return { success: true, event };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update event.";
    return { success: false, error: message };
  }
}

export async function deleteEventAction(id: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "club_admin") {
    return { success: false, error: "Unauthorized. Club Admin privilege required." };
  }

  const existing = await getEventById(id);
  if (!existing) {
    return { success: false, error: "Event not found." };
  }

  if (existing.event.clubId !== session.user.clubId) {
    return { success: false, error: "Unauthorized. You cannot delete events of another club." };
  }

  try {
    await deleteEvent(id);
    revalidatePath("/dashboard/events");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete event.";
    return { success: false, error: message };
  }
}

export async function togglePublishAction(id: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "club_admin") {
    return { success: false, error: "Unauthorized. Club Admin privilege required." };
  }

  const existing = await getEventById(id);
  if (!existing) {
    return { success: false, error: "Event not found." };
  }

  if (existing.event.clubId !== session.user.clubId) {
    return { success: false, error: "Unauthorized. You cannot publish events of another club." };
  }

  try {
    const event = await updateEvent(id, {
      isPublished: !existing.event.isPublished,
    });
    revalidatePath("/dashboard/events");
    revalidatePath("/dashboard");
    return { success: true, event };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to toggle status.";
    return { success: false, error: message };
  }
}

export async function registerForEventAction(eventId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "student") {
    return { success: false, error: "Unauthorized. Only students can apply for events." };
  }

  const eventDetails = await getEventById(eventId);
  if (!eventDetails) {
    return { success: false, error: "Event not found." };
  }

  const { event } = eventDetails;

  if (!event.isPublished) {
    return {
      success: false,
      error: "This event is currently a draft and not open for applications.",
    };
  }

  if (event.status === "Completed") {
    return { success: false, error: "This event has already completed." };
  }

  const now = new Date();
  if (new Date(event.registrationDeadline).getTime() < now.getTime()) {
    return { success: false, error: "Registration deadline has passed." };
  }

  // Prevent duplicate registrations
  const alreadyApplied = await checkApplicationExists(eventId, session.user.id);
  if (alreadyApplied) {
    return { success: false, error: "You are already registered for this event." };
  }

  try {
    const application = await createApplication(eventId, session.user.id);
    revalidatePath("/dashboard/applications");
    revalidatePath("/dashboard/events");
    revalidatePath("/dashboard");
    return { success: true, application };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to register for the event.";
    return { success: false, error: message };
  }
}
