/**
 * Layout - Main application layout
 *
 * Composes Header, Footer, and content area.
 * Provides global notification containers for toasts and achievements.
 */

import type { ReactElement, ReactNode } from "react";

import { AchievementToastContainer } from "@/components/AchievementToast";
import { ToastContainer } from "@/components/Toast";
import { getAuthorSocialUrl, siteConfig } from "@/config";
import { useAchievements } from "@/hooks";

import { Footer, Header } from "./layout";

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout wrapper for the application.
 * Renders header, main content area, footer, and notification containers.
 */
export function Layout({ children }: LayoutProps): ReactElement {
  const { notifications, dismissNotification } = useAchievements();

  return (
    <div className="flex h-screen flex-col bg-bg-light">
      {/* Skip link for keyboard users to bypass navigation */}
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-primary-hover"
        href="#main-content"
      >
        Skip to main content
      </a>
      <Header />
      <main className="flex-1 overflow-auto" id="main-content">
        {children}
      </main>
      <Footer
        authorName={siteConfig.author.name}
        githubUrl={getAuthorSocialUrl(siteConfig.author, "github")}
      />

      {/* Global notifications */}
      <ToastContainer />
      <AchievementToastContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
