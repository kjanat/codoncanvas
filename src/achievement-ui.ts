/**
 * Achievement UI Component for CodonCanvas
 * Displays badges, notifications, and progress tracking for gamification system
 */

import type {
  Achievement,
  AchievementCategory,
  AchievementEngine,
} from "@/achievement-engine";

export class AchievementUI {
  private engine: AchievementEngine;
  private container: HTMLElement;
  private notificationQueue: Achievement[] = [];
  private isShowingNotification = false;

  constructor(engine: AchievementEngine, containerId: string) {
    this.engine = engine;
    const elem = document.getElementById(containerId);
    if (!elem) {
      throw new Error(`Container element #${containerId} not found`);
    }
    this.container = elem;
    this.injectStyles();
    this.render();
  }

  /**
   * Inject CSS styles for achievement UI
   */
  private injectStyles(): void {
    const styleId = "achievement-ui-styles";
    if (document.getElementById(styleId)) return;

    const styles = `
      .achievement-container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }

      .achievement-header {
        text-align: center;
        margin-bottom: 30px;
      }

      .achievement-title {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .achievement-progress {
        font-size: 18px;
        color: #666;
        margin-bottom: 15px;
      }

      .achievement-progress-bar {
        width: 100%;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
        position: relative;
      }

      .achievement-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        transition: width 0.5s ease;
      }

      .achievement-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 30px;
      }

      .stat-card {
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        text-align: center;
      }

      .stat-value {
        font-size: 32px;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 5px;
      }

      .stat-label {
        font-size: 14px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .achievement-categories {
        margin-bottom: 40px;
      }

      .achievement-category {
        margin-bottom: 30px;
      }

      .category-header {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #333;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .category-icon {
        font-size: 28px;
      }

      .achievement-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
      }

      .achievement-badge {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .achievement-badge:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }

      .achievement-badge.locked {
        opacity: 0.6;
        background: #f5f5f5;
      }

      .achievement-badge.locked:hover {
        transform: none;
      }

      .badge-icon {
        font-size: 48px;
        text-align: center;
        margin-bottom: 10px;
        filter: grayscale(0);
      }

      .achievement-badge.locked .badge-icon {
        filter: grayscale(1);
        opacity: 0.5;
      }

      .badge-name {
        font-size: 18px;
        font-weight: bold;
        color: #333;
        margin-bottom: 8px;
        text-align: center;
      }

      .badge-description {
        font-size: 14px;
        color: #666;
        text-align: center;
        line-height: 1.4;
      }

      .badge-unlocked-date {
        font-size: 12px;
        color: #999;
        text-align: center;
        margin-top: 8px;
        font-style: italic;
      }

      .badge-locked-overlay {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
      }

      .achievement-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        max-width: 350px;
        z-index: 10000;
        animation: slide-in 0.5s ease, pulse 0.5s ease 0.5s;
      }

      @keyframes slide-in {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      .notification-header {
        font-size: 16px;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .notification-body {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .notification-icon {
        font-size: 48px;
      }

      .notification-content {
        flex: 1;
      }

      .notification-name {
        font-size: 20px;
        font-weight: bold;
        color: #333;
        margin-bottom: 5px;
      }

      .notification-description {
        font-size: 14px;
        color: #666;
        line-height: 1.4;
      }

      @media (max-width: 768px) {
        .achievement-grid {
          grid-template-columns: 1fr;
        }

        .achievement-stats {
          grid-template-columns: 1fr 1fr;
        }

        .achievement-notification {
          left: 20px;
          right: 20px;
          max-width: none;
        }
      }
    `;

    const styleElement = document.createElement("style");
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  /**
   * Render the achievement UI
   */
  render(): void {
    const progressPercent = this.engine.getProgressPercentage();
    const stats = this.engine.getStats();
    const unlockedCount = this.engine.getUnlockedAchievements().length;
    const totalCount = this.engine.getAchievements().length;

    const html = `
      <div class="achievement-container">
        <div class="achievement-header">
          <div class="achievement-title">🏆 Achievements</div>
          <div class="achievement-progress">
            ${unlockedCount} of ${totalCount} unlocked (${progressPercent}%)
          </div>
          <div class="achievement-progress-bar">
            <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
          </div>
        </div>

        <div class="achievement-stats">
          <div class="stat-card">
            <div class="stat-value">${stats.genomesExecuted}</div>
            <div class="stat-label">Genomes Run</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.mutationsApplied}</div>
            <div class="stat-label">Mutations Applied</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${stats.challengesCorrect}</div>
            <div class="stat-label">Challenges Correct</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${
              stats.challengesCompleted > 0
                ? Math.round(
                    (stats.challengesCorrect / stats.challengesCompleted) * 100,
                  )
                : 0
            }%</div>
            <div class="stat-label">Accuracy</div>
          </div>
        </div>

        <div class="achievement-categories">
          ${this.renderCategory("basics", "🌱 Basics")}
          ${this.renderCategory("mastery", "🎯 Mastery")}
          ${this.renderCategory("exploration", "🔍 Exploration")}
          ${this.renderCategory("perfection", "💎 Perfection")}
        </div>
      </div>
    `;

    // Build DOM safely without innerHTML
    const tempDiv = document.createElement("div");
    tempDiv.insertAdjacentHTML("afterbegin", html);
    this.container.replaceChildren(...tempDiv.children);
  }

  /**
   * Render a category of achievements
   */
  private renderCategory(category: AchievementCategory, title: string): string {
    const achievements = this.engine.getAchievementsByCategory(category);
    const badges = achievements
      .map((achievement) => this.renderBadge(achievement))
      .join("");

    return `
      <div class="achievement-category">
        <div class="category-header">
          <span class="category-icon">${title.split(" ")[0]}</span>
          <span>${title.split(" ")[1]}</span>
        </div>
        <div class="achievement-grid">
          ${badges}
        </div>
      </div>
    `;
  }

  /**
   * Render a single achievement badge
   */
  private renderBadge(achievement: Achievement): string {
    const isUnlocked = this.engine.isUnlocked(achievement.id);
    const unlockedData = isUnlocked
      ? this.engine
          .getUnlockedAchievements()
          .find((u) => u.achievement.id === achievement.id)
      : null;

    const lockedClass = isUnlocked ? "" : "locked";
    const lockedOverlay = isUnlocked
      ? ""
      : '<div class="badge-locked-overlay">🔒 LOCKED</div>';
    const unlockedDate = unlockedData
      ? `<div class="badge-unlocked-date">Unlocked: ${this.formatDate(
          unlockedData.unlockedAt,
        )}</div>`
      : "";

    return `
      <div class="achievement-badge ${lockedClass}" data-achievement-id="${achievement.id}">
        ${lockedOverlay}
        <div class="badge-icon">${achievement.icon}</div>
        <div class="badge-name">${achievement.name}</div>
        <div class="badge-description">${achievement.description}</div>
        ${unlockedDate}
      </div>
    `;
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  /**
   * Show achievement unlock notification
   */
  showUnlockNotification(achievement: Achievement): void {
    this.notificationQueue.push(achievement);
    if (!this.isShowingNotification) {
      this.showNextNotification();
    }
  }

  /**
   * Show next notification from queue
   */
  private showNextNotification(): void {
    if (this.notificationQueue.length === 0) {
      this.isShowingNotification = false;
      return;
    }

    this.isShowingNotification = true;
    const achievement = this.notificationQueue.shift();
    if (!achievement) return;

    const notification = document.createElement("div");
    notification.className = "achievement-notification";

    // Build notification DOM safely
    const notifHeader = document.createElement("div");
    notifHeader.className = "notification-header";
    notifHeader.textContent = "🎉 Achievement Unlocked!";

    const notifBody = document.createElement("div");
    notifBody.className = "notification-body";

    const notifIcon = document.createElement("div");
    notifIcon.className = "notification-icon";
    notifIcon.textContent = achievement.icon;

    const notifContent = document.createElement("div");
    notifContent.className = "notification-content";

    const notifName = document.createElement("div");
    notifName.className = "notification-name";
    notifName.textContent = achievement.name;

    const notifDesc = document.createElement("div");
    notifDesc.className = "notification-description";
    notifDesc.textContent = achievement.description;

    notifContent.appendChild(notifName);
    notifContent.appendChild(notifDesc);
    notifBody.appendChild(notifIcon);
    notifBody.appendChild(notifContent);
    notification.appendChild(notifHeader);
    notification.appendChild(notifBody);

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = "slide-in 0.5s ease reverse";
      setTimeout(() => {
        notification.remove();
        this.showNextNotification();
      }, 500);
    }, 5000);

    // Re-render to update locked/unlocked state
    this.render();
  }

  /**
   * Update display (call after stats change)
   */
  update(): void {
    this.render();
  }

  /**
   * Handle tracking event and show notifications for new unlocks
   */
  handleUnlocks(newlyUnlocked: Achievement[]): void {
    newlyUnlocked.forEach((achievement) => {
      this.showUnlockNotification(achievement);
    });
  }
}
