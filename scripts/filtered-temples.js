// ---------- Responsive hamburger menu toggle ----------
const hamburger = document.getElementById("hamburger");
const primaryNav = document.getElementById("primary-nav");

function setMenu(isOpen) {
  primaryNav.classList.toggle("nav-open", isOpen);
  hamburger.setAttribute("aria-expanded", isOpen);
  hamburger.textContent = isOpen ? "✕" : "☰";
}

hamburger.addEventListener("click", () => {
  setMenu(!primaryNav.classList.contains("nav-open"));
});

// ---------- Temple data ----------
const temples = [
  {
    templeName: "Aba Nigeria",
    location: "Aba, Nigeria",
    dedicated: "2005, August, 7",
    area: 11500,
    imageUrl:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/aba-nigeria/400x250/aba-nigeria-temple-lds-273999-wallpaper.jpg"
  },
  {
    templeName: "Manti Utah",
    location: "Manti, Utah, United States",
    dedicated: "1888, May, 21",
    area: 74792,
    imageUrl:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/manti-utah/400x250/manti-temple-768192-wallpaper.jpg"
  },
  {
    templeName: "Payson Utah",
    location: "Payson, Utah, United States",
    dedicated: "2015, June, 7",
    area: 96630,
    imageUrl:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/payson-utah/400x225/payson-utah-temple-exterior-1416671-wallpaper.jpg"
  },
  {
    templeName: "Yigo Guam",
    location: "Yigo, Guam",
    dedicated: "2020, May, 2",
    area: 6861,
    imageUrl:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/yigo-guam/400x250/yigo_guam_temple_2.jpg"
  },
  {
    templeName: "Washington D.C.",
    location: "Kensington, Maryland, United States",
    dedicated: "1974, November, 19",
    area: 156558,
    imageUrl:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/washington-dc/400x250/washington_dc_temple-exterior-2.jpeg"
  },
  {
    templeName: "Lima Perú",
    location: "Lima, Perú",
    dedicated: "1986, January, 10",
    area: 9600,
    imageUrl:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/lima-peru/400x250/lima-peru-temple-evening-1075606-wallpaper.jpg"
  },
  {
    templeName: "Mexico City Mexico",
    location: "Mexico City, Mexico",
    dedicated: "1983, December, 2",
    area: 116642,
    imageUrl:
    "https://content.churchofjesuschrist.org/templesldsorg/bc/Temples/photo-galleries/mexico-city-mexico/400x250/mexico-city-temple-exterior-1518361-wallpaper.jpg"
  },
  // Three temples added by me (local images from my images folder)
  {
    templeName: "Salt Lake",
    location: "Salt Lake City, Utah, United States",
    dedicated: "1893, April, 6",
    area: 253015,
    imageUrl: "images/salt-lake-temple.jpg"
  },
  {
    templeName: "Johannesburg South Africa",
    location: "Johannesburg, South Africa",
    dedicated: "1985, August, 24",
    area: 19184,
    imageUrl: "images/johannesburg-temple.jpg"
  },
  {
    templeName: "Durban South Africa",
    location: "Umhlanga, South Africa",
    dedicated: "2020, February, 16",
    area: 19860,
    imageUrl: "images/durban-temple.jpg"
  }
];

// ---------- Temple cards ----------
const gallery = document.querySelector("#gallery");

function createTempleCard(filteredTemples) {
  // Clear the previous cards so filters replace instead of add
  gallery.innerHTML = "";

  filteredTemples.forEach(temple => {
    const card = document.createElement("figure");

    const img = document.createElement("img");
    img.setAttribute("src", temple.imageUrl);
    img.setAttribute("alt", `${temple.templeName} Temple`);
    img.setAttribute("loading", "lazy");
    img.setAttribute("width", "400");
    img.setAttribute("height", "250");

    const caption = document.createElement("figcaption");

    const name = document.createElement("h3");
    name.textContent = temple.templeName;

    const location = document.createElement("p");
    location.textContent = `Location: ${temple.location}`;

    const dedicated = document.createElement("p");
    dedicated.textContent = `Dedicated: ${temple.dedicated}`;

    const area = document.createElement("p");
    area.textContent = `Size: ${temple.area.toLocaleString("en-US")} sq ft`;

    caption.append(name, location, dedicated, area);
    card.append(img, caption);
    gallery.appendChild(card);
  });
}

// ---------- Filters ----------
function getYear(temple) {
  return parseInt(temple.dedicated.split(",")[0], 10);
}

const filters = {
  home: () => temples,
  old: () => temples.filter(temple => getYear(temple) < 1900),
  new: () => temples.filter(temple => getYear(temple) > 2000),
  large: () => temples.filter(temple => temple.area > 90000),
  small: () => temples.filter(temple => temple.area < 10000)
};

const navLinks = document.querySelectorAll("#primary-nav a");

navLinks.forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();

    createTempleCard(filters[link.dataset.filter]());

    // Mark the active filter and close the mobile menu
    navLinks.forEach(item => item.removeAttribute("aria-current"));
    link.setAttribute("aria-current", "true");
    setMenu(false);
  });
});

// Show every temple when the page first loads
createTempleCard(filters.home());
