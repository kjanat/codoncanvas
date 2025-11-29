// Page imports (lazy load for code splitting)
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";

const Home = lazy(() => import("@/pages/Home"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const Tutorial = lazy(() => import("@/pages/Tutorial"));
const Demos = lazy(() => import("@/pages/Demos"));

// Demo pages
const MutationDemo = lazy(() => import("@/pages/demos/MutationDemo"));
const TimelineDemo = lazy(() => import("@/pages/demos/TimelineDemo"));
const EvolutionDemo = lazy(() => import("@/pages/demos/EvolutionDemo"));
const PopulationDemo = lazy(() => import("@/pages/demos/PopulationDemo"));
const GeneticDemo = lazy(() => import("@/pages/demos/GeneticDemo"));
const AchievementsDemo = lazy(() => import("@/pages/demos/AchievementsDemo"));
const AssessmentDemo = lazy(() => import("@/pages/demos/AssessmentDemo"));

// Dashboard pages
const ResearchDashboard = lazy(
  () => import("@/pages/dashboards/ResearchDashboard"),
);
const TeacherDashboard = lazy(
  () => import("@/pages/dashboards/TeacherDashboard"),
);
const LearningPaths = lazy(() => import("@/pages/dashboards/LearningPaths"));

function LoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-text-muted">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Main pages */}
          <Route element={<Home />} path="/" />
          <Route element={<Gallery />} path="/gallery" />
          <Route element={<Tutorial />} path="/tutorial" />
          <Route element={<Demos />} path="/demos" />

          {/* Demo pages */}
          <Route element={<MutationDemo />} path="/demos/mutation" />
          <Route element={<TimelineDemo />} path="/demos/timeline" />
          <Route element={<EvolutionDemo />} path="/demos/evolution" />
          <Route element={<PopulationDemo />} path="/demos/population" />
          <Route element={<GeneticDemo />} path="/demos/genetic" />
          <Route element={<AchievementsDemo />} path="/demos/achievements" />
          <Route element={<AssessmentDemo />} path="/demos/assessment" />

          {/* Dashboard pages */}
          <Route element={<ResearchDashboard />} path="/dashboards/research" />
          <Route element={<TeacherDashboard />} path="/dashboards/teacher" />
          <Route element={<LearningPaths />} path="/dashboards/learning" />
        </Routes>
      </Suspense>
    </Layout>
  );
}
