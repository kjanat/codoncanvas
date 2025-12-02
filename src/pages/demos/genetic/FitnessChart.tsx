import { useMemo } from "react";
import { useLineChart } from "@/hooks/useLineChart";
import type { GAState } from "./types";

interface FitnessChartProps {
  history: GAState["history"];
}

export function FitnessChart({ history }: FitnessChartProps) {
  const chartSeries = useMemo(
    () => [
      { data: history.map((h) => h.best), color: "#22c55e", width: 2 },
      { data: history.map((h) => h.avg), color: "#94a3b8", width: 1 },
    ],
    [history],
  );

  const chartRef = useLineChart({
    series: chartSeries,
    bgColor: "#f8fafc",
    gridColor: "#e2e8f0",
  });

  return (
    <>
      <canvas
        className="w-full rounded border border-border"
        height={100}
        ref={chartRef}
        width={200}
      />
      <div className="mt-2 flex justify-center gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="h-2 w-4 rounded bg-green-500" /> Best
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-4 rounded bg-slate-400" /> Avg
        </span>
      </div>
    </>
  );
}
