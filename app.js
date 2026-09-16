// Fixed Country Configuration Mapping Data Matched with Dropdown Keys
const countryData = {
    "US": { flag: "🇺🇸", region: "NA", costTier: 3 },
    "UK": { flag: "🇬🇧", region: "EU", costTier: 3 },
    "FR": { flag: "🇫🇷", region: "EU", costTier: 3 },
    "JP": { flag: "🇯🇵", region: "AS", costTier: 2.5 },
    "TH": { flag: "🇹🇭", region: "AS", costTier: 1 },
    "KH": { flag: "🇰🇭", region: "AS", costTier: 1 },
    "AE": { flag: "🇦🇪", region: "ME", costTier: 3 },
    "MX": { flag: "🇲🇽", region: "NA", costTier: 1.5 },
    "PT": { flag: "🇵🇹", region: "EU", costTier: 2 }
};

// Activity Matrix dynamically rendering text changes depending on selected parameters
const activitiesMatrix = {
    pleasure: {
        low: "🏨 Hostels & Shared Spaces<br>🍲 Local Street Food Stalls<br>🚌 Public Buses & Trains",
        mid: "🏨 3-Star Boutique Stays<br>☕ Cozy Cafes & Bistros<br>🚗 Local Taxis / Rideshares",
        exclusive: "🏨 Luxury 5-Star Resorts<br>🍾 High-End Fine Dining<br>✈️ First Class Stays & Cruises"
    },
    business: {
        low: "🏨 Coworking Pods / Motels<br>☕ Quick Business Lunches<br>🚌 Suburban Commuter Transit",
        mid: "🏨 Executive Hotel Rooms<br>🍽️ Premium Client Dinners<br>🚗 Dedicated Business Rides",
        exclusive: "🏨 Luxury Corporate Suites<br>🥂 VIP Gala / Top Networking<br>🚘 Private Luxury Chauffeur"
    }
};

let counts = { adults: 1, children: 0 };

function goToStep(stepNumber) {
    document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
    document.querySelectorAll('.step-indicator').forEach(dot => dot.classList.remove('active'));
    
    document.getElementById(`step-${stepNumber}`).classList.add('active');
    
    for (let i = 1; i <= stepNumber; i++) {
        document.getElementById(`dot-${i}`).classList.add('active');
    }

    document.body.className = `bg-step-${stepNumber}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Fixed Flag Lookup Implementation
function updateFlags() {
    const originVal = document.getElementById('origin').value;
    const destVal = document.getElementById('destination').value;

    document.getElementById('flag-origin').innerText = countryData[originVal]?.flag || "🏳️";
    document.getElementById('flag-destination').innerText = countryData[destVal]?.flag || "🏳️";
    
    // Automatically recalculate data states if on final view page
    calculateBudget();
}

// Activity Preview Updates dynamically matching user parameters
function updateActivityPreviews() {
    const purposeElement = document.querySelector('input[name="purpose"]:checked');
    const currentPurpose = purposeElement ? purposeElement.value : 'pleasure';
    
    document.querySelector('#preview-low .preview-content').innerHTML = activitiesMatrix[currentPurpose].low;
    document.querySelector('#preview-mid .preview-content').innerHTML = activitiesMatrix[currentPurpose].mid;
    document.querySelector('#preview-exclusive .preview-content').innerHTML = activitiesMatrix[currentPurpose].exclusive;
    
    calculateBudget();
}

function changeCount(type, amount) {
    counts[type] = Math.max(0, counts[type] + amount);
    if (type === 'adults' && counts.adults < 1) counts.adults = 1;
    document.getElementById(`${type}-count`).innerText = counts[type];
    calculateBudget();
}

function generateAndShowResults() {
    calculateBudget();
    goToStep(3);
}

function calculateBudget() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const departDate = new Date(document.getElementById('depart-date').value);
    const returnDate = new Date(document.getElementById('return-date').value);
    
    const purposeElement = document.querySelector('input[name="purpose"]:checked');
    const purpose = purposeElement ? purposeElement.value : 'pleasure';

    const timeDiff = returnDate.getTime() - departDate.getTime();
    const days = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    const origData = countryData[origin] || { region: "UNKNOWN", costTier: 2 };
    const destData = countryData[destination] || { region: "UNKNOWN", costTier: 2 };
    
    let flightBaseCost = 200;
    if (origData.region !== destData.region) {
        flightBaseCost = 950;
    }

    const baseDailyRate = 45 * destData.costTier; 
    const totalPeopleMultiplier = counts.adults + (counts.children * 0.6);
    const businessMultiplier = (purpose === 'business') ? 1.45 : 1.0;

    const lowTotal = (flightBaseCost * 0.75 * totalPeopleMultiplier) + (baseDailyRate * 0.65 * days * totalPeopleMultiplier);
    const midTotal = ((flightBaseCost * 1.0 * totalPeopleMultiplier) + (baseDailyRate * 1.25 * days * totalPeopleMultiplier)) * businessMultiplier;
    const highTotal = ((flightBaseCost * 2.6 * totalPeopleMultiplier) + (baseDailyRate * 3.8 * days * totalPeopleMultiplier)) * businessMultiplier * 1.35;

    document.getElementById('budget-low').innerText = `$${Math.round(lowTotal).toLocaleString()}`;
    document.getElementById('budget-mid').innerText = `$${Math.round(midTotal).toLocaleString()}`;
    document.getElementById('budget-exclusive').innerText = `$${Math.round(highTotal).toLocaleString()}`;
}

// Attach Event Watchers
document.getElementById('origin').addEventListener('change', updateFlags);
document.getElementById('destination').addEventListener('change', updateFlags);
document.getElementById('depart-date').addEventListener('change', calculateBudget);
document.getElementById('return-date').addEventListener('change', calculateBudget);

// Run initial configurations
window.onload = () => {
    updateFlags();
    updateActivityPreviews();
    goToStep(1);
};
