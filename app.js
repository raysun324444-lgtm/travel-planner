// Complete Country Matrix with your new destinations
// costTier: 1 = Budget-friendly, 3 = Expensive
const countryData = {
    "US": { region: "NA", costTier: 3 },    // United States
    "UK": { region: "EU", costTier: 3 },    // United Kingdom
    "FR": { region: "EU", costTier: 3 },    // France
    "JP": { region: "AS", costTier: 2.5 },  // Japan
    "TH": { region: "AS", costTier: 1 },    // Thailand
    "KH": { region: "AS", costTier: 1 },    // Cambodia
    "AE": { region: "ME", costTier: 3 },    // United Arab Emirates
    "MX": { region: "NA", costTier: 1.5 },  // Mexico
    "PT": { region: "EU", costTier: 2 }     // Portugal
};

// Global counts
let counts = { adults: 1, children: 0 };

function changeCount(type, amount) {
    counts[type] = Math.max(0, counts[type] + amount);
    if (type === 'adults' && counts.adults < 1) counts.adults = 1; // Require 1 adult
    document.getElementById(`${type}-count`).innerText = counts[type];
    calculateBudget();
}

function calculateBudget() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const departDate = new Date(document.getElementById('depart-date').value);
    const returnDate = new Date(document.getElementById('return-date').value);
    const purpose = document.querySelector('input[name="purpose"]:checked').value;

    // 1. Calculate Duration
    const timeDiff = returnDate.getTime() - departDate.getTime();
    const days = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    // 2. Safely Get Country Data (With global safety fallback if key is missing)
    const origData = countryData[origin] || { region: "UNKNOWN", costTier: 2 };
    const destData = countryData[destination] || { region: "UNKNOWN", costTier: 2 };
    
    // 3. Determine Flight/Transit Cost Based on Regions
    let flightBaseCost = 200; // Default for internal/close travel
    if (origData.region !== destData.region) {
        flightBaseCost = 950; // Long-haul cross-region travel
    }

    // 4. Determine Local Living Cost Baseline per Day
    const baseDailyRate = 45 * destData.costTier; 

    // 5. Passenger Multipliers
    const totalPeopleMultiplier = counts.adults + (counts.children * 0.6);

    // 6. Purpose Premium (Business travel scale factor)
    const businessMultiplier = (purpose === 'business') ? 1.45 : 1.0;

    // 7. Generate Tiers
    // Economy Tier
    const lowFlight = flightBaseCost * 0.75;
    const lowDaily = baseDailyRate * 0.65;
    const lowTotal = (lowFlight * totalPeopleMultiplier) + (lowDaily * days * totalPeopleMultiplier);

    // Comfort Tier
    const midFlight = flightBaseCost * 1.0;
    const midDaily = baseDailyRate * 1.25;
    const midTotal = ((midFlight * totalPeopleMultiplier) + (midDaily * days * totalPeopleMultiplier)) * businessMultiplier;

    // Exclusive Tier
    const highFlight = flightBaseCost * 2.6;
    const highDaily = baseDailyRate * 3.8;
    const highTotal = ((highFlight * totalPeopleMultiplier) + (highDaily * days * totalPeopleMultiplier)) * businessMultiplier * 1.35;

    // 8. Render UI updates safely
    document.getElementById('budget-low').innerText = `$${Math.round(lowTotal).toLocaleString()}`;
    document.getElementById('budget-mid').innerText = `$${Math.round(midTotal).toLocaleString()}`;
    document.getElementById('budget-exclusive').innerText = `$${Math.round(highTotal).toLocaleString()}`;
}

// Event Listeners for Dynamic Updates on Input Change
document.getElementById('origin').addEventListener('change', calculateBudget);
document.getElementById('destination').addEventListener('change', calculateBudget);
document.getElementById('depart-date').addEventListener('change', calculateBudget);
document.getElementById('return-date').addEventListener('change', calculateBudget);

// Run initial calculation on load
window.onload = calculateBudget;
