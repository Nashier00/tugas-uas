// Simple script to handle mobile menu toggle (would be expanded in production)
document.addEventListener("DOMContentLoaded", function () {
  // Tab switching functionality for My Courses section
  const tabs = document.querySelectorAll("[data-tab]");
  const tabContents = document.querySelectorAll("[data-tab-content]");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = document.querySelector(tab.dataset.tab);

      // Hide all tab contents
      tabContents.forEach((content) => {
        content.classList.add("hidden");
      });

      // Remove active class from all tabs
      tabs.forEach((t) => {
        t.classList.remove("bg-purple-600", "text-white");
      });

      // Show target tab content and mark tab as active
      target.classList.remove("hidden");
      tab.classList.add("bg-purple-600", "text-white");
    });
  });

  // Simple progress animation
  const progressBars = document.querySelectorAll(".progress-value");
  progressBars.forEach((bar) => {
    const width = bar.style.width; // Get the defined width
    bar.style.width = "0"; // Reset to 0 for animation
    setTimeout(() => {
      bar.style.width = width; // Animate to target width
    }, 100);
  });
});
