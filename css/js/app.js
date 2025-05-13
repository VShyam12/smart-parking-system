// Global app state
const appState = {
    currentLocation: null,
    selectedSlot: null,
    currentReservation: null,
    viewingReservations: false
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    checkAuth();
    
    // Initialize parking data
    initializeParkingData();
    
    // Set up the header
    setupHeader();
    
    // Load the locations page by default
    showLocationsPage();
    
    // Set up event handlers for menu
    setupMenuHandlers();
});

// Set up header
function setupHeader() {
    const headerTemplate = document.getElementById('header-template').content.cloneNode(true);
    document.getElementById('header').appendChild(headerTemplate);
    
    // Set username
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('username').textContent = currentUser ? currentUser.name : 'User';
    
    // Toggle user menu
    const userMenuButton = document.getElementById('userMenuButton');
    const userMenu = document.getElementById('userMenu');
    
    userMenuButton.addEventListener('click', () => {
        userMenu.classList.toggle('hidden');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!userMenuButton.contains(event.target) && !userMenu.contains(event.target)) {
            userMenu.classList.add('hidden');
        }
    });
    
    // Logout button handler
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

// Set up menu event handlers
function setupMenuHandlers() {
    // Logo click goes to locations
    document.getElementById('logo-home').addEventListener('click', () => {
        showLocationsPage();
    });
    
    // View reservations button (desktop)
    document.getElementById('view-reservations-btn').addEventListener('click', () => {
        showReservationsPage();
    });
    
    // View reservations button (mobile)
    document.getElementById('mobile-reservations-btn').addEventListener('click', () => {
        document.getElementById('userMenu').classList.add('hidden');
        showReservationsPage();
    });
}

// Show locations page
function showLocationsPage() {
    clearMainContent();
    appState.currentLocation = null;
    appState.selectedSlot = null;
    appState.currentReservation = null;
    appState.viewingReservations = false;
    
    const mainContent = document.getElementById('main-content');
    const template = document.getElementById('locations-template');
    const clone = document.importNode(template.content, true);
    mainContent.appendChild(clone);
    
    // Populate location cards
    const locationCards = document.getElementById('location-cards');
    const cardTemplate = document.getElementById('location-card-template');
    
    parkingData.locations.forEach(location => {
        const cardClone = document.importNode(cardTemplate.content, true);
        
        // Set card data
        cardClone.querySelector('.location-name').textContent = location.name;
        cardClone.querySelector('.location-address').textContent = location.address;
        cardClone.querySelector('.location-available').textContent = location.availableSlots;
        cardClone.querySelector('.location-occupied').textContent = location.occupiedSlots;
        cardClone.querySelector('.location-image').src = location.imageUrl;
        cardClone.querySelector('.location-image').alt = location.name;
        
        // Add data attribute
        const card = cardClone.querySelector('.location-card');
        card.dataset.locationId = location.id;
        
        // Add click handler
        cardClone.querySelector('.view-slots-btn').addEventListener('click', () => {
            appState.currentLocation = location.id;
            showSlotSelectionPage();
        });
        
        locationCards.appendChild(cardClone);
    });
}

// Show slot selection page
function showSlotSelectionPage() {
    if (!appState.currentLocation) {
        showLocationsPage();
        return;
    }
    
    clearMainContent();
    
    const mainContent = document.getElementById('main-content');
    const template = document.getElementById('slot-selection-template');
    const clone = document.importNode(template.content, true);
    mainContent.appendChild(clone);
    
    // Get location data
    const location = getLocationById(appState.currentLocation);
    if (!location) {
        showLocationsPage();
        return;
    }
    
    // Set location details
    document.querySelector('.location-name').textContent = location.name;
    document.querySelector('.location-address').textContent = location.address;
    
    // Back button handler
    document.querySelector('.back-btn').addEventListener('click', () => {
        showLocationsPage();
    });
    
    // Populate slots
    const slots = parkingData.slots[appState.currentLocation];
    if (!slots) {
        showLocationsPage();
        return;
    }
    
    // Separate slots by floor
    const groundFloorSlots = slots.filter(slot => slot.floor === 'Ground Floor');
    const firstFloorSlots = slots.filter(slot => slot.floor === 'First Floor');
    
    // Populate ground floor slots
    const groundFloorContainer = document.getElementById('ground-floor-slots');
    populateSlots(groundFloorContainer, groundFloorSlots);
    
    // Populate first floor slots
    const firstFloorContainer = document.getElementById('first-floor-slots');
    populateSlots(firstFloorContainer, firstFloorSlots);
}

// Populate slot elements
function populateSlots(container, slots) {
    const template = document.getElementById('parking-slot-template');
    
    slots.forEach(slot => {
        const clone = document.importNode(template.content, true);
        
        // Set slot data
        const slotElement = clone.querySelector('.parking-slot');
        slotElement.classList.add(slot.status);
        slotElement.dataset.slotId = slot.id;
        
        clone.querySelector('.slot-id').textContent = slot.id;
        clone.querySelector('.slot-floor').textContent = slot.floor;
        
        // Add click handler for available slots
        if (slot.status === 'available') {
            slotElement.addEventListener('click', () => {
                appState.selectedSlot = slot;
                showReservationForm();
            });
        }
        
        container.appendChild(clone);
    });
}

// Show reservation form
function showReservationForm() {
    if (!appState.currentLocation || !appState.selectedSlot) {
        showLocationsPage();
        return;
    }
    
    clearMainContent();
    
    const mainContent = document.getElementById('main-content');
    const template = document.getElementById('reservation-form-template');
    const clone = document.importNode(template.content, true);
    mainContent.appendChild(clone);
    
    // Get location and slot data
    const location = getLocationById(appState.currentLocation);
    const slot = appState.selectedSlot;
    
    if (!location || !slot) {
        showLocationsPage();
        return;
    }
    
    // Set form details
    document.querySelector('.location-details').textContent = `${location.name} - ${location.address}`;
    document.querySelector('.slot-id').textContent = slot.id;
    document.querySelector('.slot-floor').textContent = slot.floor;
    
    // Set default times
    const now = new Date();
    const later = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours later
    
    document.getElementById('startTime').value = now.toISOString().slice(0, 16);
    document.getElementById('endTime').value = later.toISOString().slice(0, 16);
    
    // Back button handler
    document.querySelector('.back-btn').addEventListener('click', () => {
        showSlotSelectionPage();
    });
    
    // Form submission handler
    const form = document.getElementById('reservation-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateReservationForm()) {
            // Create user data object
            const userData = {
                fullName: document.getElementById('fullName').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                idNumber: document.getElementById('idNumber').value,
                licensePlate: document.getElementById('licensePlate').value,
                vehicleType: document.getElementById('vehicleType').value,
                make: document.getElementById('make').value,
                model: document.getElementById('model').value,
                color: document.getElementById('color').value,
                startTime: document.getElementById('startTime').value,
                endTime: document.getElementById('endTime').value
            };
            
            // Create reservation
            const reservation = createReservation(
                appState.currentLocation,
                appState.selectedSlot.id,
                userData
            );
            
            if (reservation) {
                appState.currentReservation = reservation;
                showConfirmationPage();
            }
        }
    });
}

// Validate reservation form
function validateReservationForm() {
    clearErrors();
    let isValid = true;
    
    // Required fields
    const requiredFields = [
        'fullName', 'phone', 'email', 'licensePlate', 
        'vehicleType', 'make', 'model', 'color',
        'startTime', 'endTime'
    ];
    
    requiredFields.forEach(field => {
        const value = document.getElementById(field).value.trim();
        if (!value) {
            showError(field, 'This field is required');
            isValid = false;
        }
    });
    
    // Email validation
    const email = document.getElementById('email').value.trim();
    if (email && !/\S+@\S+\.\S+/.test(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Phone validation
    const phone = document.getElementById('phone').value.trim();
    if (phone && !/^\d{10,15}$/.test(phone.replace(/[-()\s]/g, ''))) {
        showError('phone', 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Date validation
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    if (startTime && endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        if (end <= start) {
            showError('endTime', 'End time must be after start time');
            isValid = false;
        }
    }
    
    return isValid;
}

// Show confirmation page
function showConfirmationPage() {
    if (!appState.currentReservation) {
        showLocationsPage();
        return;
    }
    
    clearMainContent();
    
    const mainContent = document.getElementById('main-content');
    const template = document.getElementById('confirmation-template');
    const clone = document.importNode(template.content, true);
    mainContent.appendChild(clone);
    
    // Get data
    const reservation = appState.currentReservation;
    const location = getLocationById(reservation.locationId);
    
    if (!location) {
        showLocationsPage();
        return;
    }
    
    // Create confirmation details
    const detailsContainer = document.getElementById('confirmation-details');
    
    // Location info
    appendConfirmationDetail(detailsContainer, 'Location', location.name);
    
    // Slot info
    appendConfirmationDetail(detailsContainer, 'Parking Slot', 
        `${reservation.slotId} (${reservation.userData.vehicleType})`);
    
    // Vehicle info
    appendConfirmationDetail(detailsContainer, 'Vehicle', 
        `${reservation.userData.make} ${reservation.userData.model} (${reservation.userData.licensePlate})`);
    
    // Duration
    const startDate = new Date(reservation.userData.startTime);
    const endDate = new Date(reservation.userData.endTime);
    appendConfirmationDetail(detailsContainer, 'Duration', 
        `${formatDate(startDate)} - ${formatTime(endDate)}`);
    
    // Reservation ID
    appendConfirmationDetail(detailsContainer, 'Reservation ID', reservation.id);
    
    // Button handlers
    document.getElementById('view-reservations-confirm-btn').addEventListener('click', () => {
        showReservationsPage();
    });
    
    document.getElementById('new-reservation-btn').addEventListener('click', () => {
        appState.currentReservation = null;
        showLocationsPage();
    });
}

// Append confirmation detail to container
function appendConfirmationDetail(container, label, value) {
    const div = document.createElement('div');
    
    const labelElement = document.createElement('p');
    labelElement.className = 'text-sm text-gray-500 mb-1';
    labelElement.textContent = label;
    
    const valueElement = document.createElement('p');
    valueElement.className = 'font-medium text-gray-800';
    valueElement.textContent = value;
    
    div.appendChild(labelElement);
    div.appendChild(valueElement);
    
    container.appendChild(div);
}

// Show reservations page
function showReservationsPage() {
    clearMainContent();
    appState.viewingReservations = true;
    
    const mainContent = document.getElementById('main-content');
    const template = document.getElementById('my-reservations-template');
    const clone = document.importNode(template.content, true);
    mainContent.appendChild(clone);
    
    // Back button handler
    document.querySelector('.back-btn').addEventListener('click', () => {
        showLocationsPage();
    });
    
    // Get reservations
    const { reservations } = parkingData;
    const container = document.getElementById('reservations-container');
    
    if (reservations.length === 0) {
        // Show empty state
        container.innerHTML = `
            <div class="text-center py-12">
                <div class="text-5xl text-gray-300 mb-4">
                    <i class="fas fa-calendar-xmark"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-700 mb-2">No Reservations Found</h3>
                <p class="text-gray-500 mb-6">You haven't made any parking reservations yet.</p>
                <button 
                    id="make-reservation-btn"
                    class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition duration-200">
                    Make a Reservation
                </button>
            </div>
        `;
        
        document.getElementById('make-reservation-btn').addEventListener('click', () => {
            showLocationsPage();
        });
    } else {
        // Show reservations table
        const tableHtml = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reservation ID
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Slot
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Duration
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vehicle
                            </th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200" id="reservations-table-body">
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = tableHtml;
        const tableBody = document.getElementById('reservations-table-body');
        
        // Add reservation rows
        reservations.forEach(reservation => {
            const location = getLocationById(reservation.locationId);
            const startDate = new Date(reservation.userData.startTime);
            const endDate = new Date(reservation.userData.endTime);
            
            const row = document.createElement('tr');
            row.dataset.reservationId = reservation.id;
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-500">
                    ${reservation.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${location ? location.name : 'Unknown Location'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${reservation.slotId}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${formatDate(startDate)} - ${formatTime(endDate)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${reservation.userData.make} ${reservation.userData.model} (${reservation.userData.licensePlate})
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-3">
                        <button class="view-btn text-blue-500 hover:text-blue-700">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="cancel-btn text-red-600 hover:text-red-800">
                            <i class="fas fa-times-circle"></i> Cancel
                        </button>
                    </div>
                </td>
            `;
            
            // Add event listeners
            row.querySelector('.view-btn').addEventListener('click', () => {
                // View reservation details (currently just shows reservation page again)
                appState.currentReservation = reservation;
                showConfirmationPage();
            });
            
            row.querySelector('.cancel-btn').addEventListener('click', () => {
                if (confirm('Are you sure you want to cancel this reservation?')) {
                    if (cancelReservation(reservation.id)) {
                        // Refresh the reservations page
                        showReservationsPage();
                    }
                }
            });
            
            tableBody.appendChild(row);
        });
    }
}

// Clear main content
function clearMainContent() {
    document.getElementById('main-content').innerHTML = '';
}