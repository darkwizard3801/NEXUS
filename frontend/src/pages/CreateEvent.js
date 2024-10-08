import React, { useState, useEffect } from 'react';
import Slider from 'react-slider';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SummaryApi from '../common';
// import MapComponent from '../components/MapComponent';
// import { fetchLocationName } from '../helpers/fetchLocation';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa'; // Importing delete icon from react-icons

// Custom red location icon setup
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const CreateEvent = () => {
  const [eventDetails, setEventDetails] = useState({
    eventType: '',
    occasion: '',
    budget: [5000, 90000], // Changed to an array for range
    guests: '',
    phoneNumber: '',
    date: '',
    location: null,
  });

  const [loadingLocation, setLoadingLocation] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [userEvents, setUserEvents] = useState([]); // To store the user's events
  const [placeNames, setPlaceNames] = useState({});
  // Fetch user details and their events
  const fetchUserDetails = async () => {
    const userDetailsResponse = await fetch(SummaryApi.current_user.url, {
      method: SummaryApi.current_user.method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const userDetailsData = await userDetailsResponse.json();
    console.log('Fetched User Details:', userDetailsData);

    if (userDetailsData.success) {
      setUserDetails(userDetailsData.data);
      setEventDetails((prevDetails) => ({
        ...prevDetails,
        phoneNumber: userDetailsData.data.phoneNumber || '', // Default to empty if not available
      }));

      // Fetch events created by the user
      fetchUserEvents(userDetailsData.data.email);
    }
  };

  // Fetch events created by the user
  const fetchUserEvents = async (email) => {
    try {
      const eventsResponse = await fetch(SummaryApi.user_events.url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const eventsData = await eventsResponse.json();
      if (eventsData.success) {
        setUserEvents(eventsData.events); // Store the events in state
      } else {
        console.error('Error fetching events:', eventsData.message);
      }
    } catch (error) {
      console.error('Error fetching user events:', error);
    }
  };

  useEffect(() => {
    fetchUserDetails(); // Fetch user details on component mount

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setEventDetails((prevDetails) => ({
            ...prevDetails,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }));
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error fetching location: ", error);
          setLoadingLocation(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setLoadingLocation(false);
    }
  }, []);
  useEffect(() => {
    const fetchPlaceName = async (lat, lng, eventId) => {
      try {
        // Replace with your chosen API
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const placeName = response.data.display_name;
        setPlaceNames((prev) => ({ ...prev, [eventId]: placeName })); // Store the place name by event ID
      } catch (error) {
        console.error('Error fetching place name:', error);
      }
    };

    // Fetch place names for all events
    userEvents.forEach((event) => {
      if (event.location) {
        fetchPlaceName(event.location.lat, event.location.lng, event._id);
      }
    });
  }, [userEvents]);

  const handleChange = (e) => {
    setEventDetails({
      ...eventDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleSliderChange = (value) => {
    setEventDetails({
      ...eventDetails,
      budget: value,
    });
  };
  const handleDelete = async (eventId) => {
    // Call your API to update the event status to 'cancelled'
    try {
      const response = await fetch(`${SummaryApi.events_del.url}/${eventId}`, {
        method: 'PATCH', // Use the appropriate method
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }), // Update status
      });
  
      // Check if the response is OK
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      // Update the userEvents state to reflect the changes
      setUserEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId ? { ...event, status: 'cancelled' } : event
        )
      );
    } catch (error) {
      console.error('Error cancelling the event:', error);
      // Optionally, you can also show a toast notification or alert to inform the user
    }
  };
  


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userDetails) {
      alert("User details not found. Please try again.");
      return;
    }

    const eventPayload = {
      ...eventDetails,
      email: userDetails.email,
      username: userDetails.name,
    };

    console.log('Event Payload:', eventPayload);

    try {
      const response = await fetch(SummaryApi.event_add.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setEventDetails({
          eventType: '',
          occasion: '',
          budget: [5000, 90000],
          guests: '',
          phoneNumber: userDetails.phoneNumber || '',
          date: '',
          location: null,
        });

        // Refetch the user's events after creating a new one
        fetchUserEvents(userDetails.email);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('An error occurred while creating the event. Please try again.');
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setEventDetails((prevDetails) => ({
          ...prevDetails,
          location: {
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          },
        }));
      },
    });
   
    return eventDetails.location ? (
      <Marker position={eventDetails.location} icon={redIcon} />
    ) : null;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl">
       
        {/* Display user's events */}
        <div className="mb-8 max-w-7xl mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-center">Your Created Events</h3>
      {userEvents.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {userEvents
            .filter((event) => event.createdBy.email === userDetails?.email) // Filter events by user email
            .map((event) => (
              <li
                key={event._id}
                className={`bg-white shadow-md rounded-lg p-6 transition-transform transform hover:scale-105 ${event.status === 'cancelled' ? 'opacity-50' : ''}`}
              >
                <h4 className="text-lg font-semibold">{event.eventType} - {event.occasion}</h4>
                <p className="text-black py-2"><b>Guests:</b> {event.guests}</p>
                {/* <p className="text-gray-700">Budget: ₹{event.budget[0]} - ₹{event.budget[1]}</p> */}
                <p className="text-black"><b>Date:</b> {new Date(event.date).toLocaleDateString()}</p>
                <p className="text-black py-2"><b>Location:</b> {placeNames[event._id] || 'Loading...'}</p> {/* Display place name */}
                
                {/* Delete Icon and Cancelled Box */}
                {event.status !== 'cancelled' ? (
                  <button
                    className="mt-4 text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(event._id)}
                    aria-label="Cancel event"
                  >
                    <FaTrash className="inline-block" />
                  </button>
                ) : (
                  <div className="mt-4 bg-red-100 text-red-500 border border-red-500 rounded text-center p-2">
                    Cancelled
                  </div>
                )}
              </li>
            ))}
        </ul>
      ) : (
        <p className="text-center">No events found. Create one below!</p>
      )}
    </div>

      <div className="bg-white rounded-lg shadow-lg w-100 md:w-128 p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">Create Event</h2>
        <form onSubmit={handleSubmit}>
          {/* Row with Event Type, Occasion, and Expected Guests */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">
                Type of Event
              </label>
              <select
                id="eventType"
                name="eventType"
                value={eventDetails.eventType}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Select Event Type</option>
                <option value="personal">Personal Events</option>
                <option value="corporate">Corporate Events</option>
                <option value="social">Social Events</option>
                <option value="sports"> Sports Events</option>
                <option value="cultural">Cultural and Religious Events</option>
                <option value="political">Political Events</option>
                <option value="academic">Academic Events</option>
                <option value="entertainment">Entertainment Events</option>
                <option value="virtual">Virtual Events</option>
                <option value="hybrid">Hybrid Events</option>
                <option value="other">Others</option>
              </select>
            </div>

            <div>
              <label htmlFor="occasion" className="block text-sm font-medium text-gray-700">
                Occasion
              </label>
              <input
                id="occasion"
                name="occasion"
                type="text"
                value={eventDetails.occasion}
                onChange={handleChange}
                placeholder="E.g., Anniversary, Product Launch"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700">
                Expected Guests
              </label>
              <input
                id="guests"
                name="guests"
                type="number"
                value={eventDetails.guests}
                onChange={handleChange}
                placeholder="Enter expected guests"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="mb-4 relative">
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
              Budget (INR)
            </label>
            <div className="relative">
              <Slider
                value={eventDetails.budget}
                onChange={handleSliderChange}
                min={0}
                max={1000000}
                step={200}
                className="w-full"
                thumbClassName="w-6 h-6 bg-blue-600 rounded-full transition-transform transform hover:scale-125"
                trackClassName="bg-gray-300 h-2 rounded-full" // Default track color
                minDistance={1000}
              />
              <div className="flex justify-between mt-2">
                <span>₹ {eventDetails.budget[0]}</span>
                <span>₹ {eventDetails.budget[1]}</span>
              </div>
            </div>
          </div>

          {/* Phone Number and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={eventDetails.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Event Date
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={eventDetails.date}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>

          {/* Map to select location */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Location
            </label>
            {loadingLocation ? (
              <p>Loading your location...</p>
            ) : (
              <MapContainer center={[eventDetails.location?.lat || 0, eventDetails.location?.lng || 0]} zoom={13} style={{ height: '300px', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker />
              </MapContainer>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Create Event
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

export default CreateEvent;