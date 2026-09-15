// Country Config Matrix: Region and Local Daily Cost Tier (1 = Low, 3 = High)
const countryData = {
    "US": { region: "NA", costTier: 3 },
    "UK": { region: "EU", costTier: 3 },
    "FR": { region: "EU", costTier: 3 },
    "JP": { region: "AS", costTier: 2.5 },
    "TH": { region: "AS", costTier: 1 }
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

    // 2. Determine Flight/Transit Baseline Base on Regions
    const origData = countryData[origin];
    const destData = countryData[destination];
    
    let flightBaseCost = 200; // Domestic/Intra-region default
    if (origData.region !== destData.region) {
        flightBaseCost = 900; // Intercontinental long-haul
    }

    // 3. Determine Local Living Cost Baseline per Day
    const destinationTier = destData.costTier;
    const baseDailyRate = 40 * destinationTier; 

    // 4. Passenger Multipliers
    const totalPeopleMultiplier = counts.adults + (counts.children * 0.6);

    // 5. Purpose Premium
    const businessMultiplier = (purpose === 'business') ? 1.4 : 1.0;

    // 6. Generate Tier Tiers
    // Economy Tier
    const lowFlight = flightBaseCost * 0.7;
    const lowDaily = baseDailyRate * 0.6;
    const lowTotal = (lowFlight * totalPeopleMultiplier) + (lowDaily * days * totalPeopleMultiplier);

    // Comfort Tier
    const midFlight = flightBaseCost * 1.0;
    const midDaily = baseDailyRate * 1.2;
    const midTotal = ((midFlight * totalPeopleMultiplier) + (midDaily * days * totalPeopleMultiplier)) * businessMultiplier;

    // Exclusive Tier
    const highFlight = flightBaseCost * 2.5;
    const highDaily = baseDailyRate * 3.5;
    const highTotal = ((highFlight * totalPeopleMultiplier) + (highDaily * days * totalPeopleMultiplier)) * businessMultiplier * 1.3;

    // 7. Render UI updates
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
