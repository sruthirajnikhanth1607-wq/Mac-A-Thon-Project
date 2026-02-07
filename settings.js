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

let contacts = JSON.parse(localStorage.getItem("emergencyContacts")) || [];

function saveContacts() {
  localStorage.setItem("emergencyContacts", JSON.stringify(contacts));
}

function renderContacts() {
  const list = document.getElementById("contacts-list");
  list.innerHTML = "";

  contacts.forEach((contact, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>
        <strong>${contact.name}</strong><br>
        ${contact.phone}
      </span>
      <button onclick="removeContact(${index})">Remove</button>
    `;

    list.appendChild(li);
  });
}

function addContact() {
  const nameInput = document.getElementById("contact-name");
  const phoneInput = document.getElementById("contact-phone");

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();

  if (!name || !phone) {
    alert("Please enter both name and phone number.");
    return;
  }

  contacts.push({ name, phone });
  saveContacts();
  renderContacts();

  nameInput.value = "";
  phoneInput.value = "";
}

function removeContact(index) {
  contacts.splice(index, 1);
  saveContacts();
  renderContacts();
}

// Load contacts on page load
renderContacts();

