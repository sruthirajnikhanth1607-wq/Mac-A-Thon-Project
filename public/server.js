// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendMessage');
const quickButtons = document.querySelectorAll('.quick-btn');
const enableLocationBtn = document.getElementById('enableLocation');
const locationStatus = document.getElementById('locationStatus');
const startCheckinBtn = document.getElementById('startCheckin');
const destinationInput = document.getElementById('destination');
const etaInput = document.getElementById('eta');
const checkinStatus = document.getElementById('checkinStatus');

// State
let userLocation = null;
let checkinTimer = null;
let sessionId = 'user_' + Date.now();

// Initialize
function init() {
    // Load chat history from localStorage
    const savedHistory = localStorage.getItem('citysense_history');
    if (savedHistory) {
        try {
            const history = JSON.parse(savedHistory);
            history.forEach(msg => {
                addMessage(msg.content, msg.role === 'user' ? 'user' : 'bot');
            });
        } catch (e) {
            console.log('No saved history found');
        }
    }
    
    // Scroll to bottom of chat
    scrollToBottom();
}

// Add message to chat
function addMessage(text, sender = 'user', isEmergency = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="avatar">
            <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
        </div>
        <div class="content ${isEmergency ? 'emergency-message' : ''}">
            <div class="sender">${sender === 'user' ? 'You' : 'CitySense'}</div>
            <div class="text">${formatMessage(text)}</div>
            <div class="timestamp">${timestamp}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    // Save to localStorage (simplified)
    if (sender === 'user' || sender === 'bot') {
        saveMessageToHistory(text, sender);
    }
}

// Format message with line breaks
function formatMessage(text) {
    return text.replace(/\n/g, '<br>')
               .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
               .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// Save message to localStorage
function saveMessageToHistory(text, sender) {
    const history = JSON.parse(localStorage.getItem('citysense_history') || '[]');
    history.push({ content: text, role: sender, timestamp: new Date().toISOString() });
    
    // Keep only last 50 messages
    if (history.length > 50) {
        history.splice(0, history.length - 50);
    }
    
    localStorage.setItem('citysense_history', JSON.stringify(history));
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="content">
            <div class="sender">CitySense</div>
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

// Hide typing indicator
function hideTyping() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Send message to API
async function sendMessage(message) {
    showTyping();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId,
                location: userLocation
            })
        });
        
        const data = await response.json();
        hideTyping();
        
        if (data.success) {
            addMessage(data.message, 'bot', data.isEmergency);
        } else {
            addMessage("Sorry, I'm having trouble responding. Please try again.", 'bot');
        }
    } catch (error) {
        hideTyping();
        addMessage("Network error. Please check your connection.", 'bot');
        console.error('Error:', error);
    }
}

// Get user location
function getLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }
    
    enableLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            locationStatus.innerHTML = `
                <i class="fas fa-map-marker-alt"></i>
                <span>Location: Enabled</span>
                <button class="btn-small" onclick="shareNearbySafeSpots()">
                    <i class="fas fa-info-circle"></i> Show Safe Spots
                </button>
            `;
            
            addMessage("📍 Location enabled! I can now give you location-specific safety advice.", 'bot');
        },
        (error) => {
            enableLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Enable';
            alert("Unable to get location. Please enable location permissions.");
            console.error("Geolocation error:", error);
        }
    );
}

// Share nearby safe spots
async function shareNearbySafeSpots() {
    if (!userLocation) return;
    
    showTyping();
    
    try {
        const response = await fetch(`/api/nearby-safespots?lat=${userLocation.lat}&lng=${userLocation.lng}`);
        const data = await response.json();
        
        hideTyping();
        
        let safeSpotsMessage = "📍 **Nearby Safe Spots:**\n\n";
        data.safeSpots.forEach(spot => {
            safeSpotsMessage += `• **${spot.name}** (${spot.distance}) - ${spot.type}\n`;
        });
        
        safeSpotsMessage += "\nRemember: Well-lit public spaces are safer than isolated areas.";
        addMessage(safeSpotsMessage, 'bot');
    } catch (error) {
        hideTyping();
        addMessage("I found some general safe spots nearby: police stations, 24-hour stores, and well-lit public areas.", 'bot');
    }
}

// Start safety check-in
function startSafetyCheckin() {
    const destination = destinationInput.value.trim();
    const etaMinutes = parseInt(etaInput.value);
    
    if (!destination || !etaMinutes || etaMinutes < 1) {
        alert("Please enter a valid destination and ETA (in minutes)");
        return;
    }
    
    // Clear any existing timer
    if (checkinTimer) {
        clearTimeout(checkinTimer);
    }
    
    // Show check-in started
    checkinStatus.innerHTML = `
        <div style="color: #0c2461;">
            <i class="fas fa-clock"></i> Check-in active: Heading to <strong>${destination}</strong>
            <br>Expected arrival: <strong>${etaMinutes} minutes</strong>
        </div>
    `;
    
    addMessage(`✅ Safety check-in started! I'll check on you in ${etaMinutes} minutes when you should arrive at ${destination}.`, 'bot');
    
    // Set timer to check in
    const etaMs = etaMinutes * 60 * 1000;
    checkinTimer = setTimeout(() => {
        // Check if user arrived
        checkinStatus.innerHTML = `
            <div style="background: #fff3cd; padding: 10px; border-radius: 5px;">
                <i class="fas fa-exclamation-triangle"></i> 
                <strong>Check-in Alert:</strong> You should have arrived at ${destination} by now.
                <br>Are you safe? 
                <button onclick="confirmSafety()" class="btn-small" style="margin-top: 5px;">
                    <i class="fas fa-check"></i> I'm Safe
                </button>
            </div>
        `;
        
        addMessage(`👋 You should have arrived at ${destination} by now. Are you safe? If I don't hear back, I'll remind you to check in.`, 'bot');
        
        // If no response in 1 minute, show alert
        setTimeout(() => {
            if (checkinTimer) {
                checkinStatus.innerHTML += `
                    <div style="background: #ffeaea; padding: 10px; border-radius: 5px; margin-top: 10px;">
                        <i class="fas fa-bell"></i> 
                        <strong>Reminder:</strong> Please confirm your safety or contact someone you trust.
                    </div>
                `;
            }
        }, 60000); // 1 minute
    }, etaMs);
}

// Confirm safety
function confirmSafety() {
    checkinTimer = null;
    checkinStatus.innerHTML = `
        <div style="color: #28a745;">
            <i class="fas fa-check-circle"></i> Safety confirmed! Check-in complete.
        </div>
    `;
    
    addMessage("✅ Great! Thanks for confirming your safety.", 'bot');
}

// Event Listeners
sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message) {
        addMessage(message, 'user');
        sendMessage(message);
        messageInput.value = '';
    }
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendButton.click();
    }
});

quickButtons.forEach(button => {
    button.addEventListener('click', () => {
        const message = button.getAttribute('data-msg');
        messageInput.value = message;
        sendButton.click();
    });
});

enableLocationBtn.addEventListener('click', getLocation);

startCheckinBtn.addEventListener('click', startSafetyCheckin);

// Initialize the app
document.addEventListener('DOMContentLoaded', init);

// Make functions available globally for buttons
window.shareNearbySafeSpots = shareNearbySafeSpots;
window.confirmSafety = confirmSafety;