const trailList = document.querySelector("#trail-list");
const levelFilter = document.querySelector("#level-filter");
const resultCount = document.querySelector("#result-count");
const favoritesSummary = document.querySelector("#favorites-summary");

let savedIds = JSON.parse(localStorage.getItem("trailmateFavorites")) || [];

function showTrails() {
  const level = levelFilter.value;
  const visible = level === "all" ? trails : trails.filter((trail) => trail.level === level);

  trailList.innerHTML = visible
    .map((trail) => renderTrailCard(trail, true, savedIds.includes(trail.id)))
    .join(``);

  resultCount.textContent = `Showing ${visible.length} of ${trails.length} trails`;
}

function showFavorites() {
  const savedTrails = trails.filter((trail) => savedIds.includes(trail.id));

  if (savedTrails.length === 0) {
    favoritesSummary.textContent = `You have not saved any trails yet. Choose Save trail on a card to keep it here.`;
  } else {
    const names = savedTrails.map((trail) => trail.name).join(`, `);
    favoritesSummary.textContent = `You have saved ${savedTrails.length} trail(s): ${names}.`;
  }
}

function toggleFavorite(id) {
  if (savedIds.includes(id)) {
    savedIds = savedIds.filter((savedId) => savedId !== id);
  } else {
    savedIds.push(id);
  }
  localStorage.setItem("trailmateFavorites", JSON.stringify(savedIds));
  showTrails();
  showFavorites();
}

function handleListClick(event) {
  const button = event.target.closest(".fav-button");
  if (button) {
    toggleFavorite(button.dataset.id);
  }
}

levelFilter.addEventListener("change", showTrails);
trailList.addEventListener("click", handleListClick);
showTrails();
showFavorites();
