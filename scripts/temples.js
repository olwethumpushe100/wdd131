// Responsive hamburger menu toggle
const hamburger = document.getElementById("hamburger");
const primaryNav = document.getElementById("primary-nav");
 
hamburger.addEventListener("click", () => {
  const isOpen = primaryNav.classList.toggle("nav-open");
  hamburger.setAttribute("aria-expanded", isOpen);
  hamburger.textContent = isOpen ? "✕" : "☰";
});
 
// Display the current year in the footer copyright line
const currentYear = new Date().getFullYear();
document.getElementById("currentyear").textContent = currentYear;
 
// Display the date the document was last modified
document.getElementById("lastModified").textContent =
  `Last Modified: ${document.lastModified}`;