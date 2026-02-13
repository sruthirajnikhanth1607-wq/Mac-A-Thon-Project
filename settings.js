// Global array to hold contacts before saving
let contacts = [];

document.addEventListener("DOMContentLoaded", loadSettings);

function loadSettings() {
    // 1. Load Profile
    const savedName = localStorage.getItem("safeSenseName");
    if (savedName) document.getElementById("userName").value = savedName;

    // 2. Load Contacts List (Handle multiple)
    const savedContacts = localStorage.getItem("safeSenseContacts");
    if (savedContacts) {
        try {
            contacts = JSON.parse(savedContacts);
        } catch (e) {
            contacts = [];
        }
    }
    renderContacts();

    // 3. Load Toggles & Timer
    document.getElementById("trackingToggle").checked = localStorage.getItem("trackingEnabled") === "true";
    document.getElementById("locationToggle").checked = localStorage.getItem("locationPermission") === "true";
    document.getElementById("voiceToggle").checked = localStorage.getItem("voiceEnabled") === "true";
    
    const savedInterval = localStorage.getItem("checkInInterval");
    if (savedInterval) document.getElementById("checkInInterval").value = savedInterval;
}

// --- Contact Management Functions ---

function renderContacts() {
    const list = document.getElementById("contactsList");
    list.innerHTML = ""; // Clear current list

    contacts.forEach((contact, index) => {
        const li = document.createElement("li");
        li.className = "contact-item";
        li.innerHTML = `
            <div class="contact-info">
                <strong>${escapeHtml(contact.name)}</strong>
                <span>${escapeHtml(contact.phone)}</span>
            </div>
            <button class="remove-btn" onclick="removeContact(${index})">×</button>
        `;
        list.appendChild(li);
    });
}

function addContact() {
    const nameInput = document.getElementById("newContactName");
    const phoneInput = document.getElementById("newContactPhone");
    
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name || !phone) {
        alert("Please enter both a Name and Phone Number.");
        return;
    }

    // Add to array
    contacts.push({ name, phone });
    
    // Clear inputs
    nameInput.value = "";
    phoneInput.value = "";
    
    // Update UI
    renderContacts();
}

function removeContact(index) {
    contacts.splice(index, 1);
    renderContacts();
}

// --- Main Save Function ---

function saveAllSettings() {
    // 1. Get Values
    const name = document.getElementById("userName").value.trim();
    const tracking = document.getElementById("trackingToggle").checked;
    const location = document.getElementById("locationToggle").checked;
    const voice = document.getElementById("voiceToggle").checked;
    const interval = document.getElementById("checkInInterval").value;

    // 2. Save Everything to LocalStorage
    localStorage.setItem("safeSenseName", name);
    localStorage.setItem("safeSenseContacts", JSON.stringify(contacts)); // Save Array
    
    localStorage.setItem("trackingEnabled", tracking);
    localStorage.setItem("locationPermission", location);
    localStorage.setItem("voiceEnabled", voice);
    localStorage.setItem("checkInInterval", interval);

    // 3. Button Feedback
    const btn = document.querySelector(".save-btn");
    const originalText = btn.innerText;
    
    btn.innerText = "✅ All Saved!";
    btn.style.backgroundColor = "#10b981"; // Green

    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = "#1f2933"; // Back to Blue
    }, 1500);
}

function clearAllData() {
    if (confirm("Are you sure? This will delete your name, all contacts, and reset settings.")) {
        localStorage.clear();
        location.reload();
    }
}

// Helper to prevent HTML injection in names
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


