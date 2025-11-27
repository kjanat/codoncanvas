// Tutorial Banner Dismiss Logic
const tutorialBanner = document.getElementById("tutorialBanner");
const dismissBtn = document.getElementById("dismissTutorialBanner");
const BANNER_DISMISSED_KEY = "codoncanvas-tutorial-banner-dismissed";

// Hide banner if previously dismissed
if (localStorage.getItem(BANNER_DISMISSED_KEY) === "true") {
  tutorialBanner?.classList.add("hidden");
}

// Handle dismiss button click
dismissBtn?.addEventListener("click", () => {
  localStorage.setItem(BANNER_DISMISSED_KEY, "true");
  tutorialBanner?.classList.add("hidden");
});
