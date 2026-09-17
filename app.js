const countryData = {
    "US": { region: "NA", costTier: 3 },
    "UK": { region: "EU", costTier: 3 },
    "FR": { region: "EU", costTier: 3 },
    "JP": { region: "AS", costTier: 2.5 },
    "TH": { region: "AS", costTier: 1 },
    "KH": { region: "AS", costTier: 1 },
    "AE": { region: "ME", costTier: 3 },
    "MX": { region: "NA", costTier: 1.5 },
    "PT": { region: "EU", costTier: 2 }
};

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
    // Hide all steps cleanly
    document.querySelectorAll('.wizard-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelectorAll('.light-step').forEach(dot => {
        dot.classList.remove('active');
    });
    
    // Mount the requested page view active
    const targetStep = document.getElementById(`step-${stepNumber}`);
    const targetDot = document.getElementById(`traffic-dot-${stepNumber}`);
    
    if (targetStep) targetStep.classList.add('active');
    if (targetDot) targetDot.classList.add('active');

    document.body.className = `bg-step-${stepNumber}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateActivityPreviews() {
    const purposeElement = document.querySelector('input[name="purpose"]:checked');
    const currentPurpose = purposeElement ? purposeElement.value : 'pleasure';
    
    const pLow = document.querySelector('#preview-low .preview-content');
    const pMid = document.querySelector('#preview-mid .preview-content');
    const pExc = document.querySelector('#preview-exclusive .preview-content');

    if (pLow) pLow.innerHTML = activitiesMatrix[currentPurpose].low;
    if (pMid) pMid.innerHTML = activitiesMatrix[currentPurpose].mid;
    if (pExc) pExc.innerHTML = activitiesMatrix[currentPurpose].exclusive;
    
    calculateBudget();
}

function changeCount(type, amount) {
    counts[type] = Math.max(0, counts[type] + amount);
    if (type === 'adults' && counts.adults < 1) counts.adults = 1;
    
    const countLabel = document.getElementById(`${type}-count`);
    if (countLabel) countLabel.innerText = counts[type];
    
    calculateBudget();
}

function generateAndShowResults() {
    calculateBudget();
    goToStep(3);
}

function calculateBudget() {
    const originEl = document.getElementById('origin');
    const destEl = document.getElementById('destination');
    const departEl = document.getElementById('depart-date');
    const returnEl = document.getElementById('return-date');
    
    if (!originEl || !destEl || !departEl || !returnEl) return;

    const origin = originEl.value;
    const destination = destEl.value;
    const departDate = new Date(departEl.value);
    const returnDate = new Date(returnEl.value);
    
    const purposeElement = document.querySelector('input[name="purpose"]:checked');
    const purpose = purposeElement ? purposeElement.value : 'pleasure';

    const timeDiff = returnDate.getTime() - departDate.getTime();
    const days = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    const origData = countryData[origin] || { region: "UNKNOWN", costTier: 2 };
    const destData = countryData[destination] || { region: "UNKNOWN", costTier: 2 };
    
    let flightBaseCost = 220;
    if (origData.region !== destData.region) {
        flightBaseCost = 980;
    }

    const baseDailyRate = 48 * destData.costTier; 
    const totalPeopleMultiplier = counts.adults + (counts.children * 0.6);
    const businessMultiplier = (purpose === 'business') ? 1.45 : 1.0;

    const lowTotal = (flightBaseCost * 0.72 * totalPeopleMultiplier) + (baseDailyRate * 0.62 * days * totalPeopleMultiplier);
    const midTotal = ((flightBaseCost * 1.0 * totalPeopleMultiplier) + (baseDailyRate * 1.22 * days * totalPeopleMultiplier)) * businessMultiplier;
    const highTotal = ((flightBaseCost * 2.5 * totalPeopleMultiplier) + (baseDailyRate * 3.7 * days * totalPeopleMultiplier)) * businessMultiplier * 1.35;

    const bLow = document.getElementById('budget-low');
    const bMid = document.getElementById('budget-mid');
    const bExc = document.getElementById('budget-exclusive');

    if (bLow) bLow.innerText = `$${Math.round(lowTotal).toLocaleString()}`;
    if (bMid) bMid.innerText = `$${Math.round(midTotal).toLocaleString()}`;
    if (bExc) bExc.innerText = `$${Math.round(highTotal).toLocaleString()}`;
}

// Bind automatic calculation on option select changes
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('origin').addEventListener('change', calculateBudget);
    document.getElementById('destination').addEventListener('change', calculateBudget);
    document.getElementById('depart-date').addEventListener('change', calculateBudget);
    document.getElementById('return-date').addEventListener('change', calculateBudget);

    updateActivityPreviews();
    goToStep(1); // Boot app directly into Step 1 cleanly
});
