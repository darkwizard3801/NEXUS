import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const MapModal = ({ setShowMap, setLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleMapClick = (event) => {
    // Get latitude and longitude from the click event
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
  };

  const handleSaveLocation = () => {
    if (selectedLocation) {
      setLocation(selectedLocation); // Pass the selected location to the parent component
      setShowMap(false); // Close the map modal
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-3xl">
        <h2 className="text-xl font-bold mb-4">Select Location on Map</h2>
        <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY"> 
          <GoogleMap
            mapContainerStyle={{ height: '400px', width: '100%' }}
            center={{ lat: 37.7749, lng: -122.4194 }} // Default center point (San Francisco)
            zoom={10}
            onClick={handleMapClick} // Handle clicks on the map
          >
            {selectedLocation && (
              <Marker position={selectedLocation} />
            )}
          </GoogleMap>
        </LoadScript>

        <div className="mt-4 flex justify-end">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-lg mr-2"
            onClick={() => setShowMap(false)}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={handleSaveLocation}
            disabled={!selectedLocation}
          >
            Save Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
