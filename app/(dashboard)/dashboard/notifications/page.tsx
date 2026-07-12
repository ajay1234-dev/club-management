import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function NotificationsPage() {
  return (
    <ModulePlaceholder
      title="Notification center is scaffolded"
      description="The structure is ready for email announcements, in-app notifications, reminders, and approval notifications through the same module boundary."
      badge="Notifications"
      ctaHref="/dashboard"
      ctaLabel="Back to overview"
      points={[
        "Email and in-app notification feeds.",
        "Announcement templates and triggers.",
        "Unread state and notification history.",
        "Future Resend and workflow integrations.",
      ]}
    />
  );
}
