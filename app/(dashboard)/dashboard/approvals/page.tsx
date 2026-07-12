import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function ApprovalsPage() {
  return (
    <ModulePlaceholder
      title="Approval workflows are reserved"
      description="Membership approvals, club admin verification, and event approvals can be added here without disturbing the RBAC or auth foundation."
      badge="Approvals"
      ctaHref="/dashboard"
      ctaLabel="Back to overview"
      points={[
        "Student and admin approval queues.",
        "Audit-friendly status transitions.",
        "Reason capture and escalation paths.",
        "Plays well with future moderation tooling.",
      ]}
    />
  );
}
