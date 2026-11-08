const trails = [
  {
    id: "pipe-track",
    name: "Pipe Track",
    level: "easy",
    distanceKm: 6,
    hours: 2,
    image: "images/pipe-track.webp",
    alt: "Two hikers walking along a wide dirt path with Lion's Head in the distance",
    summary: "A mostly flat path along the Twelve Apostles with sea views. A good first hike.",
    featured: true
  },
  {
    id: "silvermine",
    name: "Silvermine Reservoir Walk",
    level: "easy",
    distanceKm: 3,
    hours: 1,
    image: "images/silvermine.webp",
    alt: "Wooden boardwalk leading to the reservoir at Silvermine with mountains behind",
    summary: "A short, shaded loop around the reservoir. Ideal for families and relaxed mornings.",
    featured: false
  },
  {
    id: "lions-head",
    name: "Lion's Head",
    level: "moderate",
    distanceKm: 5,
    hours: 2.5,
    image: "images/lions-head.webp",
    alt: "Hikers climbing the rocky path on Lion's Head at sunset",
    summary: "A spiral path to a famous summit. Short, but steep in places with some chain sections.",
    featured: true
  },
  {
    id: "platteklip-gorge",
    name: "Platteklip Gorge",
    level: "hard",
    distanceKm: 3,
    hours: 3,
    image: "images/platteklip-gorge.webp",
    alt: "View of Lion's Head and the sea from the rocks at the top of Table Mountain",
    summary: "A steady climb up the face of Table Mountain. Bring plenty of water and start early.",
    featured: true
  }
];

const eventPlan = [
  { time: "07:00", trailId: "pipe-track" },
  { time: "06:30", trailId: "lions-head" },
  { time: "06:00", trailId: "platteklip-gorge" }
];

function buildEvents(plan) {
  const nextDate = new Date();
  nextDate.setHours(0, 0, 0, 0);
  const daysUntilSaturday = (6 - nextDate.getDay() + 7) % 7 || 7;
  nextDate.setDate(nextDate.getDate() + daysUntilSaturday);

  return plan.map((item) => {
    const date = nextDate.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" });
    nextDate.setDate(nextDate.getDate() + 7);
    return { ...item, date };
  });
}

const events = buildEvents(eventPlan);

function renderTrailCard(trail, showSaveButton, isSaved) {
  const saveButton = showSaveButton
    ? `<button class="fav-button" type="button" data-id="${trail.id}" aria-pressed="${isSaved}">${isSaved ? `Saved` : `Save trail`}</button>`
    : ``;

  return `
    <article class="card">
      <img src="${trail.image}" alt="${trail.alt}" width="800" height="533" loading="lazy">
      <div class="card-body">
        <h3>${trail.name}</h3>
        <p class="level ${trail.level}">${trail.level}</p>
        <p>${trail.distanceKm} km | about ${trail.hours} hours</p>
        <p>${trail.summary}</p>
        ${saveButton}
      </div>
    </article>`;
}
