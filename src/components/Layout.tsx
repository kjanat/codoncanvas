/**
 * Layout - Main application layout
 *
 * Composes Header, Footer, and content area.
 * Provides global notification containers for toasts and achievements.
 */

import type { ReactNode } from "react";

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
export function Layout({ children }: LayoutProps) {
  const { ToastContainer: AchievementToastContainer } = useAchievements();

  return (
    <div className="flex min-h-screen flex-col bg-bg-light">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer
        authorName={siteConfig.author.name}
        githubUrl={getAuthorSocialUrl(siteConfig.author, "github")}
      />

      {/* Global notifications */}
      <ToastContainer />
      <AchievementToastContainer />
    </div>
  );
}
