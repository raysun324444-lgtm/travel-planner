// Country Configuration with Mapping IsoCodes, Flag Icons, Regions, and Cost Factors
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

let counts = { adults: 1, children: 0 };

// Multi-Step Navigation Engine + Dynamic Background Handler
function goToStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
    document.querySelectorAll('.step-indicator').forEach(dot => dot.classList.remove('active'));
    
    // Show current target step
    document.getElementById(`step-${stepNumber}`).classList.add('active');
    
    // Light up indicators up to current step
    for (let i = 1; i <= stepNumber; i++) {
        document.getElementById(`dot-${i}`).classList.add('active');
    }

    // Morph the page background gradient dynamically
    document.body.className = `bg-step-${stepNumber}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Dropdown Auto-Flag Interceptor
function updateFlags() {
    const originVal = document.getElementById('origin').value;
    const destVal = document.getElementById('destination').value;

    document.getElementById('flag-origin').innerText = countryData[originVal]?.flag || "🏳️";
    document.getElementById('flag-destination').innerText = countryData[destVal]?.flag || "🏳️";
}

function changeCount(type, amount) {
    counts[type] = Math.max(0, counts[type] + amount);
    if (type === 'adults' && counts.adults < 1) counts.adults = 1;
    document.getElementById(`${type}-count`).innerText = counts[type];
}

function generateAndShowResults() {
    calculateBudget();
    goToStep(3); // Jump to calculated view canvas
}

function calculateBudget() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const departDate = new Date(document.getElementById('depart-date').value);
    const returnDate = new Date(document.getElementById('return-date').value);
    const purpose = document.querySelector('input[name="purpose"]:checked').value;

    const timeDiff = returnDate.getTime() - departDate.getTime();
    const days = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    const origData = countryData[origin] || { region: "UNKNOWN", costTier: 2 };
    const destData = countryData[destination] || { region: "UNKNOWN", costTier: 2 };
    
    let flightBaseCost = 200;
    if (origData.region !== destData.region) {
        flightBaseCost = 950; // Long-haul multiplier
    }

    const baseDailyRate = 45 * destData.costTier; 
    const totalPeopleMultiplier = counts.adults + (counts.children * 0.6);
    const businessMultiplier = (purpose === 'business') ? 1.45 : 1.0;

    // Computation Tier Execution
    const lowTotal = (flightBaseCost * 0.75 * totalPeopleMultiplier) + (baseDailyRate * 0.65 * days * totalPeopleMultiplier);
    const midTotal = ((flightBaseCost * 1.0 * totalPeopleMultiplier) + (baseDailyRate * 1.25 * days * totalPeopleMultiplier)) * businessMultiplier;
    const highTotal = ((flightBaseCost * 2.6 * totalPeopleMultiplier) + (baseDailyRate * 3.8 * days * totalPeopleMultiplier)) * businessMultiplier * 1.35;

    // Map safely to DOM strings
    document.getElementById('budget-low').innerText = `$${Math.round(lowTotal).toLocaleString()}`;
    document.getElementById('budget-mid').innerText = `$${Math.round(midTotal).toLocaleString()}`;
    document.getElementById('budget-exclusive').innerText = `$${Math.round(highTotal).toLocaleString()}`;
}

// Bind Watchers
document.getElementById('origin').addEventListener('change', updateFlags);
document.getElementById('destination').addEventListener('change', updateFlags);

// Init state engine
window.onload = () => {
    document.body.className = "bg-step-1";
    updateFlags();
};
