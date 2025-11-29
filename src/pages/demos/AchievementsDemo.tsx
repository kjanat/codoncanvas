import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FilterToggle } from "@/components/FilterToggle";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import {
  type Achievement,
  type AchievementCategory,
  AchievementEngine,
  type PlayerStats,
  type UnlockedAchievement,
} from "@/education/achievements/achievement-engine";

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  basics: "Basics",
  mastery: "Mastery",
  exploration: "Exploration",
  perfection: "Perfection",
};

const CATEGORY_COLORS: Record<AchievementCategory, string> = {
  basics: "bg-blue-100 text-blue-800 border-blue-200",
  mastery: "bg-purple-100 text-purple-800 border-purple-200",
  exploration: "bg-green-100 text-green-800 border-green-200",
  perfection: "bg-amber-100 text-amber-800 border-amber-200",
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-surface p-4 text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="mt-1 text-xs text-text-muted">{label}</div>
    </div>
  );
}

type CategoryFilter = AchievementCategory | "all";

export default function AchievementsDemo() {
  const [engine] = useState(() => new AchievementEngine());
  const [stats, setStats] = useState<PlayerStats>(() => engine.getStats());
  const [achievements] = useState<Achievement[]>(() =>
    engine.getAchievements(),
  );
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>(() =>
    engine.getUnlockedAchievements(),
  );
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");
  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);

  const categoryOptions = useMemo(
    () => [
      { value: "all" as CategoryFilter, label: "All" },
      ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
        value: value as CategoryFilter,
        label,
      })),
    ],
    [],
  );

  const refreshState = useCallback(() => {
    setStats(engine.getStats());
    setUnlocked(engine.getUnlockedAchievements());
  }, [engine]);

  const checkNewAchievements = useCallback(
    (newlyUnlocked: Achievement[]) => {
      if (newlyUnlocked.length > 0) {
        setRecentUnlock(newlyUnlocked[0]);
        setTimeout(() => setRecentUnlock(null), 3000);
      }
      refreshState();
    },
    [refreshState],
  );

  const simulateGenomeExecution = () => {
    const opcodes = ["CIRCLE", "RECT", "COLOR", "LINE", "TRIANGLE"];
    const randomOpcodes = Array.from(
      { length: Math.floor(Math.random() * 5) + 1 },
      () => opcodes[Math.floor(Math.random() * opcodes.length)],
    );
    checkNewAchievements(engine.trackGenomeExecuted(randomOpcodes));
  };

  const simulateShapeDraw = () => {
    const shapes = ["CIRCLE", "RECT", "LINE", "TRIANGLE", "ELLIPSE"];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    checkNewAchievements(engine.trackShapeDrawn(shape));
  };

  const simulateMutation = () => {
    checkNewAchievements(engine.trackMutationApplied());
  };

  const simulateChallenge = (correct: boolean) => {
    const types = [
      "silent",
      "missense",
      "nonsense",
      "frameshift",
      "insertion",
      "deletion",
    ];
    const type = types[Math.floor(Math.random() * types.length)];
    checkNewAchievements(engine.trackChallengeCompleted(correct, type));
  };

  const simulateEvolution = () => {
    checkNewAchievements(engine.trackEvolutionGeneration());
  };

  const resetProgress = () => {
    engine.reset();
    refreshState();
  };

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  const isUnlockedById = (id: string) =>
    unlocked.some((u) => u.achievement.id === id);

  const filteredAchievements =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const progress = engine.getProgressPercentage();

  return (
    <PageContainer>
      {/* Achievement unlock notification */}
      {recentUnlock && (
        <div className="fixed right-4 top-4 z-50 animate-pulse rounded-lg border border-yellow-400 bg-yellow-50 p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{recentUnlock.icon}</span>
            <div>
              <div className="font-bold text-yellow-800">
                Achievement Unlocked!
              </div>
              <div className="text-sm text-yellow-700">{recentUnlock.name}</div>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        subtitle="Track your progress and earn badges"
        title="Achievements"
      />

      {/* Progress bar */}
      <Card className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-medium text-text">Overall Progress</span>
          <span className="text-sm text-text-muted">
            {unlocked.length} / {achievements.length} achievements
          </span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-surface">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-right text-sm font-medium text-primary">
          {progress}%
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Simulation controls */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-text">
            Simulate Actions
          </h2>
          <p className="mb-4 text-sm text-text-muted">
            Test the achievement system by simulating user actions:
          </p>

          <div className="space-y-2">
            <Button
              className="justify-start text-left"
              fullWidth
              onClick={simulateGenomeExecution}
              variant="secondary"
            >
              Execute Genome
            </Button>
            <Button
              className="justify-start text-left"
              fullWidth
              onClick={simulateShapeDraw}
              variant="secondary"
            >
              Draw Shape
            </Button>
            <Button
              className="justify-start text-left"
              fullWidth
              onClick={simulateMutation}
              variant="secondary"
            >
              Apply Mutation
            </Button>
            <Button
              className="justify-start text-left"
              fullWidth
              onClick={() => simulateChallenge(true)}
              variant="secondary"
            >
              Correct Challenge
            </Button>
            <Button
              className="justify-start text-left"
              fullWidth
              onClick={() => simulateChallenge(false)}
              variant="secondary"
            >
              Incorrect Challenge
            </Button>
            <Button
              className="justify-start text-left"
              fullWidth
              onClick={simulateEvolution}
              variant="secondary"
            >
              Evolution Generation
            </Button>
          </div>

          <hr className="my-4 border-border" />

          <Button fullWidth onClick={resetProgress} variant="danger">
            Reset All Progress
          </Button>
        </Card>

        {/* Achievements grid */}
        <Card className="lg:col-span-3">
          {/* Category filter */}
          <FilterToggle
            className="mb-6"
            onSelect={setSelectedCategory}
            options={categoryOptions}
            selected={selectedCategory}
          />

          {/* Achievements */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAchievements.map((achievement) => {
              const isLocked = !isUnlockedById(achievement.id);
              const unlockedData = unlocked.find(
                (u) => u.achievement.id === achievement.id,
              );

              return (
                <div
                  className={`rounded-xl border p-4 transition-all ${
                    isLocked
                      ? "border-border bg-surface/50 opacity-60"
                      : "border-yellow-300 bg-yellow-50 shadow-sm"
                  }`}
                  key={achievement.id}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <span className={`text-3xl ${isLocked ? "grayscale" : ""}`}>
                      {achievement.hidden && isLocked ? "?" : achievement.icon}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                        CATEGORY_COLORS[achievement.category]
                      }`}
                    >
                      {CATEGORY_LABELS[achievement.category]}
                    </span>
                  </div>

                  <h3 className="font-semibold text-text">
                    {achievement.hidden && isLocked ? "???" : achievement.name}
                  </h3>

                  <p className="mt-1 text-sm text-text-muted">
                    {achievement.hidden && isLocked
                      ? "Keep exploring to discover this achievement!"
                      : achievement.description}
                  </p>

                  {unlockedData && (
                    <div className="mt-2 text-xs text-green-600">
                      Unlocked {unlockedData.unlockedAt.toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Stats panel */}
      <Card className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-text">Your Stats</h2>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Genomes Executed" value={stats.genomesExecuted} />
          <StatCard label="Shapes Drawn" value={stats.shapesDrawn} />
          <StatCard label="Mutations Applied" value={stats.mutationsApplied} />
          <StatCard
            label="Challenges Correct"
            value={stats.challengesCorrect}
          />
          <StatCard label="Perfect Scores" value={stats.perfectScores} />
          <StatCard label="Evolution Gens" value={stats.evolutionGenerations} />
        </div>
      </Card>
    </PageContainer>
  );
}
