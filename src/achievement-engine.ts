/**
 * Achievement System for CodonCanvas
 * Tracks student progress and unlocks achievements based on gameplay milestones
 * Designed to increase engagement and provide measurable learning goals
 */

export type AchievementCategory = 'basics' | 'mastery' | 'exploration' | 'perfection';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition: (stats: PlayerStats) => boolean;
  hidden?: boolean; // Hide until unlocked (for surprise achievements)
}

export interface PlayerStats {
  // Core activity
  genomesCreated: number;
  genomesExecuted: number;
  mutationsApplied: number;

  // Drawing activity
  shapesDrawn: number;
  colorsUsed: number;
  transformsApplied: number;

  // Assessment performance
  challengesCompleted: number;
  challengesCorrect: number;
  consecutiveCorrect: number;
  perfectScores: number; // Times achieved 100% on assessment set

  // Mutation types identified
  silentIdentified: number;
  missenseIdentified: number;
  nonsenseIdentified: number;
  frameshiftIdentified: number;
  insertionIdentified: number;
  deletionIdentified: number;

  // Opcode usage tracking
  opcodesUsed: Set<string>; // Track which opcodes have been used

  // Advanced features
  evolutionGenerations: number;
  audioSynthesisUsed: boolean;
  timelineStepThroughs: number;

  // Time tracking
  timeSpentMinutes: number;
  sessionsCount: number;

  // Special events
  firstGenomeDate?: Date;
  longestGenomeLength: number;
}

export interface UnlockedAchievement {
  achievement: Achievement;
  unlockedAt: Date;
  progress?: number; // 0-100 for partial achievements
}

export class AchievementEngine {
  private achievements: Achievement[];
  private stats: PlayerStats;
  private unlockedAchievements: Map<string, UnlockedAchievement>;
  private storageKey = 'codoncanvas_achievements';

  constructor() {
    this.achievements = this.defineAchievements();
    this.stats = this.loadStats();
    this.unlockedAchievements = this.loadUnlockedAchievements();
  }

  /**
   * Define all available achievements
   */
  private defineAchievements(): Achievement[] {
    return [
      // ===== BASICS (Onboarding) =====
      {
        id: 'first_genome',
        name: 'First Genome',
        description: 'Create and execute your first genome',
        icon: '🧬',
        category: 'basics',
        condition: (stats) => stats.genomesExecuted >= 1
      },
      {
        id: 'first_draw',
        name: 'First Draw',
        description: 'Successfully draw your first shape',
        icon: '🎨',
        category: 'basics',
        condition: (stats) => stats.shapesDrawn >= 1
      },
      {
        id: 'first_mutation',
        name: 'First Mutation',
        description: 'Apply your first mutation to a genome',
        icon: '🔄',
        category: 'basics',
        condition: (stats) => stats.mutationsApplied >= 1
      },
      {
        id: 'shape_explorer',
        name: 'Shape Explorer',
        description: 'Use all 5 shape opcodes (CIRCLE, RECT, LINE, TRIANGLE, ELLIPSE)',
        icon: '🎭',
        category: 'basics',
        condition: (stats) => {
          const shapeOpcodes = ['CIRCLE', 'RECT', 'LINE', 'TRIANGLE', 'ELLIPSE'];
          return shapeOpcodes.every(op => stats.opcodesUsed.has(op));
        }
      },

      // ===== MASTERY (Skill Development) =====
      {
        id: 'mutation_expert',
        name: 'Mutation Expert',
        description: 'Correctly identify 10 mutations in assessment mode',
        icon: '🎯',
        category: 'mastery',
        condition: (stats) => stats.challengesCorrect >= 10
      },
      {
        id: 'perfect_score',
        name: 'Perfect Score',
        description: 'Achieve 100% accuracy on an assessment',
        icon: '🏆',
        category: 'mastery',
        condition: (stats) => stats.perfectScores >= 1
      },
      {
        id: 'pattern_master',
        name: 'Pattern Master',
        description: 'Correctly identify all 6 mutation types at least once',
        icon: '🔬',
        category: 'mastery',
        condition: (stats) =>
          stats.silentIdentified >= 1 &&
          stats.missenseIdentified >= 1 &&
          stats.nonsenseIdentified >= 1 &&
          stats.frameshiftIdentified >= 1 &&
          stats.insertionIdentified >= 1 &&
          stats.deletionIdentified >= 1
      },
      {
        id: 'speed_runner',
        name: 'Speed Runner',
        description: 'Complete 5 assessment challenges in under 5 minutes',
        icon: '⚡',
        category: 'mastery',
        condition: (stats) => stats.consecutiveCorrect >= 5 // Simplified condition
      },

      // ===== EXPLORATION (Discovery) =====
      {
        id: 'color_artist',
        name: 'Color Artist',
        description: 'Use the COLOR opcode 10 times',
        icon: '🌈',
        category: 'exploration',
        condition: (stats) => stats.colorsUsed >= 10
      },
      {
        id: 'mad_scientist',
        name: 'Mad Scientist',
        description: 'Apply 100 total mutations across all your work',
        icon: '🧪',
        category: 'exploration',
        condition: (stats) => stats.mutationsApplied >= 100
      },
      {
        id: 'audio_pioneer',
        name: 'Audio Pioneer',
        description: 'Experiment with audio synthesis mode',
        icon: '🎼',
        category: 'exploration',
        condition: (stats) => stats.audioSynthesisUsed
      },
      {
        id: 'evolution_master',
        name: 'Evolution Master',
        description: 'Run 50 generations in evolution lab',
        icon: '🧬',
        category: 'exploration',
        condition: (stats) => stats.evolutionGenerations >= 50
      },

      // ===== PERFECTION (Excellence) =====
      {
        id: 'flawless',
        name: 'Flawless',
        description: 'Get 10 consecutive correct assessments',
        icon: '💎',
        category: 'perfection',
        condition: (stats) => stats.consecutiveCorrect >= 10
      },
      {
        id: 'professor',
        name: 'Professor',
        description: 'Achieve 95%+ accuracy on 50+ assessment challenges',
        icon: '🎓',
        category: 'perfection',
        condition: (stats) =>
          stats.challengesCompleted >= 50 &&
          (stats.challengesCorrect / stats.challengesCompleted) >= 0.95
      },
      {
        id: 'elite_coder',
        name: 'Elite Coder',
        description: 'Create and execute a genome with over 100 codons',
        icon: '🏅',
        category: 'perfection',
        condition: (stats) => stats.longestGenomeLength >= 100
      },
      {
        id: 'legend',
        name: 'Legend',
        description: 'Unlock all other achievements',
        icon: '🌟',
        category: 'perfection',
        condition: (stats) => {
          // Special logic handled in checkAchievements()
          return false; // Will be manually unlocked when all others complete
        },
        hidden: true
      }
    ];
  }

  /**
   * Initialize default player stats
   */
  private getDefaultStats(): PlayerStats {
    return {
      genomesCreated: 0,
      genomesExecuted: 0,
      mutationsApplied: 0,
      shapesDrawn: 0,
      colorsUsed: 0,
      transformsApplied: 0,
      challengesCompleted: 0,
      challengesCorrect: 0,
      consecutiveCorrect: 0,
      perfectScores: 0,
      silentIdentified: 0,
      missenseIdentified: 0,
      nonsenseIdentified: 0,
      frameshiftIdentified: 0,
      insertionIdentified: 0,
      deletionIdentified: 0,
      opcodesUsed: new Set(),
      evolutionGenerations: 0,
      audioSynthesisUsed: false,
      timelineStepThroughs: 0,
      timeSpentMinutes: 0,
      sessionsCount: 0,
      longestGenomeLength: 0
    };
  }

  /**
   * Load stats from localStorage
   */
  private loadStats(): PlayerStats {
    try {
      const saved = localStorage.getItem(`${this.storageKey}_stats`);
      if (!saved) return this.getDefaultStats();

      const parsed = JSON.parse(saved);
      // Convert opcodesUsed array back to Set
      parsed.opcodesUsed = new Set(parsed.opcodesUsed || []);
      if (parsed.firstGenomeDate) {
        parsed.firstGenomeDate = new Date(parsed.firstGenomeDate);
      }
      return parsed;
    } catch (e) {
      console.error('Failed to load achievement stats:', e);
      return this.getDefaultStats();
    }
  }

  /**
   * Load unlocked achievements from localStorage
   */
  private loadUnlockedAchievements(): Map<string, UnlockedAchievement> {
    try {
      const saved = localStorage.getItem(`${this.storageKey}_unlocked`);
      if (!saved) return new Map();

      const parsed = JSON.parse(saved);
      const map = new Map<string, UnlockedAchievement>();

      for (const [id, data] of Object.entries(parsed)) {
        const unlocked = data as any;
        const achievement = this.achievements.find(a => a.id === id);
        if (achievement) {
          map.set(id, {
            achievement,
            unlockedAt: new Date(unlocked.unlockedAt),
            progress: unlocked.progress
          });
        }
      }

      return map;
    } catch (e) {
      console.error('Failed to load unlocked achievements:', e);
      return new Map();
    }
  }

  /**
   * Save current state to localStorage
   */
  private save(): void {
    try {
      // Save stats (convert Set to Array for JSON)
      const statsToSave = {
        ...this.stats,
        opcodesUsed: Array.from(this.stats.opcodesUsed)
      };
      localStorage.setItem(`${this.storageKey}_stats`, JSON.stringify(statsToSave));

      // Save unlocked achievements
      const unlockedToSave: Record<string, any> = {};
      this.unlockedAchievements.forEach((data, id) => {
        unlockedToSave[id] = {
          achievementId: id,
          unlockedAt: data.unlockedAt.toISOString(),
          progress: data.progress
        };
      });
      localStorage.setItem(`${this.storageKey}_unlocked`, JSON.stringify(unlockedToSave));
    } catch (e) {
      console.error('Failed to save achievement data:', e);
    }
  }

  /**
   * Track genome creation
   */
  trackGenomeCreated(genomeLength: number): Achievement[] {
    this.stats.genomesCreated++;
    if (!this.stats.firstGenomeDate) {
      this.stats.firstGenomeDate = new Date();
    }
    if (genomeLength > this.stats.longestGenomeLength) {
      this.stats.longestGenomeLength = genomeLength;
    }
    return this.checkAchievements();
  }

  /**
   * Track genome execution
   */
  trackGenomeExecuted(opcodes: string[]): Achievement[] {
    this.stats.genomesExecuted++;
    opcodes.forEach(op => this.stats.opcodesUsed.add(op));
    return this.checkAchievements();
  }

  /**
   * Track mutation application
   */
  trackMutationApplied(): Achievement[] {
    this.stats.mutationsApplied++;
    return this.checkAchievements();
  }

  /**
   * Track shape drawing
   */
  trackShapeDrawn(opcode: string): Achievement[] {
    this.stats.shapesDrawn++;
    this.stats.opcodesUsed.add(opcode);
    return this.checkAchievements();
  }

  /**
   * Track color usage
   */
  trackColorUsed(): Achievement[] {
    this.stats.colorsUsed++;
    this.stats.opcodesUsed.add('COLOR');
    return this.checkAchievements();
  }

  /**
   * Track transform usage
   */
  trackTransformApplied(opcode: string): Achievement[] {
    this.stats.transformsApplied++;
    this.stats.opcodesUsed.add(opcode);
    return this.checkAchievements();
  }

  /**
   * Track assessment challenge completion
   */
  trackChallengeCompleted(correct: boolean, mutationType: string): Achievement[] {
    this.stats.challengesCompleted++;

    if (correct) {
      this.stats.challengesCorrect++;
      this.stats.consecutiveCorrect++;

      // Track mutation type identification
      switch (mutationType) {
        case 'silent': this.stats.silentIdentified++; break;
        case 'missense': this.stats.missenseIdentified++; break;
        case 'nonsense': this.stats.nonsenseIdentified++; break;
        case 'frameshift': this.stats.frameshiftIdentified++; break;
        case 'insertion': this.stats.insertionIdentified++; break;
        case 'deletion': this.stats.deletionIdentified++; break;
      }
    } else {
      this.stats.consecutiveCorrect = 0;
    }

    return this.checkAchievements();
  }

  /**
   * Track perfect assessment score
   */
  trackPerfectScore(): Achievement[] {
    this.stats.perfectScores++;
    return this.checkAchievements();
  }

  /**
   * Track evolution generations
   */
  trackEvolutionGeneration(): Achievement[] {
    this.stats.evolutionGenerations++;
    return this.checkAchievements();
  }

  /**
   * Track audio synthesis usage
   */
  trackAudioSynthesis(): Achievement[] {
    this.stats.audioSynthesisUsed = true;
    return this.checkAchievements();
  }

  /**
   * Track timeline step-through
   */
  trackTimelineStepThrough(): Achievement[] {
    this.stats.timelineStepThroughs++;
    return this.checkAchievements();
  }

  /**
   * Check all achievement conditions and unlock any newly earned achievements
   * @returns Array of newly unlocked achievements
   */
  private checkAchievements(): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of this.achievements) {
      // Skip if already unlocked
      if (this.unlockedAchievements.has(achievement.id)) continue;

      // Skip legend achievement (handled specially)
      if (achievement.id === 'legend') continue;

      // Check condition
      if (achievement.condition(this.stats)) {
        this.unlockedAchievements.set(achievement.id, {
          achievement,
          unlockedAt: new Date()
        });
        newlyUnlocked.push(achievement);
      }
    }

    // Check if all non-legend achievements are unlocked
    const nonLegendAchievements = this.achievements.filter(a => a.id !== 'legend');
    const allUnlocked = nonLegendAchievements.every(a => this.unlockedAchievements.has(a.id));

    if (allUnlocked && !this.unlockedAchievements.has('legend')) {
      const legendAchievement = this.achievements.find(a => a.id === 'legend')!;
      this.unlockedAchievements.set('legend', {
        achievement: legendAchievement,
        unlockedAt: new Date()
      });
      newlyUnlocked.push(legendAchievement);
    }

    // Save if anything changed
    if (newlyUnlocked.length > 0) {
      this.save();
    }

    return newlyUnlocked;
  }

  /**
   * Get all achievements
   */
  getAchievements(): Achievement[] {
    return this.achievements;
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return this.achievements.filter(a => a.category === category);
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements(): UnlockedAchievement[] {
    return Array.from(this.unlockedAchievements.values())
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  }

  /**
   * Check if achievement is unlocked
   */
  isUnlocked(achievementId: string): boolean {
    return this.unlockedAchievements.has(achievementId);
  }

  /**
   * Get current player stats
   */
  getStats(): PlayerStats {
    return { ...this.stats, opcodesUsed: new Set(this.stats.opcodesUsed) };
  }

  /**
   * Get progress percentage (0-100)
   */
  getProgressPercentage(): number {
    const total = this.achievements.length;
    const unlocked = this.unlockedAchievements.size;
    return Math.round((unlocked / total) * 100);
  }

  /**
   * Reset all progress (for testing or new user)
   */
  reset(): void {
    this.stats = this.getDefaultStats();
    this.unlockedAchievements.clear();
    this.save();
  }

  /**
   * Export achievement data (for debugging or analytics)
   */
  export(): string {
    return JSON.stringify({
      stats: {
        ...this.stats,
        opcodesUsed: Array.from(this.stats.opcodesUsed)
      },
      unlocked: Array.from(this.unlockedAchievements.keys()),
      progress: this.getProgressPercentage()
    }, null, 2);
  }
}
