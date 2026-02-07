const locationToggle = document.getElementById("locationToggle");
const alertToggle = document.getElementById("alertToggle");
const checkinTime = document.getElementById("checkinTime");
const saveBtn = document.getElementById("saveBtn");
const statusMessage = document.getElementById("statusMessage");

// Load saved settings on page load
window.onload = () => {
  locationToggle.checked =
    localStorage.getItem("locationTracking") === "true";

  alertToggle.checked =
    localStorage.getItem("safetyAlerts") === "true";

  checkinTime.value =
    localStorage.getItem("checkinTime") || "10";
};

// Save settings
saveBtn.addEventListener("click", () => {

  localStorage.setItem(
    "locationTracking",
    locationToggle.checked
  );

  localStorage.setItem(
    "safetyAlerts",
    alertToggle.checked
  );

  localStorage.setItem(
    "checkinTime",
    checkinTime.value
  );

  statusMessage.textContent = "Settings saved!";
  setTimeout(() => statusMessage.textContent = "", 2000);
});

function goHome() {
  window.location.href = "index.html"; 
}
