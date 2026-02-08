// Load saved settings when the page opens
document.addEventListener("DOMContentLoaded", () => {
    const savedName = localStorage.getItem("safeSenseName");
    const savedContact = localStorage.getItem("safeSenseContact");

    if (savedName) {
        document.getElementById("userName").value = savedName;
    }
    if (savedContact) {
        document.getElementById("emergencyContact").value = savedContact;
    }
});

function saveSettings() {
    const name = document.getElementById("userName").value.trim();
    const contact = document.getElementById("emergencyContact").value.trim();

    if (name) {
        localStorage.setItem("safeSenseName", name);
    }
    
    if (contact) {
        localStorage.setItem("safeSenseContact", contact);
    }

    // Visual feedback
    const btn = document.querySelector(".save-btn");
    const originalText = btn.innerText;
    btn.innerText = "✅ Saved!";
    btn.style.backgroundColor = "#10b981"; // Green

    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = "#2563eb"; // Blue
    }, 2000);
}

function clearData() {
    if(confirm("Are you sure? This will clear your name and saved contacts.")) {
        localStorage.removeItem("safeSenseName");
        localStorage.removeItem("safeSenseContact");
        location.reload();
    }
}

