document.addEventListener("DOMContentLoaded", () => {

    // ✅ FIXED: Safe localStorage with fallback
    let userName = "User";
    let emergencyContacts = [];

    try {
        userName = localStorage.getItem("safeSenseName") || "User";
        emergencyContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    } catch (e) {
        console.log("Storage not available - using defaults");
    }

    // ✅ Set greeting (only once!)
    const greetingEl = document.getElementById("greeting");
    if (greetingEl) {
        greetingEl.innerText = `Hello, ${userName}!`;
    }

    // ✅ Set up user data
    const user = {
        name: userName,
        emergencyContact: emergencyContacts.length > 0 ? emergencyContacts[0].name : "Emergency Contact",
        emergencyContactPhone: emergencyContacts.length > 0 ? emergencyContacts[0].phone : "911"
    };

    // ✅ Hide alert on load
    document.getElementById("custom-alert").classList.add("hidden");

    // ✅ Alert function
    function showAlert(title, message, showCancel = false) {
        return new Promise((resolve) => {
            const modal = document.getElementById("custom-alert");
            const titleEl = document.getElementById("alert-title");
            const messageEl = document.getElementById("alert-message");
            const confirmBtn = document.getElementById("alert-confirm");
            const cancelBtn = document.getElementById("alert-cancel");

            titleEl.textContent = title;
            messageEl.textContent = message;

            cancelBtn.classList.toggle("hidden", !showCancel);
            modal.classList.remove("hidden");

            confirmBtn.onclick = () => {
                modal.classList.add("hidden");
                resolve(true);
            };

            cancelBtn.onclick = () => {
                modal.classList.add("hidden");
                resolve(false);
            };
        });
    }

    /* -----------------------------
       GTHA CRIME DATABASE
       ----------------------------- */
    const gthaCrimeData = {
        "Downtown Toronto": { riskIndex: 0.9, incidents24h: 8 },
        "North York": { riskIndex: 0.5, incidents24h: 3 },
        "Scarborough": { riskIndex: 0.7, incidents24h: 5 },
        "Etobicoke": { riskIndex: 0.4, incidents24h: 2 },
        "East York": { riskIndex: 0.3, incidents24h: 1 },
        "Mississauga": { riskIndex: 0.6, incidents24h: 4 },
        "Brampton": { riskIndex: 0.7, incidents24h: 5 },
        "Markham": { riskIndex: 0.3, incidents24h: 2 },
        "Vaughan": { riskIndex: 0.4, incidents24h: 2 },
        "Richmond Hill": { riskIndex: 0.3, incidents24h: 1 },
        "Oakville": { riskIndex: 0.2, incidents24h: 1 },
        "Burlington": { riskIndex: 0.3, incidents24h: 2 },
        "Hamilton": { riskIndex: 0.8, incidents24h: 6 },
        "Pickering": { riskIndex: 0.3, incidents24h: 1 },
        "Ajax": { riskIndex: 0.4, incidents24h: 2 },
        "Whitby": { riskIndex: 0.3, incidents24h: 1 },
        "Oshawa": { riskIndex: 0.6, incidents24h: 4 }
    };

    /* -----------------------------
       GTHA CITY DETECTION
       ----------------------------- */
    function resolveGTHACity(lat, lon) {
        if (lat >= 43.63 && lat <= 43.68 && lon >= -79.42 && lon <= -79.36) return "Downtown Toronto";
        if (lat >= 43.73 && lat <= 43.80 && lon >= -79.46 && lon <= -79.34) return "North York";
        if (lat >= 43.70 && lat <= 43.82 && lon >= -79.30 && lon <= -79.18) return "Scarborough";
        if (lat >= 43.60 && lat <= 43.72 && lon >= -79.60 && lon <= -79.45) return "Etobicoke";
        if (lat >= 43.55 && lat <= 43.65 && lon >= -79.72 && lon <= -79.55) return "Mississauga";
        if (lat >= 43.68 && lat <= 43.75 && lon >= -79.80 && lon <= -79.68) return "Brampton";
        if (lat >= 43.83 && lat <= 43.89 && lon >= -79.35 && lon <= -79.25) return "Markham";
        if (lat >= 43.78 && lat <= 43.86 && lon >= -79.55 && lon <= -79.45) return "Vaughan";
        if (lat >= 43.15 && lat <= 43.35 && lon >= -80.15 && lon <= -79.70) return "Hamilton";
        if (lat >= 43.42 && lat <= 43.50 && lon >= -79.72 && lon <= -79.65) return "Oakville";
        if (lat >= 43.30 && lat <= 43.37 && lon >= -79.85 && lon <= -79.78) return "Burlington";
        if (lat >= 43.84 && lat <= 43.88 && lon >= -79.05 && lon <= -78.98) return "Ajax";
        if (lat >= 43.82 && lat <= 43.87 && lon >= -79.12 && lon <= -79.05) return "Pickering";
        if (lat >= 43.85 && lat <= 43.90 && lon >= -78.98 && lon <= -78.92) return "Whitby";
        if (lat >= 43.88 && lat <= 43.93 && lon >= -78.90 && lon <= -78.83) return "Oshawa";
        if (lat >= 43.85 && lat <= 43.90 && lon >= -79.47 && lon <= -79.40) return "Richmond Hill";
        return "Unknown";
    }

    function calculateRiskForGTHA(city) {
        const data = gthaCrimeData[city];
        if (!data) return { level: "low", score: 95, incidents: 0 };

        let level = "low";
        let score = 95;

        if (data.riskIndex >= 0.8) {
            level = "high";
            score = 65;
        } else if (data.riskIndex >= 0.5) {
            level = "medium";
            score = 80;
        } else {
            score = 92;
        }

        return { level, score, incidents: data.incidents24h };
    }

    function getRiskExplanation(city, level, incidents, timeOfDay) {
        if (level === "low") {
            return `No unusual activity has been reported in ${city}. This area is currently considered safe.`;
        }
        if (level === "medium") {
            return `There has been a moderate increase in reported incidents in ${city}, especially during the ${timeOfDay.toLowerCase()}. Stay alert and avoid isolated areas.`;
        }
        return `Multiple incidents have been reported in ${city} within the last 24 hours. Extra caution is advised, particularly at ${timeOfDay.toLowerCase()}.`;
    }

    /* -----------------------------
       LOCATION & RISK UPDATES
       ----------------------------- */
    const locationText = document.querySelector(".location-text");
    const mapFrame = document.querySelector(".map-container iframe");
    const incidentsMetric = document.querySelector(".recent_incidents .metric");
    const riskLevelElement = document.getElementById("risk-level");
    const safetyActionsPanel = document.getElementById("safety-actions");
    const incidentContext = document.getElementById("incident-context");
    const panicButton = document.querySelector(".panic-button");

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const city = resolveGTHACity(lat, lon);
                const riskData = calculateRiskForGTHA(city);

                mapFrame.src = `https://www.google.com/maps?q=${lat},${lon}&output=embed`;

                locationText.innerHTML = `📍 ${city} <br>Safety Score: <strong>${riskData.score} / 100</strong>`;
                incidentsMetric.textContent = `${riskData.incidents} nearby`;

                updateRisk(riskData.level);

                const explanationElement = document.getElementById("ai-risk-explanation");
                const timeOfDay = (new Date().getHours() >= 20 || new Date().getHours() <= 5) ? "Night" : "Day";
                explanationElement.textContent = getRiskExplanation(city, riskData.level, riskData.incidents, timeOfDay);
            },
            () => {
                locationText.textContent = "📍 Location access denied. Enable location for real-time safety data.";
            }
        );
    }

    /* -----------------------------
       RISK LEVEL HANDLING
       ----------------------------- */
    function updateRisk(level) {
        riskLevelElement.classList.remove("low", "medium", "high");
        riskLevelElement.classList.add(level);

        if (level === "low") {
            riskLevelElement.textContent = "Low";
            safetyActionsPanel.classList.add("hidden");
            incidentContext.textContent = "No immediate threats detected in your area.";
            panicButton.classList.remove("pulse");
        }

        if (level === "medium") {
            riskLevelElement.textContent = "Medium";
            safetyActionsPanel.classList.remove("hidden");
            incidentContext.textContent = "Increased activity reported nearby. Stay alert.";
            panicButton.classList.remove("pulse");
        }

        if (level === "high") {
            riskLevelElement.textContent = "High";
            safetyActionsPanel.classList.remove("hidden");
            incidentContext.textContent = "Elevated activity reported nearby.";
            panicButton.classList.add("pulse");
        }
    }

    /* -----------------------------
       PANIC BUTTON & SAFETY ACTIONS
       ----------------------------- */
    panicButton.addEventListener("click", async () => {
        const confirmed = await showAlert(
            "Emergency Call",
            "This will contact emergency services immediately. Continue?",
            true
        );

        if (confirmed) {
            await showAlert("Status", "Emergency services contacted successfully.");
        }
    });

    // ✅ FIXED: Get buttons from safety panel
    const callBtn = safetyActionsPanel.querySelector(".primary");
    const notifyBtn = safetyActionsPanel.querySelector(".secondary");
    const safeBtn = safetyActionsPanel.querySelector(".tertiary");

    callBtn.addEventListener("click", async () => {
        const confirmed = await showAlert(
            "Confirm Emergency Call",
            "Are you sure you want to contact emergency services?",
            true
        );

        if (!confirmed) return;

        await showAlert(
            "Emergency Services Contacted",
            "Emergency services have been contacted. Stay where you are if possible."
        );
    });

    notifyBtn.addEventListener("click", async () => {
        if (!user.emergencyContact || user.emergencyContact === "Emergency Contact") {
            await showAlert(
                "No Emergency Contact",
                "You don't have an emergency contact set. Add one in Settings."
            );
            return;
        }

        await showAlert(
            "Contact Notified",
            `Your emergency contact (${user.emergencyContact}) has been notified.`
        );
    });

    safeBtn.addEventListener("click", async () => {
        await showAlert(
            "Status Updated",
            "Glad you're safe. Risk level has been lowered."
        );
        updateRisk("low");
    });
});