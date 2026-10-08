const countMessage = document.querySelector("#count");
const heading = document.querySelector("#thanks");

function incrementReviewCount() {
  const current = Number(localStorage.getItem("reviewCount")) || 0;
  const updated = current + 1;
  localStorage.setItem("reviewCount", updated);
  return updated;
}

function showCount(total) {
  const word = total === 1 ? "review" : "reviews";
  countMessage.textContent = `You have completed ${total} ${word} on this device.`;
}

function greetReviewer() {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("username");
  if (name && name.trim() !== "") {
    heading.textContent = `Thank you for your review, ${name.trim()}!`;
  }
}

function showFooterDates() {
  document.querySelector("#year").textContent = `${new Date().getFullYear()}`;
  document.querySelector("#lastModified").textContent = `${document.lastModified}`;
}

greetReviewer();
showCount(incrementReviewCount());
showFooterDates();
