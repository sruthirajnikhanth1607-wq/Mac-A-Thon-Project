// Load saved settings
window.onload = () => {
  document.getElementById("locationToggle").checked =
    localStorage.getItem("locationTracking") === "true";

  document.getElementById("voiceToggle").checked =
    localStorage.getItem("voiceEnabled") === "true";

  const name = localStorage.getItem("emergencyName");
  const phone = localStorage.getItem("emergencyPhone");

  if (name && phone) {
    document.getElementById("savedContact").innerText =
      `Saved: ${name} (${phone})`;
  }
};

// Save toggles
function saveSettings() {
  localStorage.setItem(
    "locationTracking",
    document.getElementById("locationToggle").checked
  );

  localStorage.setItem(
    "voiceEnabled",
    document.getElementById("voiceToggle").checked
  );

  alert("✅ Settings saved");
}

// Save emergency contact
function saveContact() {
  const name = document.getElementById("contactName").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();

  if (!name || !phone) {
    alert("Please enter both name and phone number.");
    return;
  }

  localStorage.setItem("emergencyName", name);
  localStorage.setItem("emergencyPhone", phone);

  document.getElementById("savedContact").innerText =
    `Saved: ${name} (${phone})`;

  document.getElementById("contactName").value = "";
  document.getElementById("contactPhone").value = "";
}


