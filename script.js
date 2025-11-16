// DOM Elements
const btnMetric = document.getElementById('btn-metric');
const btnStandard = document.getElementById('btn-standard');
const inputWeightKg = document.getElementById('input-weight-kg');
const inputWeightLbs = document.getElementById('input-weight-lbs');
const resultsPanel = document.getElementById('results-panel');
const errorMsg = document.getElementById('error-msg');

// Inputs
const heightCmEl = document.getElementById('height-cm');
const heightFtEl = document.getElementById('height-ft');
const heightInEl = document.getElementById('height-in');

// Outputs
const bmiScoreEl = document.getElementById('bmi-score');
const resultMsgEl = document.getElementById('result-message');
const gaugePath = document.getElementById('gauge-path');
const idealWeightEl = document.getElementById('ideal-weight');
const dailyCalEl = document.getElementById('daily-calories');
const waterIntakeEl = document.getElementById('water-intake'); // New
const bmrScoreEl = document.getElementById('bmr-score');       // New

let weightUnit = 'kg'; 

// Height Conversion
function convertFromCm() {
    let cm = parseFloat(heightCmEl.value);
    if (!isNaN(cm)) {
        let totalInches = cm / 2.54;
        let feet = Math.floor(totalInches / 12);
        let inches = Math.round(totalInches % 12);
        if (inches === 12) { feet++; inches = 0; }
        heightFtEl.value = feet;
        heightInEl.value = inches;
    } else {
        heightFtEl.value = '';
        heightInEl.value = '';
    }
}

function convertFromFtIn() {
    let feet = parseFloat(heightFtEl.value) || 0;
    let inches = parseFloat(heightInEl.value) || 0;
    if (feet > 0 || inches > 0) {
        let totalInches = (feet * 12) + inches;
        let cm = totalInches * 2.54;
        heightCmEl.value = Math.round(cm);
    } else {
        heightCmEl.value = '';
    }
}

// Unit Toggles
btnMetric.addEventListener('click', () => {
    weightUnit = 'kg';
    btnMetric.className = "px-6 py-2 rounded-lg text-sm font-medium transition-all bg-white text-teal-700 shadow-sm";
    btnStandard.className = "px-6 py-2 rounded-lg text-sm font-medium text-slate-500 transition-all hover:bg-slate-200";
    inputWeightKg.classList.remove('hidden');
    inputWeightLbs.classList.add('hidden');
});

btnStandard.addEventListener('click', () => {
    weightUnit = 'lbs';
    btnStandard.className = "px-6 py-2 rounded-lg text-sm font-medium transition-all bg-white text-teal-700 shadow-sm";
    btnMetric.className = "px-6 py-2 rounded-lg text-sm font-medium text-slate-500 transition-all hover:bg-slate-200";
    inputWeightLbs.classList.remove('hidden');
    inputWeightKg.classList.add('hidden');
});

// Calculate Logic
function calculateHealth() {
    const gender = document.getElementById('gender').value;
    const age = parseFloat(document.getElementById('age').value);
    const activity = parseFloat(document.getElementById('activity').value);
    const heightCm = parseFloat(heightCmEl.value);
    
    let weightKg = 0;
    if (weightUnit === 'kg') {
        weightKg = parseFloat(document.getElementById('weight-kg').value);
    } else {
        const lbs = parseFloat(document.getElementById('weight-lbs').value);
        weightKg = lbs * 0.453592;
    }

    if (!age || !heightCm || !weightKg || age <= 0 || heightCm <= 0 || weightKg <= 0) {
        errorMsg.classList.remove('hidden');
        return;
    }
    errorMsg.classList.add('hidden');

    // 1. BMI
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    
    // 2. Ideal Weight
    const minIdeal = 18.5 * (heightM * heightM);
    const maxIdeal = 24.9 * (heightM * heightM);

    // 3. BMR & Calories
    let bmr;
    if (gender === 'male') {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }
    const tdee = bmr * activity;

    // 4. Water Intake (Approx 33ml per kg)
    const waterLiters = (weightKg * 0.033).toFixed(1);

    // UI Updates
    resultsPanel.classList.remove('hidden');
    resultsPanel.classList.add('flex');

    animateValue(bmiScoreEl, 0, bmi, 1000, 1);
    animateValue(dailyCalEl, 0, tdee, 1000, 0);
    idealWeightEl.textContent = `${minIdeal.toFixed(1)} - ${maxIdeal.toFixed(1)} kg`;
    waterIntakeEl.textContent = `${waterLiters} Liters`; // Updated
    bmrScoreEl.textContent = `${Math.round(bmr)} kcal`; // Updated

    let color = "#10b981"; 
    let category = "Healthy";
    let msgClass = "text-green-400";

    if (bmi < 18.5) {
        category = "Underweight"; color = "#3b82f6"; msgClass = "text-blue-400";
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        category = "Healthy"; color = "#10b981"; msgClass = "text-green-400";
    } else if (bmi >= 25 && bmi <= 29.9) {
        category = "Overweight"; color = "#eab308"; msgClass = "text-yellow-400";
    } else {
        category = "Obese"; color = "#ef4444"; msgClass = "text-red-400";
    }

    resultMsgEl.innerHTML = `Your BMI is ${bmi.toFixed(1)}.<br>You are <span class="${msgClass} font-bold uppercase">${category}</span>.`;
    
    const offset = 100 - (Math.min(bmi, 40) / 40 * 100); 
    gaugePath.style.strokeDashoffset = offset;
    gaugePath.style.stroke = color;
}

function animateValue(obj, start, end, duration, decimals) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const val = progress * (end - start) + start;
        obj.innerHTML = val.toFixed(decimals) + (obj.id.includes('cal') || obj.id.includes('bmr') ? ' kcal' : '');
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}