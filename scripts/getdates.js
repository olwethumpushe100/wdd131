// Display the current year in the footer copyright line
const currentYear = new Date().getFullYear();
document.getElementById("currentyear").textContent = currentYear;

// Display the date the document was last modified
document.getElementById("lastModified").textContent =
  `Last Modified: ${document.lastModified}`;
