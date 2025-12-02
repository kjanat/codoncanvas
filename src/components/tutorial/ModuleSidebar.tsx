/**
 * ModuleSidebar - Tutorial lesson navigation
 *
 * Desktop: Fixed sidebar with lesson list
 * Mobile: Slide-out drawer triggered by FAB
 */

import { useEffect, useState } from "react";

import type { TutorialLesson } from "@/data/tutorial-lessons";
import { getLessonsByModule, moduleNames } from "@/data/tutorial-lessons";
import { ChevronRightIcon, MenuIcon, XIcon } from "@/ui/icons";

interface ModuleSidebarProps {
  currentLessonId: string;
  completedLessons: string[];
  onSelectLesson: (id: string) => void;
}

interface LessonButtonProps {
  lesson: TutorialLesson;
  isCurrent: boolean;
  isCompleted: boolean;
  onSelect: () => void;
}

function LessonButton({
  lesson,
  isCurrent,
  isCompleted,
  onSelect,
}: LessonButtonProps) {
  const baseClass =
    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors";
  const stateClass = isCurrent
    ? "bg-primary text-white shadow-sm"
    : isCompleted
      ? "bg-success/10 text-success hover:bg-success/20"
      : "text-text hover:bg-bg-light";

  const badgeClass = isCurrent
    ? "bg-white/20"
    : isCompleted
      ? "bg-success/20"
      : "bg-bg-light";

  return (
    <button
      className={`${baseClass} ${stateClass}`}
      onClick={onSelect}
      type="button"
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${badgeClass}`}
      >
        {isCompleted ? "\u2713" : lesson.lessonNumber}
      </span>
      <span className="truncate">{lesson.title}</span>
      {isCurrent && <ChevronRightIcon className="ml-auto h-4 w-4 shrink-0" />}
    </button>
  );
}

export function ModuleSidebar({
  currentLessonId,
  completedLessons,
  onSelectLesson,
}: ModuleSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const modules = [1, 2, 3];

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSelectLesson = (id: string) => {
    onSelectLesson(id);
    setIsOpen(false);
  };

  const sidebarContent = (
    <>
      <h2 className="mb-6 text-xl font-bold text-text">Lessons</h2>
      {modules.map((moduleNum) => (
        <div className="mb-6" key={moduleNum}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Module {moduleNum}: {moduleNames[moduleNum]}
          </h3>
          <div className="space-y-1">
            {getLessonsByModule(moduleNum).map((lesson) => (
              <LessonButton
                isCompleted={completedLessons.includes(lesson.id)}
                isCurrent={lesson.id === currentLessonId}
                key={lesson.id}
                lesson={lesson}
                onSelect={() => handleSelectLesson(lesson.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <>
      {/* Mobile: FAB to open */}
      <button
        aria-expanded={isOpen}
        aria-label="Open lesson menu"
        className="fixed bottom-4 left-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg md:hidden"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      {/* Mobile: Backdrop */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile: Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transform bg-surface shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-lg font-semibold text-primary">Lessons</span>
          <button
            aria-label="Close menu"
            className="flex h-11 w-11 items-center justify-center rounded-md text-text hover:bg-bg-light"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <XIcon />
          </button>
        </div>
        <nav
          className="overflow-y-auto p-4"
          style={{ height: "calc(100% - 57px)" }}
        >
          {sidebarContent}
        </nav>
      </div>

      {/* Desktop: Fixed sidebar */}
      <aside className="hidden w-72 shrink-0 overflow-y-auto border-r border-border bg-surface p-6 md:block">
        {sidebarContent}
      </aside>
    </>
  );
}
