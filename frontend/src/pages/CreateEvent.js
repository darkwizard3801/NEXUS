import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slider';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
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

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 13);
    }
  }, [center, map]);
  return null;
};

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

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
    const checkUserLoggedIn = async () => {
      try {
        const userDetailsResponse = await fetch(SummaryApi.current_user.url, {
          method: SummaryApi.current_user.method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const userDetailsData = await userDetailsResponse.json();

        if (userDetailsData.success) {
          setUserDetails(userDetailsData.data);
          setEventDetails((prevDetails) => ({
            ...prevDetails,
            phoneNumber: userDetailsData.data.phoneNumber || '',
          }));
          fetchUserEvents(userDetailsData.data.email);
        } else {
          // User is not logged in, redirect to home page
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking user login status:', error);
        // In case of error, redirect to home page
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserLoggedIn();

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
  }, [navigate]);
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
      toast.success("event added successfully")
      navigate("/recomendated-events")
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
        toast.error(result.message)
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

  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 2); // Add 2 days to today
    return today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const getMaxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() + 2); // Allow booking up to 2 years in advance
    return today.toISOString().split('T')[0];
  };

  const handleSearch = async () => {
    console.log("Search Query:", searchQuery); // Log the search query

    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=5`);
      console.log("API Response:", response.data); // Log the API response

      if (response.data && response.data.length > 0) {
        const firstResult = response.data[0];
        const newLocation = {
          lat: parseFloat(firstResult.lat),
          lng: parseFloat(firstResult.lon)
        };

        console.log("Searched Location:", newLocation); // Log the searched location

        setEventDetails(prevDetails => ({
          ...prevDetails,
          location: newLocation // Set the new location from search
        }));

        // Optionally, you can set the search query to the display name
        setSearchQuery(firstResult.display_name);
        setSearchResults([]); // Clear search results
      } else {
        toast.error("Location not found");
      }
    } catch (error) {
      console.error('Error searching:', error);
      if (error.response) {
        console.error('Error details:', error.response.data); // Log the error response
      } else {
        console.error('Network Error:', error.message); // Log network errors
      }
      toast.error("Error searching for location");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl">
       
       
     
<div className='pb-32'>
      <div className="bg-white rounded-lg shadow-lg w-100 md:w-128 p-6 ">
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
                min={getMinDate()}
                max={getMaxDate()}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
          </div>

          {/* Map to select location */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Location
            </label>
            <div className="relative">
              {/* Search bar positioned above map */}
              <div className="absolute top-2 right-2 z-[1000] w-64">
                <div className="bg-white p-2 rounded-md shadow-md">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm text-sm"
                      placeholder="Search location..."
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Search
                    </button>
                  </div>
                  
                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => {
                            const newLocation = {
                              lat: parseFloat(result.lat),
                              lng: parseFloat(result.lon)
                            };
                            setEventDetails(prevDetails => ({
                              ...prevDetails,
                              location: newLocation
                            }));
                            setSearchQuery(result.display_name);
                            setSearchResults([]);
                          }}
                        >
                          {result.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Map Container */}
              {loadingLocation ? (
                <p>Loading your location...</p>
              ) : (
                <MapContainer 
                  center={[eventDetails.location?.lat || 0, eventDetails.location?.lng || 0]} 
                  zoom={13} 
                  style={{ height: '400px', width: '100%'}}
                  key={eventDetails.location ? `${eventDetails.location.lat}-${eventDetails.location.lng}` : 'default'}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker />
                  <MapController center={eventDetails.location} />
                </MapContainer>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          >
            Create Event
          </button>
        </form>
      </div>
      </div>
    </div>
    </div>
  );
};

export default CreateEvent;