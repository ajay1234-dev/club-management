import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function AnalyticsPage() {
  return (
    <ModulePlaceholder
      title="Analytics workspace reserved"
      description="Club growth, event participation, engagement trends, and admin performance metrics can plug into this route later without changing the core app shell."
      badge="Analytics"
      ctaHref="/dashboard"
      ctaLabel="Back to overview"
      points={[
        "Role-aware dashboard metrics.",
        "Participation and attendance reporting.",
        "Export-ready summaries for leadership.",
        "Scales cleanly into future BI integrations.",
      ]}
    />
  );
}
