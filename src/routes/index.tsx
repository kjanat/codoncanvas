import { createFileRoute } from "@tanstack/react-router";

import { Playground } from "@/components/Playground";

export interface IndexSearchParams {
  example?: string;
  path?: string;
  g?: string; // genome share param
}

export const Route = createFileRoute("/")({
  component: Playground,
  validateSearch: (search: Record<string, unknown>): IndexSearchParams => ({
    example: typeof search.example === "string" ? search.example : undefined,
    path: typeof search.path === "string" ? search.path : undefined,
    g: typeof search.g === "string" ? search.g : undefined,
  }),
});
