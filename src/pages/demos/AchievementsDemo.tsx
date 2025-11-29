import { useCallback, useEffect, useState } from "react";
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

export default function AchievementsDemo() {
  const [engine] = useState(() => new AchievementEngine());
  const [stats, setStats] = useState<PlayerStats>(() => engine.getStats());
  const [achievements] = useState<Achievement[]>(() =>
    engine.getAchievements(),
  );
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>(() =>
    engine.getUnlockedAchievements(),
  );
  const [selectedCategory, setSelectedCategory] = useState<
    AchievementCategory | "all"
  >("all");
  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);

  const refreshState = useCallback(() => {
    setStats(engine.getStats());
    setUnlocked(engine.getUnlockedAchievements());
  }, [engine]);

  // Check for new achievements after any action
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

  // Simulate various actions
  const simulateGenomeExecution = () => {
    const opcodes = ["CIRCLE", "RECT", "COLOR", "LINE", "TRIANGLE"];
    const randomOpcodes = Array.from(
      { length: Math.floor(Math.random() * 5) + 1 },
      () => opcodes[Math.floor(Math.random() * opcodes.length)],
    );
    const newAchievements = engine.trackGenomeExecuted(randomOpcodes);
    checkNewAchievements(newAchievements);
  };

  const simulateShapeDraw = () => {
    const shapes = ["CIRCLE", "RECT", "LINE", "TRIANGLE", "ELLIPSE"];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const newAchievements = engine.trackShapeDrawn(shape);
    checkNewAchievements(newAchievements);
  };

  const simulateMutation = () => {
    const newAchievements = engine.trackMutationApplied();
    checkNewAchievements(newAchievements);
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
    const newAchievements = engine.trackChallengeCompleted(correct, type);
    checkNewAchievements(newAchievements);
  };

  const simulateEvolution = () => {
    const newAchievements = engine.trackEvolutionGeneration();
    checkNewAchievements(newAchievements);
  };

  const resetProgress = () => {
    engine.reset();
    refreshState();
  };

  // Initial load
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
    <div className="mx-auto max-w-7xl px-4 py-8">
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

      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-text">Achievements</h1>
        <p className="text-text-muted">Track your progress and earn badges</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8 rounded-xl border border-border bg-white p-6 shadow-sm">
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
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Simulation controls */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text">
            Simulate Actions
          </h2>
          <p className="mb-4 text-sm text-text-muted">
            Test the achievement system by simulating user actions:
          </p>

          <div className="space-y-2">
            <button
              className="w-full rounded-lg border border-border px-4 py-2 text-left text-sm hover:bg-surface"
              onClick={simulateGenomeExecution}
              type="button"
            >
              Execute Genome
            </button>
            <button
              className="w-full rounded-lg border border-border px-4 py-2 text-left text-sm hover:bg-surface"
              onClick={simulateShapeDraw}
              type="button"
            >
              Draw Shape
            </button>
            <button
              className="w-full rounded-lg border border-border px-4 py-2 text-left text-sm hover:bg-surface"
              onClick={simulateMutation}
              type="button"
            >
              Apply Mutation
            </button>
            <button
              className="w-full rounded-lg border border-border px-4 py-2 text-left text-sm hover:bg-surface"
              onClick={() => simulateChallenge(true)}
              type="button"
            >
              Correct Challenge
            </button>
            <button
              className="w-full rounded-lg border border-border px-4 py-2 text-left text-sm hover:bg-surface"
              onClick={() => simulateChallenge(false)}
              type="button"
            >
              Incorrect Challenge
            </button>
            <button
              className="w-full rounded-lg border border-border px-4 py-2 text-left text-sm hover:bg-surface"
              onClick={simulateEvolution}
              type="button"
            >
              Evolution Generation
            </button>
          </div>

          <hr className="my-4 border-border" />

          <button
            className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100"
            onClick={resetProgress}
            type="button"
          >
            Reset All Progress
          </button>
        </div>

        {/* Achievements grid */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-white p-6 shadow-sm">
          {/* Category filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-white"
                  : "bg-surface text-text hover:bg-primary/10"
              }`}
              onClick={() => setSelectedCategory("all")}
              type="button"
            >
              All
            </button>
            {(Object.keys(CATEGORY_LABELS) as AchievementCategory[]).map(
              (cat) => (
                <button
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-white"
                      : "bg-surface text-text hover:bg-primary/10"
                  }`}
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  type="button"
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ),
            )}
          </div>

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
        </div>
      </div>

      {/* Stats panel */}
      <div className="mt-8 rounded-xl border border-border bg-white p-6 shadow-sm">
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
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-surface p-4 text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="mt-1 text-xs text-text-muted">{label}</div>
    </div>
  );
}
