const params = new URLSearchParams(window.location.search);
const heading = document.querySelector("#thanks-heading");
const levelMessage = document.querySelector("#level-message");
const summary = document.querySelector("#summary");

const levelAdvice = {
  beginner: `We suggest starting with an easy trail such as Pipe Track.`,
  intermediate: `Lion's Head is a great next step for you.`,
  advanced: `Try Platteklip Gorge, and consider leading a group hike.`
};

function cleanText(value, maxLength) {
  if (!value) {
    return ``;
  }
  return value.replace(/[<>\u0000-\u001f]/g, ``).trim().slice(0, maxLength);
}

function showThanks() {
  const name = cleanText(params.get("fullname"), 80);
  const level = params.get("level");

  if (name) {
    heading.textContent = `Thank you for joining, ${name}!`;
    localStorage.setItem("trailmateMember", name);
  }

  if (Object.hasOwn(levelAdvice, level)) {
    levelMessage.textContent = levelAdvice[level];
  }
}

function showSummary() {
  const details = [
    { label: "Email", value: cleanText(params.get("email"), 254) },
    { label: "Experience", value: cleanText(params.get("level"), 20) },
    { label: "Preferred day", value: cleanText(params.get("day"), 20) },
    { label: "Interests", value: params.getAll("interests").map((item) => cleanText(item, 40)).join(", ") }
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
