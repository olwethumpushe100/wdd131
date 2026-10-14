const params = new URLSearchParams(window.location.search);
const heading = document.querySelector("#thanks-heading");
const levelMessage = document.querySelector("#level-message");
const summary = document.querySelector("#summary");

const levelAdvice = {
  beginner: `We suggest starting with an easy trail such as Pipe Track.`,
  intermediate: `Lion's Head is a great next step for you.`,
  advanced: `Try Platteklip Gorge, and consider leading a group hike.`
};

function showThanks() {
  const name = (params.get("fullname") || "").trim();
  const level = params.get("level");

  if (name) {
    heading.textContent = `Thank you for joining, ${name}!`;
    localStorage.setItem("trailmateMember", name);
  }

  if (level in levelAdvice) {
    levelMessage.textContent = levelAdvice[level];
  }
}

function showSummary() {
  const details = [
    { label: "Email", value: params.get("email") },
    { label: "Experience", value: params.get("level") },
    { label: "Preferred day", value: params.get("day") },
    { label: "Interests", value: params.getAll("interests").join(", ") }
  ];

  details
    .filter((item) => item.value)
    .forEach((item) => {
      const row = document.createElement("li");
      row.textContent = `${item.label}: ${item.value}`;
      summary.appendChild(row);
    });
}

showThanks();
showSummary();
