import { createFileRoute } from "@tanstack/react-router";

import TeacherDashboard from "@/pages/dashboards/TeacherDashboard";

export const Route = createFileRoute("/dashboards/teacher")({
  component: TeacherDashboard,
});
