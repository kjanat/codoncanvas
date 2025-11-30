/**
 * Educational features module
 * Achievements, assessments, tutorials, and teacher tools
 */

export type {
  Achievement,
  AchievementCategory,
  PlayerStats,
  UnlockedAchievement,
} from "./achievements/achievement-engine";
// Achievements
export { AchievementEngine } from "./achievements/achievement-engine";
export type {
  AssessmentDifficulty,
  AssessmentProgress,
  AssessmentResult,
  Challenge,
} from "./assessments/assessment-engine";
// Assessments
export { AssessmentEngine } from "./assessments/assessment-engine";
export { AssessmentUI } from "./assessments/assessment-ui";
export type {
  AtRiskStudent,
  ClassroomStats,
  TeacherStudentProgress,
} from "./teacher-dashboard";
// Teacher Dashboard
export {
  generateStudentExport,
  TeacherDashboard,
} from "./teacher-dashboard";
export type { TutorialConfig, TutorialStep } from "./tutorials/tutorial";
// Tutorials
export {
  evolutionTutorial,
  helloCircleTutorial,
  mutationTutorial,
  TutorialManager,
  timelineTutorial,
} from "./tutorials/tutorial";
export { initializeTutorial, TutorialUI } from "./tutorials/tutorial-ui";
