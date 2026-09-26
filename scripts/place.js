// ---------- Footer: current year + last modified date ----------
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelector('#last-modified').textContent = document.lastModified;

// ---------- Weather: wind chill ----------
// Static stand-in values for this assignment (Celsius / km/h).
// A future assignment replaces these with live values from a weather API.
const currentTempC = -2;
const currentWindKmh = 18;

/**
 * Returns the wind chill factor (°C) for a given temperature and wind speed,
 * using the Environment Canada wind chill formula.
 */
function calculateWindChill(tempC, windKmh) {
  return Math.round(13.12 + 0.6215 * tempC - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * tempC * Math.pow(windKmh, 0.16));
}

const windChillEl = document.querySelector('#wind-chill');
const canCalculate = currentTempC <= 10 && currentWindKmh > 4.8;

windChillEl.textContent = canCalculate
  ? `${calculateWindChill(currentTempC, currentWindKmh)}\u00B0C`
  : 'N/A';
