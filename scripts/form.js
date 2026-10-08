const products = [
  { id: "fc-1888", name: "flux capacitor", averagerating: 4.5 },
  { id: "fc-2050", name: "power laces", averagerating: 4.7 },
  { id: "fs-1987", name: "time circuits", averagerating: 3.5 },
  { id: "ac-2000", name: "low voltage reactor", averagerating: 3.9 },
  { id: "jj-1969", name: "warp equalizer", averagerating: 5.0 }
];

const productSelect = document.querySelector("#product");
const dateInput = document.querySelector("#install-date");

function buildProductOptions(items) {
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    productSelect.appendChild(option);
  });
}

function limitInstallDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  dateInput.max = `${today.getFullYear()}-${month}-${day}`;
}

function showFooterDates() {
  document.querySelector("#year").textContent = `${new Date().getFullYear()}`;
  document.querySelector("#lastModified").textContent = `${document.lastModified}`;
}

buildProductOptions(products);
limitInstallDate();
showFooterDates();
