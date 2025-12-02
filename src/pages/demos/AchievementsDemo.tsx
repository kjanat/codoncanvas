import type { ReactElement } from "react";

import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import {
  AchievementsGrid,
  ProgressBar,
  SimulationPanel,
  StatsPanel,
  UnlockNotification,
  useAchievementsDemo,
} from "./achievements";

export default function AchievementsDemo(): ReactElement {
  const demo = useAchievementsDemo();

  return (
    <PageContainer>
      {demo.recentUnlock && (
        <UnlockNotification achievement={demo.recentUnlock} />
      )}

      <PageHeader
        subtitle="Track your progress and earn badges"
        title="Achievements"
      />

      <ProgressBar
        progress={demo.progress}
        totalCount={demo.achievements.length}
        unlockedCount={demo.unlocked.length}
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <SimulationPanel
          onChallengeCorrect={() => demo.simulateChallenge(true)}
          onChallengeIncorrect={() => demo.simulateChallenge(false)}
          onEvolution={demo.simulateEvolution}
          onGenomeExecution={demo.simulateGenomeExecution}
          onMutation={demo.simulateMutation}
          onReset={demo.resetProgress}
          onShapeDraw={demo.simulateShapeDraw}
        />

        <AchievementsGrid
          achievements={demo.filteredAchievements}
          isUnlockedById={demo.isUnlockedById}
          onCategoryChange={demo.setSelectedCategory}
          selectedCategory={demo.selectedCategory}
          unlocked={demo.unlocked}
        />
      </div>

      <StatsPanel stats={demo.stats} />
    </PageContainer>
  );
}
