import { createFileRoute } from "@tanstack/react-router";

import Demos from "@/pages/Demos";

export const Route = createFileRoute("/demos/")({
  component: Demos,
});
