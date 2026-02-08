document.addEventListener("DOMContentLoaded", loadSettings);

function loadSettings() {
    // 1. Load Profile
    const name = localStorage.getItem("safeSenseName");
    const contact = localStorage.getItem("safeSenseContact");
    
    if (name) document.getElementById("userName").value = name;
    if (contact) document.getElementById("emergencyContact").value = contact;

    // 2. Load Toggles (Default to false if empty)
    document.getElementById("locationToggle").checked = localStorage.getItem("locationTracking") === "true";
    document.getElementById("voiceToggle").checked = localStorage.getItem("voiceEnabled") === "true";
}

function saveAllSettings() {
    // 1. Get Values
    const name = document.getElementById("userName").value.trim();
    const contact = document.getElementById("emergencyContact").value.trim();
    const loc = document.getElementById("locationToggle").checked;
    const voice = document.getElementById("voiceToggle").checked;

    // 2. Save
    if (name) localStorage.setItem("safeSenseName", name);
    if (contact) localStorage.setItem("safeSenseContact", contact);
    
    localStorage.setItem("locationTracking", loc);
    localStorage.setItem("voiceEnabled", voice);

    // 3. Feedback Button Animation
    const btn = document.querySelector(".save-btn");
    const originalText = btn.innerText;
    
    btn.innerText = "✅ Saved Successfully";
    btn.style.backgroundColor = "#10b981"; // Green color

    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = "#1f2933"; // Back to Dark Blue
    }, 2000);
}

function clearAllData() {
    if (confirm("Are you sure? This will delete your name and contacts from this device.")) {
        localStorage.clear();
        location.reload();
    }
}


