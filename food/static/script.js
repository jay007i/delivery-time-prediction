/**
 * DeliveryAI - Delivery Time Prediction Frontend
 * 
 * This script handles form submission, data encoding,
 * API communication, and result display for the ML prediction interface.
 */

// ============================================
// DOM Element References
// ============================================
const predictionForm = document.getElementById('predictionForm');
const submitBtn = document.getElementById('submitBtn');
const spinner = document.getElementById('spinner');
const resultSection = document.getElementById('resultSection');
const resultValue = document.getElementById('resultValue');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');

// ============================================
// Encoding Functions
// ============================================

/**
 * Encode Weather_category to numeric value
 * Rule: "Delay-Risk" = 1, else = 0
 * @param {string} weather - Weather category value
 * @returns {number} - Encoded value (0 or 1)
 */
// function encodeWeather(weather) {
//     return weather === 'Delay-Risk' ? 1 : 0;
// }

/**
 * Encode Traffic_Level to numeric value
 * Rule: Low=1, Medium=2, High=3
 * @param {string} traffic - Traffic level value
 * @returns {number} - Encoded value (1, 2, or 3)
 */
// function encodeTraffic(traffic) {
//     const trafficMap = {
//         'Low': 1,
//         'Medium': 2,
//         'High': 3
//     };
//     return trafficMap[traffic] || 1;
// }

/**
 * Encode Vehicle_Type using one-hot encoding
 * Rule: Creates Vehicle_Type_Scooter and Vehicle_Type_Car flags
 * @param {string} vehicle - Vehicle type value
 * @returns {Object} - Object with Scooter and Car flags
 */
// function encodeVehicle(vehicle) {
//     return {
//         Vehicle_Type_Scooter: vehicle === 'Scooter' ? 1 : 0,
//         Vehicle_Type_Car: vehicle === 'Car' ? 1 : 0
//     };
// }

// ============================================
// UI Helper Functions
// ============================================

/**
 * Show loading state on submit button
 */
function showLoading() {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
}

/**
 * Hide loading state on submit button
 */
function hideLoading() {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
}

/**
 * Display the prediction result
 * @param {number} prediction - Predicted delivery time in minutes
 */
function showResult(prediction) {
    // Hide error if visible
    errorSection.classList.add('hidden');
    
    // Round to 1 decimal place for clean display
    const roundedPrediction = Math.round(prediction * 10) / 10;
    
    // Update result value
    resultValue.textContent = `${roundedPrediction} minutes`;
    
    // Show result section with animation
    resultSection.classList.remove('hidden');
    
    // Re-trigger animation by removing and adding the card
    const resultCard = document.getElementById('resultCard');
    resultCard.style.animation = 'none';
    resultCard.offsetHeight; // Trigger reflow
    resultCard.style.animation = null;
}

/**
 * Display an error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    // Hide result if visible
    resultSection.classList.add('hidden');
    
    // Update error message
    errorMessage.textContent = message;
    
    // Show error section
    errorSection.classList.remove('hidden');
}

/**
 * Hide all result/error sections
 */
function hideMessages() {
    resultSection.classList.add('hidden');
    errorSection.classList.add('hidden');
}

// ============================================
// Form Validation
// ============================================

/**
 * Validate all form inputs
 * @returns {boolean} - True if all inputs are valid
 */
function validateForm() {
    const distance = document.getElementById('distance').value;
    const prep_time = document.getElementById('prep_time').value;
    const experience = document.getElementById('experience').value;
    const weather = document.getElementById('weather').value;
    const traffic = document.getElementById('traffic').value;
    const vehicle = document.getElementById('vehicle').value;
    
    // Check if any required field is empty
    if (!distance || !prep_time || !experience || !weather || !traffic || !vehicle) {
        showError('Please fill in all required fields.');
        return false;
    }
    
    // Validate numeric values
    if (parseFloat(distance) < 0) {
        showError('Distance cannot be negative.');
        return false;
    }
    
    if (parseFloat(prep_time) < 0) {
        showError('Preparation time cannot be negative.');
        return false;
    }
    
    if (parseFloat(experience) < 0) {
        showError('Courier experience cannot be negative.');
        return false;
    }
    
    return true;
}

// ============================================
// API Communication
// ============================================

/**
 * Send prediction request to the backend API
 * @param {Object} data - Processed prediction data
 * @returns {Promise<Object>} - API response
 */
async function sendPredictionRequest(data) {
    const response = await fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
    }
    
    return response.json();
}

// ============================================
// Main Form Handler
// ============================================

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
async function handleFormSubmit(event) {
    // Prevent default form submission (no page reload)
    event.preventDefault();
    
    // Hide any previous messages
    hideMessages();
    
    // Validate form inputs
    if (!validateForm()) {
        return;
    }
    
    // Collect form values
    const distance = parseFloat(document.getElementById('distance').value);
    const prep_time = parseFloat(document.getElementById('prep_time').value);
    const experience = parseFloat(document.getElementById('experience').value);
    const weather = document.getElementById('weather').value;
    const traffic = document.getElementById('traffic').value;
    const vehicle = document.getElementById('vehicle').value;
    
    // Encode categorical variables
    // const vehicleEncoded = encodeVehicle(vehicle);
    
    // Build the request payload with processed values
    const requestData = {
    distance: distance,
    prep_time: prep_time,
    experience: experience,
    weather: weather,
    traffic: traffic,
    vehicle: vehicle
};

    
    // Show loading state
    showLoading();
    
    try {
        // Send prediction request to backend
        const response = await sendPredictionRequest(requestData);
        
        // Check if prediction exists in response
        if (response.prediction !== undefined) {
            showResult(response.prediction);
        } else {
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        // Handle different error types
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showError('Unable to connect to the server. Please check your connection.');
        } else {
            showError(error.message || 'An unexpected error occurred. Please try again.');
        }
        console.error('Prediction error:', error);
    } finally {
        // Always hide loading state
        hideLoading();
    }
}

// ============================================
// Event Listeners
// ============================================

// Attach form submit handler
predictionForm.addEventListener('submit', handleFormSubmit);

// Add input animations on focus
document.querySelectorAll('.form-input, .form-select').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

// Log initialization
console.log('DeliveryAI Prediction Interface initialized');
