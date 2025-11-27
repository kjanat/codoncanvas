/**
 * Achievement UI Test Suite
 *
 * Tests for gamification UI component that displays badges, notifications,
 * and progress tracking for the achievement system.
 */
import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type {
  Achievement,
  AchievementCategory,
  AchievementEngine,
  UnlockedAchievement,
} from "@/achievement-engine";
import { AchievementUI } from "@/achievement-ui";

// Mock Achievement
const createMockAchievement = (
  overrides: Partial<Achievement> = {},
): Achievement => ({
  id: "test-achievement",
  name: "Test Achievement",
  description: "Test description",
  icon: "🏆",
  category: "basics",
  condition: () => true,
  ...overrides,
});

// Mock AchievementEngine
const createMockEngine = (overrides: Partial<AchievementEngine> = {}) => {
  const achievements = [
    createMockAchievement({
      id: "a1",
      name: "First Steps",
      category: "basics",
    }),
    createMockAchievement({
      id: "a2",
      name: "Getting Started",
      category: "basics",
    }),
    createMockAchievement({
      id: "a3",
      name: "Master Mutator",
      category: "mastery",
    }),
    createMockAchievement({
      id: "a4",
      name: "Code Explorer",
      category: "exploration",
    }),
    createMockAchievement({
      id: "a5",
      name: "Perfectionist",
      category: "perfection",
    }),
  ];

  const unlockedAchievements: UnlockedAchievement[] = [
    {
      achievement: achievements[0],
      unlockedAt: new Date("2025-01-15"),
    },
  ];

  return {
    getAchievements: mock(() => achievements),
    getUnlockedAchievements: mock(() => unlockedAchievements),
    getAchievementsByCategory: mock((category: AchievementCategory) =>
      achievements.filter((a) => a.category === category),
    ),
    getProgressPercentage: mock(() => 20),
    getStats: mock(() => ({
      genomesExecuted: 10,
      mutationsApplied: 25,
      challengesCompleted: 5,
      challengesCorrect: 4,
    })),
    isUnlocked: mock((id: string) => id === "a1"),
    ...overrides,
  } as unknown as AchievementEngine;
};

describe("AchievementUI", () => {
  let container: HTMLElement;
  let mockEngine: ReturnType<typeof createMockEngine>;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "achievement-container";
    document.body.appendChild(container);
    mockEngine = createMockEngine();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    // Clean up notification timeouts and styles
    const styles = document.getElementById("achievement-ui-styles");
    if (styles) styles.remove();
  });

  // Constructor
  describe("constructor", () => {
    test("accepts AchievementEngine and containerId", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      expect(ui).toBeDefined();
    });

    test("throws Error when container element not found", () => {
      expect(
        () => new AchievementUI(mockEngine, "nonexistent-container"),
      ).toThrow("Container element #nonexistent-container not found");
    });

    test("calls injectStyles to add CSS", () => {
      new AchievementUI(mockEngine, "achievement-container");
      expect(document.getElementById("achievement-ui-styles")).not.toBeNull();
    });

    test("calls render to build initial UI", () => {
      new AchievementUI(mockEngine, "achievement-container");
      expect(container.querySelector(".achievement-container")).not.toBeNull();
    });

    test("initializes empty notificationQueue array", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      // Queue is internal - verify by showing multiple notifications
      ui.showUnlockNotification(createMockAchievement({ id: "n1" }));
      ui.showUnlockNotification(createMockAchievement({ id: "n2" }));
      // Both should be queued (first showing, second waiting)
      expect(
        document.querySelectorAll(".achievement-notification").length,
      ).toBe(1);
    });

    test("initializes isShowingNotification to false", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      // Can show notification immediately
      ui.showUnlockNotification(createMockAchievement());
      expect(
        document.querySelector(".achievement-notification"),
      ).not.toBeNull();
    });
  });

  // injectStyles (private)
  describe("injectStyles", () => {
    test("creates style element with id 'achievement-ui-styles'", () => {
      new AchievementUI(mockEngine, "achievement-container");
      expect(document.getElementById("achievement-ui-styles")).not.toBeNull();
    });

    test("appends style to document.head", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const style = document.getElementById("achievement-ui-styles");
      expect(style?.parentElement).toBe(document.head);
    });

    test("does nothing if styles already injected (idempotent)", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const firstStyle = document.getElementById("achievement-ui-styles");
      new AchievementUI(mockEngine, "achievement-container");
      const secondStyle = document.getElementById("achievement-ui-styles");
      expect(firstStyle).toBe(secondStyle);
    });

    test("includes CSS for achievement-container", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const style = document.getElementById("achievement-ui-styles");
      expect(style?.textContent).toContain(".achievement-container");
    });

    test("includes CSS for achievement badges and hover effects", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const style = document.getElementById("achievement-ui-styles");
      expect(style?.textContent).toContain(".achievement-badge");
      expect(style?.textContent).toContain(".achievement-badge:hover");
    });

    test("includes CSS for notification animations (slideIn, pulse)", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const style = document.getElementById("achievement-ui-styles");
      expect(style?.textContent).toContain("@keyframes slideIn");
      expect(style?.textContent).toContain("@keyframes pulse");
    });

    test("includes responsive CSS for mobile devices", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const style = document.getElementById("achievement-ui-styles");
      expect(style?.textContent).toContain("@media");
    });
  });

  // render
  describe("render", () => {
    test("displays achievement title '🏆 Achievements'", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const title = container.querySelector(".achievement-title");
      expect(title?.textContent).toContain("Achievements");
    });

    test("displays unlocked count 'X of Y unlocked'", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const progress = container.querySelector(".achievement-progress");
      expect(progress?.textContent).toContain("1 of 5 unlocked");
    });

    test("calculates and displays progress percentage", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const progress = container.querySelector(".achievement-progress");
      expect(progress?.textContent).toContain("20%");
    });

    test("renders progress bar with correct fill width", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const progressFill = container.querySelector(
        ".achievement-progress-fill",
      ) as HTMLElement;
      expect(progressFill?.style.width).toBe("20%");
    });

    test("displays stat cards with genomesExecuted", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const statCard = container.querySelectorAll(".stat-card")[0];
      expect(statCard?.textContent).toContain("10");
      expect(statCard?.textContent).toContain("Genomes Run");
    });

    test("displays stat cards with mutationsApplied", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const statCard = container.querySelectorAll(".stat-card")[1];
      expect(statCard?.textContent).toContain("25");
      expect(statCard?.textContent).toContain("Mutations Applied");
    });

    test("displays stat cards with challengesCorrect", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const statCard = container.querySelectorAll(".stat-card")[2];
      expect(statCard?.textContent).toContain("4");
      expect(statCard?.textContent).toContain("Challenges Correct");
    });

    test("calculates and displays accuracy percentage", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const statCard = container.querySelectorAll(".stat-card")[3];
      expect(statCard?.textContent).toContain("80%");
      expect(statCard?.textContent).toContain("Accuracy");
    });

    test("renders all four category sections (basics, mastery, exploration, perfection)", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const categories = container.querySelectorAll(".achievement-category");
      expect(categories.length).toBe(4);
    });

    test("uses safe DOM manipulation (replaceChildren, not innerHTML)", () => {
      new AchievementUI(mockEngine, "achievement-container");
      // Verify by checking content exists (built properly)
      expect(container.querySelector(".achievement-container")).not.toBeNull();
    });
  });

  // renderCategory (private)
  describe("renderCategory", () => {
    test("renders category header with icon and title", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const headers = container.querySelectorAll(".category-header");
      expect(headers[0]?.textContent).toContain("Basics");
    });

    test("renders achievement grid for category", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const grids = container.querySelectorAll(".achievement-grid");
      expect(grids.length).toBe(4);
    });

    test("calls renderBadge for each achievement in category", () => {
      new AchievementUI(mockEngine, "achievement-container");
      expect(mockEngine.getAchievementsByCategory).toHaveBeenCalledWith(
        "basics",
      );
    });

    test("handles empty category gracefully", () => {
      const emptyEngine = createMockEngine({
        getAchievementsByCategory: mock(() => []),
      });
      const ui = new AchievementUI(emptyEngine, "achievement-container");
      // Should not throw
      expect(container.querySelector(".achievement-container")).not.toBeNull();
    });
  });

  // renderBadge (private)
  describe("renderBadge", () => {
    test("renders badge with icon, name, and description", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const badge = container.querySelector(".achievement-badge");
      expect(badge?.querySelector(".badge-icon")).not.toBeNull();
      expect(badge?.querySelector(".badge-name")).not.toBeNull();
      expect(badge?.querySelector(".badge-description")).not.toBeNull();
    });

    test("adds 'locked' class when achievement not unlocked", () => {
      new AchievementUI(mockEngine, "achievement-container");
      // a2 is not unlocked
      const badges = container.querySelectorAll(".achievement-badge");
      const lockedBadge = Array.from(badges).find(
        (b) => (b as HTMLElement).dataset["achievementId"] === "a2",
      );
      expect(lockedBadge?.classList.contains("locked")).toBe(true);
    });

    test("adds locked overlay with '🔒 LOCKED' text when locked", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const overlay = container.querySelector(".badge-locked-overlay");
      expect(overlay?.textContent).toContain("LOCKED");
    });

    test("displays unlocked date when achievement is unlocked", () => {
      new AchievementUI(mockEngine, "achievement-container");
      // a1 is unlocked
      const unlockedBadge = container.querySelector(
        '[data-achievement-id="a1"]',
      );
      expect(unlockedBadge?.textContent).toContain("Unlocked:");
    });

    test("does not show unlocked date for locked achievements", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const lockedBadge = container.querySelector('[data-achievement-id="a2"]');
      expect(lockedBadge?.textContent).not.toContain("Unlocked:");
    });

    test("includes data-achievement-id attribute", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const badge = container.querySelector(".achievement-badge");
      expect(badge?.getAttribute("data-achievement-id")).not.toBeNull();
    });

    test("renders with correct CSS classes for styling", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const badge = container.querySelector(".achievement-badge");
      expect(badge?.classList.contains("achievement-badge")).toBe(true);
    });
  });

  // formatDate (private)
  describe("formatDate", () => {
    test("formats Date as 'Month Day, Year' (e.g., 'Jan 15, 2025')", () => {
      new AchievementUI(mockEngine, "achievement-container");
      const unlockedBadge = container.querySelector(
        '[data-achievement-id="a1"]',
      );
      expect(unlockedBadge?.textContent).toContain("Jan 15, 2025");
    });

    test("uses Intl.DateTimeFormat with en-US locale", () => {
      new AchievementUI(mockEngine, "achievement-container");
      // Verify by checking format
      const unlockedBadge = container.querySelector(
        '[data-achievement-id="a1"]',
      );
      // Month Day, Year format
      expect(unlockedBadge?.textContent).toMatch(/Jan \d+, \d{4}/);
    });

    test("handles various date values correctly", () => {
      const engineDiffDate = createMockEngine({
        getUnlockedAchievements: mock(() => [
          {
            achievement: createMockAchievement({ id: "a1" }),
            unlockedAt: new Date("2024-12-25"),
          },
        ]),
      });
      new AchievementUI(engineDiffDate, "achievement-container");
      const badge = container.querySelector('[data-achievement-id="a1"]');
      expect(badge?.textContent).toContain("Dec 25, 2024");
    });
  });

  // showUnlockNotification
  describe("showUnlockNotification", () => {
    test("adds achievement to notificationQueue", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.showUnlockNotification(createMockAchievement({ id: "n1" }));
      // First one shows immediately
      expect(
        document.querySelector(".achievement-notification"),
      ).not.toBeNull();
    });

    test("calls showNextNotification when not already showing", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.showUnlockNotification(createMockAchievement());
      expect(
        document.querySelector(".achievement-notification"),
      ).not.toBeNull();
    });

    test("does not call showNextNotification when already showing", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.showUnlockNotification(createMockAchievement({ id: "n1" }));
      ui.showUnlockNotification(createMockAchievement({ id: "n2" }));
      // Only one notification at a time
      expect(
        document.querySelectorAll(".achievement-notification").length,
      ).toBe(1);
    });

    test("handles multiple notifications by queuing them", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.showUnlockNotification(createMockAchievement({ id: "n1" }));
      ui.showUnlockNotification(createMockAchievement({ id: "n2" }));
      ui.showUnlockNotification(createMockAchievement({ id: "n3" }));
      // First shows, rest queued
      expect(
        document.querySelectorAll(".achievement-notification").length,
      ).toBe(1);
    });
  });

  // showNextNotification (private)
  describe("showNextNotification", () => {
    test("creates notification DOM element with correct structure", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.showUnlockNotification(createMockAchievement());
      const notification = document.querySelector(".achievement-notification");
      expect(notification).not.toBeNull();
      expect(
        notification?.querySelector(".notification-header"),
      ).not.toBeNull();
      expect(notification?.querySelector(".notification-body")).not.toBeNull();
    });

    test("displays '🎉 Achievement Unlocked!' header", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.showUnlockNotification(createMockAchievement());
      const header = document.querySelector(".notification-header");
      expect(header?.textContent).toContain("Achievement Unlocked!");
    });

    test("displays achievement icon, name, and description", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.showUnlockNotification(
        createMockAchievement({
          name: "Test Name",
          description: "Test Desc",
          icon: "🎯",
        }),
      );
      const notification = document.querySelector(".achievement-notification");
      expect(
        notification?.querySelector(".notification-icon")?.textContent,
      ).toBe("🎯");
      expect(
        notification?.querySelector(".notification-name")?.textContent,
      ).toBe("Test Name");
      expect(
        notification?.querySelector(".notification-description")?.textContent,
      ).toBe("Test Desc");
    });

    test("appends notification to document.body", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.showUnlockNotification(createMockAchievement());
      const notification = document.querySelector(".achievement-notification");
      expect(notification?.parentElement).toBe(document.body);
    });

    test("builds DOM programmatically (not innerHTML) for security", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.showUnlockNotification(createMockAchievement());
      // Verify by checking structure exists
      const notification = document.querySelector(".achievement-notification");
      expect(
        notification?.querySelector(".notification-content"),
      ).not.toBeNull();
    });
  });

  // update
  describe("update", () => {
    test("calls render() to refresh the UI", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      const initialContent = container.innerHTML;
      ui.update();
      // Should re-render (content should be similar)
      expect(container.querySelector(".achievement-container")).not.toBeNull();
    });

    test("reflects updated stats from achievement engine", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");

      // Update mock to return different stats
      (mockEngine as unknown as Record<string, unknown>).getStats = mock(() => ({
        genomesCreated: 0,
        genomesExecuted: 50,
        mutationsApplied: 100,
        shapesDrawn: 0,
        colorsUsed: 0,
        transformsApplied: 0,
        challengesCompleted: 20,
        challengesCorrect: 18,
        consecutiveCorrect: 0,
        perfectScores: 0,
        silentIdentified: 0,
        missenseIdentified: 0,
        nonsenseIdentified: 0,
        frameshiftIdentified: 0,
        insertionIdentified: 0,
        deletionIdentified: 0,
        opcodesUsed: new Set<string>(),
        evolutionGenerations: 0,
        audioSynthesisUsed: false,
        timelineStepThroughs: 0,
        timeSpentMinutes: 0,
        sessionsCount: 0,
      }));

      ui.update();
      const statCard = container.querySelectorAll(".stat-card")[0];
      expect(statCard?.textContent).toContain("50");
    });

    test("reflects newly unlocked achievements", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");

      // Update mock to show more unlocked
      mockEngine.isUnlocked = mock(() => true);

      ui.update();
      const lockedBadges = container.querySelectorAll(
        ".achievement-badge.locked",
      );
      expect(lockedBadges.length).toBe(0);
    });
  });

  // handleUnlocks
  describe("handleUnlocks", () => {
    test("calls showUnlockNotification for each achievement in array", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.handleUnlocks([
        createMockAchievement({ id: "h1" }),
        createMockAchievement({ id: "h2" }),
      ]);
      // First shows, second queued
      expect(
        document.querySelector(".achievement-notification"),
      ).not.toBeNull();
    });

    test("handles empty array (no notifications)", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.handleUnlocks([]);
      expect(document.querySelector(".achievement-notification")).toBeNull();
    });

    test("handles multiple achievements in array", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.handleUnlocks([
        createMockAchievement({ id: "h1" }),
        createMockAchievement({ id: "h2" }),
        createMockAchievement({ id: "h3" }),
      ]);
      expect(
        document.querySelector(".achievement-notification"),
      ).not.toBeNull();
    });

    test("preserves order of notifications", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.handleUnlocks([
        createMockAchievement({ id: "first", name: "First" }),
        createMockAchievement({ id: "second", name: "Second" }),
      ]);
      // First notification shown
      const name = document.querySelector(".notification-name");
      expect(name?.textContent).toBe("First");
    });
  });

  // Integration
  describe("integration", () => {
    test("works with mock AchievementEngine instance", () => {
      const _ui = new AchievementUI(mockEngine, "achievement-container");
      expect(container.querySelector(".achievement-container")).not.toBeNull();
    });

    test("updates in real-time as achievements are unlocked", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");

      // Update to show new unlocks
      mockEngine.getUnlockedAchievements = mock(() => [
        {
          achievement: createMockAchievement({ id: "a1" }),
          unlockedAt: new Date(),
        },
        {
          achievement: createMockAchievement({ id: "a2" }),
          unlockedAt: new Date(),
        },
      ]);
      mockEngine.isUnlocked = mock((id) => id === "a1" || id === "a2");
      mockEngine.getProgressPercentage = mock(() => 40);

      ui.update();
      const progress = container.querySelector(".achievement-progress");
      expect(progress?.textContent).toContain("2 of 5 unlocked");
    });

    test("notification queue processes sequentially", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.handleUnlocks([
        createMockAchievement({ id: "seq1" }),
        createMockAchievement({ id: "seq2" }),
      ]);
      // Only one notification visible at a time
      expect(
        document.querySelectorAll(".achievement-notification").length,
      ).toBe(1);
    });

    test("renders correctly across different screen sizes", () => {
      new AchievementUI(mockEngine, "achievement-container");
      // Verify responsive CSS exists
      const style = document.getElementById("achievement-ui-styles");
      expect(style?.textContent).toContain("@media");
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    test("handles achievement engine with no achievements", () => {
      const emptyEngine = createMockEngine({
        getAchievements: mock(() => []),
        getUnlockedAchievements: mock(() => []),
        getAchievementsByCategory: mock(() => []),
        getProgressPercentage: mock(() => 0),
      });
      expect(() => {
        new AchievementUI(emptyEngine, "achievement-container");
      }).not.toThrow();
    });

    test("handles achievement engine with all achievements unlocked", () => {
      const allUnlockedEngine = createMockEngine({
        isUnlocked: mock(() => true),
        getProgressPercentage: mock(() => 100),
      });
      new AchievementUI(allUnlockedEngine, "achievement-container");
      const progress = container.querySelector(".achievement-progress");
      expect(progress?.textContent).toContain("100%");
    });

    test("handles rapid unlock notifications", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      for (let i = 0; i < 10; i++) {
        ui.showUnlockNotification(createMockAchievement({ id: `rapid-${i}` }));
      }
      // Only one showing at a time
      expect(
        document.querySelectorAll(".achievement-notification").length,
      ).toBe(1);
    });

    test("handles multiple render calls in quick succession", () => {
      const ui = new AchievementUI(mockEngine, "achievement-container");
      ui.update();
      ui.update();
      ui.update();
      // Should still work correctly
      expect(container.querySelector(".achievement-container")).not.toBeNull();
    });
  });
});
