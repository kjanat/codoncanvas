import { getElement } from "@/dom-utils";
import {
  formatDuration as formatDurationAnalyzer,
  MetricsAnalyzer,
  parseCSVContent,
} from "@/metrics-analyzer-core";
import type { ResearchSession } from "@/research-metrics";
import { ResearchMetrics } from "@/research-metrics";

interface AggregateStats {
  totalSessions: number;
  avgDuration: number;
  totalDuration: number;
  totalGenomesCreated: number;
  totalMutations: number;
  avgTimeToFirstArtifact: number;
  totalErrors: number;
  mutationTypeDistribution: Record<string, number>;
  renderModePreferences: Record<string, number>;
  featureUsage: Record<string, number>;
}

interface ToolData {
  users: number;
  avgUsage: number;
}

interface RenderModeData {
  percentage: number;
  sessions: number;
}

interface MutationStats {
  mean: number;
  sd: number;
  n: number;
}

interface AnalysisReport {
  engagement: {
    totalSessions: number;
    avgSessionDuration: { mean: number; sd: number; min: number; max: number };
    totalGenomesCreated: number;
    avgGenomesPerSession: { mean: number; sd: number };
    genomesExecutedRate: number;
  };
  velocity: {
    timeToFirstArtifact: {
      mean: number;
      median: number;
      sd: number;
      min: number;
      max: number;
    };
    fastLearners: number;
    moderateLearners: number;
    slowLearners: number;
    noArtifact: number;
  };
  tools: {
    diffViewer: ToolData;
    timeline: ToolData;
    evolution: ToolData;
    assessment: ToolData;
    export: ToolData;
  };
  renderMode: {
    visualOnly: RenderModeData;
    audioOnly: RenderModeData;
    multiSensory: RenderModeData;
  };
  mutations: {
    totalMutations: number;
    silent: MutationStats;
    missense: MutationStats;
    nonsense: MutationStats;
    frameshift: MutationStats;
    point: MutationStats;
    insertion: MutationStats;
    deletion: MutationStats;
  };
}

const metrics = new ResearchMetrics({ enabled: false }); // Read-only mode

// DOM Elements
const statusMessage = getElement("status-message");
const noDataMessage = getElement("no-data-message");
const dataDisplay = getElement("data-display");
const totalSessions = getElement("total-sessions");
const avgDuration = getElement("avg-duration");
const totalDuration = getElement("total-duration");
const totalGenomes = getElement("total-genomes");
const totalMutations = getElement("total-mutations");
const avgTimeToFirst = getElement("avg-time-to-first");
const totalErrors = getElement("total-errors");
const sessionsBody = getElement("sessions-body");
const analysisSection = getElement("analysis-section");
const analysisResults = getElement("analysis-results");

function showStatus(message: string, type = "info"): void {
  statusMessage.textContent = message;
  statusMessage.className = `status-message status-${type}`;
  statusMessage.style.display = "block";

  setTimeout(() => {
    statusMessage.style.display = "none";
  }, 3000);
}

function formatDuration(ms: number): string {
  if (!ms || ms === 0) return "0m";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function formatTime(ms: number): string {
  if (!ms || ms === 0) return "--";
  const seconds = Math.floor(ms / 1000);
  return `${seconds}s`;
}

function createBarChart(
  data: Record<string, number>,
  containerId: string,
): void {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  const maxValue = Math.max(...Object.values(data));

  Object.entries(data).forEach(([label, value]) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

    const item = document.createElement("div");
    item.className = "bar-item";

    const labelEl = document.createElement("div");
    labelEl.className = "bar-label";
    labelEl.textContent = label.charAt(0).toUpperCase() + label.slice(1);

    const barContainer = document.createElement("div");
    barContainer.className = "bar-container";

    const barFill = document.createElement("div");
    barFill.className = "bar-fill";
    barFill.style.width = `${percentage}%`;
    barFill.textContent = String(value);

    barContainer.appendChild(barFill);
    item.appendChild(labelEl);
    item.appendChild(barContainer);
    container.appendChild(item);
  });
}

function refreshData(): void {
  const stats = metrics.getAggregateStats() as AggregateStats;
  const sessions = metrics.getAllSessions() as ResearchSession[];

  if (sessions.length === 0) {
    noDataMessage.style.display = "block";
    dataDisplay.style.display = "none";
    return;
  }

  noDataMessage.style.display = "none";
  dataDisplay.style.display = "block";

  // Update metrics
  totalSessions.textContent = String(stats.totalSessions);
  avgDuration.textContent = formatDuration(stats.avgDuration);
  totalDuration.textContent = `Total: ${formatDuration(stats.totalDuration)}`;
  totalGenomes.textContent = String(stats.totalGenomesCreated);
  totalMutations.textContent = String(stats.totalMutations);
  avgTimeToFirst.textContent = formatTime(stats.avgTimeToFirstArtifact);
  totalErrors.textContent = String(stats.totalErrors);

  // Update charts
  createBarChart(stats.mutationTypeDistribution, "mutation-chart");
  createBarChart(stats.renderModePreferences, "render-mode-chart");
  createBarChart(stats.featureUsage, "feature-chart");

  // Update sessions table
  sessionsBody.innerHTML = "";

  // Show last 20 sessions
  const recentSessions = sessions.slice(-20).reverse();

  recentSessions.forEach((session) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${session.sessionId.substring(0, 20)}...</td>
      <td>${new Date(session.startTime).toLocaleString()}</td>
      <td>${formatDuration(session.duration || 0)}</td>
      <td>${session.genomesCreated}</td>
      <td>${session.mutationsApplied}</td>
      <td>${formatTime(session.timeToFirstArtifact || 0)}</td>
      <td>${session.errors.length}</td>
    `;
    sessionsBody.appendChild(row);
  });

  showStatus("Data refreshed successfully", "success");
}

function exportJSON(): void {
  const data = metrics.exportData();
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `codoncanvas-research-data-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showStatus("JSON data exported successfully", "success");
}

function exportCSV(): void {
  const data = metrics.exportCSV();
  const blob = new Blob([data], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `codoncanvas-research-data-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showStatus("CSV data exported successfully", "success");
}

function clearData(): void {
  if (
    confirm(
      "Are you sure you want to clear all research data? This cannot be undone.",
    )
  ) {
    metrics.clearAllData();
    refreshData();
    showStatus("All research data cleared", "warning");
  }
}

function formatToolRow(
  name: string,
  toolData: ToolData,
  totalSessionCount: number,
): string {
  const adoptionRate =
    totalSessionCount > 0 ? (toolData.users / totalSessionCount) * 100 : 0;
  return `${name.padEnd(20)} ${adoptionRate.toFixed(1).padStart(6)}% adoption  (avg ${toolData.avgUsage.toFixed(1)} uses/session)\n`;
}

function formatMutationRow(
  name: string,
  stats: MutationStats,
  totalMutationCount: number,
): string {
  const total = stats.mean * stats.n;
  const percentage =
    totalMutationCount > 0 ? (total / totalMutationCount) * 100 : 0;
  return `  ${name.padEnd(12)} M=${stats.mean.toFixed(1).padStart(5)}, SD=${stats.sd.toFixed(1).padStart(4)}  (${percentage.toFixed(1).padStart(5)}% of total)\n`;
}

function analyzeData(): void {
  const sessions = metrics.getAllSessions() as ResearchSession[];

  if (sessions.length === 0) {
    showStatus(
      "No data to analyze. Collect some research data first.",
      "warning",
    );
    return;
  }

  try {
    // Get CSV data and parse it
    const csvData = metrics.exportCSV();
    const parsedSessions = parseCSVContent(csvData);

    // Create analyzer and generate report
    const analyzer = new MetricsAnalyzer(parsedSessions);
    const report = analyzer.generateReport() as AnalysisReport;

    // Format report for display
    let output =
      "═══════════════════════════════════════════════════════════════════\n";
    output += "           CODONCANVAS STATISTICAL ANALYSIS REPORT\n";
    output +=
      "═══════════════════════════════════════════════════════════════════\n\n";

    // 1. Engagement Metrics
    output +=
      "───────────────────────────────────────────────────────────────────\n";
    output += "1. ENGAGEMENT METRICS\n";
    output +=
      "───────────────────────────────────────────────────────────────────\n\n";
    output += `Total Sessions:              ${report.engagement.totalSessions}\n`;
    output += `Average Session Duration:    ${formatDurationAnalyzer(report.engagement.avgSessionDuration.mean)}\n`;
    output += `  (SD = ${formatDurationAnalyzer(report.engagement.avgSessionDuration.sd)}, Range: ${formatDurationAnalyzer(report.engagement.avgSessionDuration.min)} - ${formatDurationAnalyzer(report.engagement.avgSessionDuration.max)})\n\n`;
    output += `Total Genomes Created:       ${report.engagement.totalGenomesCreated}\n`;
    output += `Avg Genomes per Session:     ${report.engagement.avgGenomesPerSession.mean.toFixed(1)}\n`;
    output += `  (SD = ${report.engagement.avgGenomesPerSession.sd.toFixed(1)})\n`;
    output += `Genome Execution Rate:       ${report.engagement.genomesExecutedRate.toFixed(1)}%\n\n`;

    // 2. Learning Velocity
    output +=
      "───────────────────────────────────────────────────────────────────\n";
    output += "2. LEARNING VELOCITY\n";
    output +=
      "───────────────────────────────────────────────────────────────────\n\n";
    output += `Time to First Artifact:\n`;
    output += `  Mean:     ${formatDurationAnalyzer(report.velocity.timeToFirstArtifact.mean)}\n`;
    output += `  Median:   ${formatDurationAnalyzer(report.velocity.timeToFirstArtifact.median)}\n`;
    output += `  SD:       ${formatDurationAnalyzer(report.velocity.timeToFirstArtifact.sd)}\n`;
    output += `  Range:    ${formatDurationAnalyzer(report.velocity.timeToFirstArtifact.min)} - ${formatDurationAnalyzer(report.velocity.timeToFirstArtifact.max)}\n\n`;
    output += `Learner Distribution:\n`;
    output += `  Fast (<5 min):       ${report.velocity.fastLearners} (${((report.velocity.fastLearners / report.engagement.totalSessions) * 100).toFixed(1)}%)\n`;
    output += `  Moderate (5-15 min): ${report.velocity.moderateLearners} (${((report.velocity.moderateLearners / report.engagement.totalSessions) * 100).toFixed(1)}%)\n`;
    output += `  Slow (>15 min):      ${report.velocity.slowLearners} (${((report.velocity.slowLearners / report.engagement.totalSessions) * 100).toFixed(1)}%)\n`;
    output += `  No Artifact:         ${report.velocity.noArtifact} (${((report.velocity.noArtifact / report.engagement.totalSessions) * 100).toFixed(1)}%)\n\n`;

    // 3. Tool Adoption
    output +=
      "───────────────────────────────────────────────────────────────────\n";
    output += "3. TOOL ADOPTION\n";
    output +=
      "───────────────────────────────────────────────────────────────────\n\n";
    output += formatToolRow(
      "Diff Viewer",
      report.tools.diffViewer,
      report.engagement.totalSessions,
    );
    output += formatToolRow(
      "Timeline Scrubber",
      report.tools.timeline,
      report.engagement.totalSessions,
    );
    output += formatToolRow(
      "Evolution Lab",
      report.tools.evolution,
      report.engagement.totalSessions,
    );
    output += formatToolRow(
      "Assessment System",
      report.tools.assessment,
      report.engagement.totalSessions,
    );
    output += formatToolRow(
      "Export Features",
      report.tools.export,
      report.engagement.totalSessions,
    );
    output += "\n";

    // 4. Render Mode Preferences
    output +=
      "───────────────────────────────────────────────────────────────────\n";
    output += "4. RENDER MODE PREFERENCES\n";
    output +=
      "───────────────────────────────────────────────────────────────────\n\n";
    output += `Visual Only:         ${report.renderMode.visualOnly.percentage.toFixed(1)}% (${report.renderMode.visualOnly.sessions} executions)\n`;
    output += `Audio Only:          ${report.renderMode.audioOnly.percentage.toFixed(1)}% (${report.renderMode.audioOnly.sessions} executions)\n`;
    output += `Multi-Sensory:       ${report.renderMode.multiSensory.percentage.toFixed(1)}% (${report.renderMode.multiSensory.sessions} executions)\n\n`;

    // 5. Mutation Patterns
    output +=
      "───────────────────────────────────────────────────────────────────\n";
    output += "5. MUTATION PATTERNS\n";
    output +=
      "───────────────────────────────────────────────────────────────────\n\n";
    output += `Total Mutations Applied: ${report.mutations.totalMutations}\n\n`;
    output += `Mutation Type Distribution:\n`;
    output += formatMutationRow(
      "Silent",
      report.mutations.silent,
      report.mutations.totalMutations,
    );
    output += formatMutationRow(
      "Missense",
      report.mutations.missense,
      report.mutations.totalMutations,
    );
    output += formatMutationRow(
      "Nonsense",
      report.mutations.nonsense,
      report.mutations.totalMutations,
    );
    output += formatMutationRow(
      "Frameshift",
      report.mutations.frameshift,
      report.mutations.totalMutations,
    );
    output += formatMutationRow(
      "Point",
      report.mutations.point,
      report.mutations.totalMutations,
    );
    output += formatMutationRow(
      "Insertion",
      report.mutations.insertion,
      report.mutations.totalMutations,
    );
    output += formatMutationRow(
      "Deletion",
      report.mutations.deletion,
      report.mutations.totalMutations,
    );
    output += "\n";

    output +=
      "═══════════════════════════════════════════════════════════════════\n";
    output += "                         END OF REPORT\n";
    output +=
      "═══════════════════════════════════════════════════════════════════\n";

    // Display results
    analysisResults.textContent = output;
    analysisSection.style.display = "block";

    // Scroll to results
    analysisSection.scrollIntoView({ behavior: "smooth" });

    showStatus("Analysis complete! Results displayed below.", "success");
  } catch (error) {
    console.error("Analysis error:", error);
    showStatus(
      `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "warning",
    );
  }
}

// Bind event listeners for control buttons
document
  .getElementById("refresh-data-btn")
  ?.addEventListener("click", refreshData);
document
  .getElementById("export-json-btn")
  ?.addEventListener("click", exportJSON);
document.getElementById("export-csv-btn")?.addEventListener("click", exportCSV);
document
  .getElementById("analyze-data-btn")
  ?.addEventListener("click", analyzeData);
document.getElementById("clear-data-btn")?.addEventListener("click", clearData);

// Initial load
refreshData();
