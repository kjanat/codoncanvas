import { useState } from "react";
import {
  type Achievement,
  AchievementEngine,
  type PlayerStats,
  type UnlockedAchievement,
} from "@/education/achievements/achievement-engine";
import type { CategoryFilter } from "./types";

export function useAchievementsDemo() {
  const [engine] = useState(() => new AchievementEngine());
  const [stats, setStats] = useState<PlayerStats>(() => engine.getStats());
  const [unlocked, setUnlocked] = useState<UnlockedAchievement[]>(() =>
    engine.getUnlockedAchievements(),
  );
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");
  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);

  const achievements = engine.getAchievements();

  const refreshState = () => {
    setStats(engine.getStats());
    setUnlocked(engine.getUnlockedAchievements());
  };

  const checkNewAchievements = (newlyUnlocked: Achievement[]) => {
    if (newlyUnlocked.length > 0) {
      setRecentUnlock(newlyUnlocked[0]);
      setTimeout(() => setRecentUnlock(null), 3000);
    }
    refreshState();
  };

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

  const isUnlockedById = (id: string) =>
    unlocked.some((u) => u.achievement.id === id);

  const filteredAchievements =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const progress = engine.getProgressPercentage();

  return {
    // State
    stats,
    unlocked,
    achievements,
    filteredAchievements,
    selectedCategory,
    recentUnlock,
    progress,

    // Actions
    setSelectedCategory,
    simulateGenomeExecution,
    simulateShapeDraw,
    simulateMutation,
    simulateChallenge,
    simulateEvolution,
    resetProgress,
    isUnlockedById,
  };
}
