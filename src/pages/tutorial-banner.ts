// Tutorial Banner Dismiss Logic
const tutorialBanner = document.getElementById("tutorial-banner");
const dismissBtn = document.getElementById("dismiss-tutorial-banner");
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
