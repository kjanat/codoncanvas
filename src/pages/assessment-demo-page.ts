import { AssessmentEngine } from "@/education/assessments/assessment-engine";
import { AssessmentUI } from "@/education/assessments/assessment-ui";
import { getElementUnsafe as getElement } from "@/utils/dom";

// Initialize assessment system
const engine = new AssessmentEngine();
const container = getElement("assessment-container");
const assessmentUI = new AssessmentUI(engine, container);

// Show assessment UI
assessmentUI.show();

// Setup export button
document.getElementById("export-btn")?.addEventListener("click", () => {
  const results = assessmentUI.exportResults();

  // Download as JSON file
  const blob = new Blob([results], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `codoncanvas-assessment-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert("✅ Results exported! Check your downloads folder.");
});
