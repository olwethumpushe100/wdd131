const featuredContainer = document.querySelector("#featured-trails");
const eventList = document.querySelector("#event-list");
const welcome = document.querySelector("#welcome");

function showFeaturedTrails() {
  const featured = trails.filter((trail) => trail.featured);
  featuredContainer.innerHTML = featured
    .map((trail) => renderTrailCard(trail, false, false))
    .join(``);
}

function showEvents() {
  eventList.innerHTML = events
    .map((event) => {
      const trail = trails.find((item) => item.id === event.trailId);
      return `<li><strong>${event.date}</strong> at ${event.time}: ${trail.name} (${trail.level})</li>`;
    })
    .join(``);
}

function showWelcome() {
  const storedName = localStorage.getItem("trailmateMember") || ``;
  const memberName = storedName.replace(/[<>]/g, ``).slice(0, 80);
  if (memberName) {
    welcome.textContent = `Welcome back, ${memberName}!`;
    welcome.hidden = false;
  }
}

showFeaturedTrails();
showEvents();
showWelcome();
