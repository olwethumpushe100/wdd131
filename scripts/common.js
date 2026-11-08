const menuButton = document.querySelector("#menu-button");
const siteNav = document.querySelector("#site-nav");
const yearSpan = document.querySelector("#year");
const modifiedSpan = document.querySelector("#lastModified");

function toggleMenu() {
  const isOpen = siteNav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", `${isOpen}`);
  menuButton.textContent = isOpen ? `Close` : `Menu`;
}

function showFooterDates() {
  yearSpan.textContent = `${new Date().getFullYear()}`;
  modifiedSpan.textContent = `${document.lastModified}`;
}

menuButton.addEventListener("click", toggleMenu);
showFooterDates();
