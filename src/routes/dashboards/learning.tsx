import { createFileRoute } from "@tanstack/react-router";

import LearningPaths from "@/pages/dashboards/LearningPaths";

export const Route = createFileRoute("/dashboards/learning")({
  component: LearningPaths,
});
