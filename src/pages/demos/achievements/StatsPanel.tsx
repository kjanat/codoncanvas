import { Card } from "@/components/Card";
import { StatCard } from "@/components/StatCard";
import type { PlayerStats } from "@/education/achievements/achievement-engine";

interface StatsPanelProps {
  stats: PlayerStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <Card className="mt-8">
      <h2 className="mb-4 text-lg font-semibold text-text">Your Stats</h2>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Genomes Executed" value={stats.genomesExecuted} />
        <StatCard label="Shapes Drawn" value={stats.shapesDrawn} />
        <StatCard label="Mutations Applied" value={stats.mutationsApplied} />
        <StatCard label="Challenges Correct" value={stats.challengesCorrect} />
        <StatCard label="Perfect Scores" value={stats.perfectScores} />
        <StatCard label="Evolution Gens" value={stats.evolutionGenerations} />
      </div>
    </Card>
  );
}
