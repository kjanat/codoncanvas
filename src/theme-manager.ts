/**
 * Theme Manager
 * Handles theme selection, persistence, and automatic theme detection
 */

export type Theme = 'light' | 'dark' | 'high-contrast';

export class ThemeManager {
  private static readonly STORAGE_KEY = 'codoncanvas-theme';
  private static readonly THEME_ATTRIBUTE = 'data-theme';
  private currentTheme: Theme;
  private mediaQuery: MediaQueryList;

  constructor() {
    // Check for saved theme or use system preference
    const savedTheme = this.getSavedTheme();
    const systemTheme = this.getSystemTheme();
    this.currentTheme = savedTheme || systemTheme;

    // Listen for system theme changes
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));

    // Apply initial theme
    this.applyTheme(this.currentTheme);
  }

  /**
   * Get the currently active theme
   */
  getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Set the theme manually
   */
  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(theme);
  }

  /**
   * Cycle to the next theme in order: dark → light → high-contrast → dark
   */
  cycleTheme(): Theme {
    const themes: Theme[] = ['dark', 'light', 'high-contrast'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    this.setTheme(nextTheme);
    return nextTheme;
  }

  /**
   * Get theme display name for UI
   */
  getThemeDisplayName(theme: Theme = this.currentTheme): string {
    const names: Record<Theme, string> = {
      'dark': 'Dark',
      'light': 'Light',
      'high-contrast': 'High Contrast'
    };
    return names[theme];
  }

  /**
   * Get theme icon for UI
   */
  getThemeIcon(theme: Theme = this.currentTheme): string {
    const icons: Record<Theme, string> = {
      'dark': '🌙',
      'light': '☀️',
      'high-contrast': '🔆'
    };
    return icons[theme];
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute(ThemeManager.THEME_ATTRIBUTE, theme);
  }

  /**
   * Save theme preference to localStorage
   */
  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(ThemeManager.STORAGE_KEY, theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  /**
   * Get saved theme from localStorage
   */
  private getSavedTheme(): Theme | null {
    try {
      const saved = localStorage.getItem(ThemeManager.STORAGE_KEY);
      if (saved && this.isValidTheme(saved)) {
        return saved as Theme;
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    }
    return null;
  }

  /**
   * Get system theme preference
   */
  private getSystemTheme(): Theme {
    // Check for high contrast preference (Windows)
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      return 'high-contrast';
    }

    // Check for dark mode preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // Default to dark (current default in CodonCanvas)
    return 'dark';
  }

  /**
   * Handle system theme changes (only if user hasn't set manual preference)
   */
  private handleSystemThemeChange(event: MediaQueryListEvent): void {
    // Only auto-switch if user hasn't manually selected a theme
    const savedTheme = this.getSavedTheme();
    if (!savedTheme) {
      const newTheme = event.matches ? 'dark' : 'light';
      this.currentTheme = newTheme;
      this.applyTheme(newTheme);
    }
  }

  /**
   * Validate theme string
   */
  private isValidTheme(theme: string): boolean {
    return ['light', 'dark', 'high-contrast'].includes(theme);
  }

  /**
   * Reset to system theme preference
   */
  resetToSystemTheme(): void {
    try {
      localStorage.removeItem(ThemeManager.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to reset theme preference:', error);
    }
    const systemTheme = this.getSystemTheme();
    this.currentTheme = systemTheme;
    this.applyTheme(systemTheme);
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange.bind(this));
  }
}
