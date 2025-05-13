// Define the parking data structure
let parkingData = {
    locations: [
        { 
            id: 'downtown', 
            name: 'Downtown Parking', 
            address: '123 Main Street, Downtown', 
            availableSlots: 18, 
            occupiedSlots: 6,
            imageUrl: 'https://images.unsplash.com/photo-1470224114660-3f6686c562eb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400'
        },
        { 
            id: 'mall', 
            name: 'Shopping Mall Parking', 
            address: '500 Commerce Way, Westside', 
            availableSlots: 24, 
            occupiedSlots: 12,
            imageUrl: 'https://pixabay.com/get/g2a58ff6f3c36fb57c0f87960141bc256964fef9aaa78d0ae2f2c933b7ad7215f79332f7e237bfb4a5212577e07b48e10473924c71548f1716742e4139d1f4867_1280.jpg'
        },
        { 
            id: 'airport', 
            name: 'Airport Parking', 
            address: '1200 Airport Road, Terminal A', 
            availableSlots: 32, 
            occupiedSlots: 48,
            imageUrl: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400'
        }
    ],
    slots: {
        downtown: [
            { id: 'A1', floor: 'Ground Floor', status: 'available' },
            { id: 'A2', floor: 'Ground Floor', status: 'available' },
            { id: 'A3', floor: 'Ground Floor', status: 'available' },
            { id: 'A4', floor: 'Ground Floor', status: 'available' },
            { id: 'A5', floor: 'Ground Floor', status: 'available' },
            { id: 'A6', floor: 'Ground Floor', status: 'reserved' },
            { id: 'B1', floor: 'First Floor', status: 'available' },
            { id: 'B2', floor: 'First Floor', status: 'reserved' },
            { id: 'B3', floor: 'First Floor', status: 'available' },
            { id: 'B4', floor: 'First Floor', status: 'available' },
            { id: 'B5', floor: 'First Floor', status: 'reserved' },
            { id: 'B6', floor: 'First Floor', status: 'available' }
        ],
        mall: [
            { id: 'C1', floor: 'Ground Floor', status: 'available' },
            { id: 'C2', floor: 'Ground Floor', status: 'reserved' },
            { id: 'C3', floor: 'Ground Floor', status: 'available' },
            { id: 'C4', floor: 'Ground Floor', status: 'available' },
            { id: 'C5', floor: 'Ground Floor', status: 'available' },
            { id: 'C6', floor: 'Ground Floor', status: 'reserved' },
            { id: 'D1', floor: 'First Floor', status: 'available' },
            { id: 'D2', floor: 'First Floor', status: 'available' },
            { id: 'D3', floor: 'First Floor', status: 'reserved' },
            { id: 'D4', floor: 'First Floor', status: 'available' },
            { id: 'D5', floor: 'First Floor', status: 'available' },
            { id: 'D6', floor: 'First Floor', status: 'reserved' }
        ],
        airport: [
            { id: 'E1', floor: 'Ground Floor', status: 'available' },
            { id: 'E2', floor: 'Ground Floor', status: 'reserved' },
            { id: 'E3', floor: 'Ground Floor', status: 'available' },
            { id: 'E4', floor: 'Ground Floor', status: 'reserved' },
            { id: 'E5', floor: 'Ground Floor', status: 'available' },
            { id: 'E6', floor: 'Ground Floor', status: 'reserved' },
            { id: 'F1', floor: 'First Floor', status: 'available' },
            { id: 'F2', floor: 'First Floor', status: 'reserved' },
            { id: 'F3', floor: 'First Floor', status: 'available' },
            { id: 'F4', floor: 'First Floor', status: 'available' },
            { id: 'F5', floor: 'First Floor', status: 'reserved' },
            { id: 'F6', floor: 'First Floor', status: 'available' }
        ]
    },
    reservations: []
};

// Initialize parking data from localStorage or use default data
function initializeParkingData() {
    const storedData = localStorage.getItem('parkingData');
    if (storedData) {
        parkingData = JSON.parse(storedData);
    } else {
        // Use default data and save to localStorage
        saveParkingData();
    }
}

// Save parking data to localStorage
function saveParkingData() {
    localStorage.setItem('parkingData', JSON.stringify(parkingData));
}

// Update slot status
function updateSlotStatus(locationId, slotId, status) {
    const locationSlots = parkingData.slots[locationId];
    if (!locationSlots) return false;
    
    const slotIndex = locationSlots.findIndex(slot => slot.id === slotId);
    if (slotIndex === -1) return false;
    
    // Update slot status
    locationSlots[slotIndex].status = status;
    
    // Update available and occupied slot counts
    const location = parkingData.locations.find(loc => loc.id === locationId);
    if (location) {
        if (status === 'reserved') {
            location.availableSlots--;
            location.occupiedSlots++;
        } else {
            location.availableSlots++;
            location.occupiedSlots--;
        }
    }
    
    // Save updated data
    saveParkingData();
    return true;
}

// Get location by ID
function getLocationById(locationId) {
    return parkingData.locations.find(location => location.id === locationId);
}

// Get slot by ID within a location
function getSlotById(locationId, slotId) {
    const locationSlots = parkingData.slots[locationId];
    if (!locationSlots) return null;
    
    return locationSlots.find(slot => slot.id === slotId);
}

// Create a new reservation
function createReservation(locationId, slotId, userData) {
    const reservationId = generateReservationId();
    
    const newReservation = {
        id: reservationId,
        locationId: locationId,
        slotId: slotId,
        userData: userData,
        createdAt: new Date().toISOString()
    };
    
    // Update slot status
    updateSlotStatus(locationId, slotId, 'reserved');
    
    // Add reservation to the array
    parkingData.reservations.push(newReservation);
    
    // Save updated data
    saveParkingData();
    
    return newReservation;
}

// Cancel a reservation
function cancelReservation(reservationId) {
    // Find the reservation
    const reservationIndex = parkingData.reservations.findIndex(res => res.id === reservationId);
    if (reservationIndex === -1) return false;
    
    const reservation = parkingData.reservations[reservationIndex];
    
    // Update slot status to available
    updateSlotStatus(reservation.locationId, reservation.slotId, 'available');
    
    // Remove reservation from array
    parkingData.reservations.splice(reservationIndex, 1);
    
    // Save updated data
    saveParkingData();
    
    return true;
}