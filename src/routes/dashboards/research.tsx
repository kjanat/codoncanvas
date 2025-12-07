import { createFileRoute } from "@tanstack/react-router";

import ResearchDashboard from "@/pages/dashboards/ResearchDashboard";

export const Route = createFileRoute("/dashboards/research")({
  component: ResearchDashboard,
});
