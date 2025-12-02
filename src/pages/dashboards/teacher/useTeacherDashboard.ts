/**
 * useTeacherDashboard - Hook for Teacher Dashboard state management
 */

import { type ChangeEvent, useState } from "react";
import { useToast } from "@/contexts";
import {
  type AtRiskStudent,
  type ClassroomStats,
  generateStudentExport,
  TeacherDashboard,
  type TeacherStudentProgress,
} from "@/education/teacher-dashboard";
import {
  downloadFile,
  generateDemoSession,
  generateDemoTutorials,
  TUTORIAL_IDS,
} from "./constants";
import type { EngagementLevel } from "./types";

function loadDemoDataIntoEngine(dashboard: TeacherDashboard): void {
  for (let i = 1; i <= 12; i++) {
    const studentId = `DEMO${String(i).padStart(3, "0")}`;
    const studentName = `Demo Student ${i}`;
    const engagementLevel: EngagementLevel =
      i <= 3 ? "high" : i <= 8 ? "medium" : "low";
    const sessionCount =
      engagementLevel === "high" ? 5 : engagementLevel === "medium" ? 2 : 0;
    const isHighEngagement = engagementLevel === "high";

    const sessions = Array.from({ length: sessionCount }, (_, s) =>
      generateDemoSession(studentId, s, isHighEngagement),
    );
    const tutorials = generateDemoTutorials(engagementLevel, TUTORIAL_IDS);

    const exportData = generateStudentExport(
      studentId,
      studentName,
      tutorials,
      sessions,
    );
    dashboard.importStudentData(exportData);
  }
}

export interface UseTeacherDashboardResult {
  students: TeacherStudentProgress[];
  stats: ClassroomStats | null;
  atRiskStudents: AtRiskStudent[];
  importError: string | null;
  handleFileImport: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleLoadDemoData: () => void;
  handleExportCSV: () => void;
  handleExportJSON: () => void;
  handleClearData: () => void;
}

export function useTeacherDashboard(): UseTeacherDashboardResult {
  const { success } = useToast();
  const [dashboard] = useState(() => new TeacherDashboard());
  const [students, setStudents] = useState<TeacherStudentProgress[]>([]);
  const [importError, setImportError] = useState<string | null>(null);

  // Derived state
  const stats = students.length > 0 ? dashboard.getClassroomStats() : null;
  const atRiskStudents =
    students.length > 0 ? dashboard.getAtRiskStudents() : [];

  function refreshData(): void {
    setStudents([...dashboard.getStudents()]);
  }

  async function handleFileImport(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    setImportError(null);

    try {
      const imported = await dashboard.importMultipleFiles(Array.from(files));
      refreshData();
      success(`Successfully imported ${imported} student file(s)`);
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "Failed to import files",
      );
    }

    event.target.value = "";
  }

  function handleLoadDemoData(): void {
    loadDemoDataIntoEngine(dashboard);
    refreshData();
    success("Loaded 12 demo students with varying engagement levels");
  }

  function handleExportCSV(): void {
    const csv = dashboard.exportGradingSummary();
    downloadFile(csv, "codoncanvas-grading-summary.csv", "text/csv");
    success("Grading summary exported as CSV");
  }

  function handleExportJSON(): void {
    const json = dashboard.exportClassroomData();
    downloadFile(json, "codoncanvas-classroom-data.json", "application/json");
    success("Classroom data exported as JSON");
  }

  function handleClearData(): void {
    if (confirm("Are you sure you want to clear all imported student data?")) {
      dashboard.clearAll();
      refreshData();
      success("All student data cleared");
    }
  }

  return {
    students,
    stats,
    atRiskStudents,
    importError,
    handleFileImport,
    handleLoadDemoData,
    handleExportCSV,
    handleExportJSON,
    handleClearData,
  };
}
