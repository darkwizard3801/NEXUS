import React, { useState, useEffect, useContext } from 'react';
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
import { FaTrash, FaPhone, FaSearch, FaMapMarkerAlt } from 'react-icons/fa'; // Importing delete icon from react-icons
import { MdEventNote } from 'react-icons/md';
import { OpenStreetMapProvider } from 'leaflet-geosearch'; // Import the provider

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

// Update the IMAGES object with new event creation images
const IMAGES = {
  eventCreation: "https://cdn.dribbble.com/users/1138853/screenshots/4669703/media/9f71363be27b3c7b3ae71d46f8dfd638.gif", // Main animated event planning gif
  eventCreationStatic: "https://img.freepik.com/free-vector/event-planning-illustration_23-2148657518.jpg?w=900&t=st=1709975174~exp=1709975774~hmac=4c3d24e8f6603ab3b4f21b6b18b2b4d5a2f3d6e7", // Fallback static image
  decorationLeft: "https://cdn-icons-png.flaticon.com/512/2784/2784589.png",
  decorationRight: "https://cdn-icons-png.flaticon.com/512/2784/2784589.png",
  partyIcon: "https://cdn-icons-png.flaticon.com/512/3588/3588658.png",
  locationPin: "https://cdn-icons-png.flaticon.com/512/1180/1180058.png",
  calendarIcon: "https://cdn-icons-png.flaticon.com/512/2693/2693507.png",
  budgetIcon: "https://cdn-icons-png.flaticon.com/512/2721/2721091.png",
  guestsIcon: "https://cdn-icons-png.flaticon.com/512/3126/3126647.png",
};

// Updated slider styles
const styles = `
.horizontal-slider {
  width: 100%;
  height: 24px;
  margin: 20px 0;
}

.track {
  position: relative;
  top: 8px;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
}

.track.track-1 {
  position: absolute;
  height: 8px;
  background: linear-gradient(to right, #3B82F6, #8B5CF6);
  border-radius: 4px;
}

.track.track-2 {
  background: #E5E7EB;
}

.thumb {
  top: 1px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  background: #ffffff;
  border: 2px solid #3B82F6;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.thumb:hover {
  box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1);
}

.thumb.active {
  box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2);
}
`;

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState('light'); // 'light' or 'dark'
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
  const [suggestedPackages, setSuggestedPackages] = useState([]);
  const provider = new OpenStreetMapProvider(); // Initialize the provider

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
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const placeName = response.data.display_name;
        setPlaceNames((prev) => ({ ...prev, [eventId]: placeName })); // Store the place name by event ID
      } catch (error) {
        console.error('Error fetching place name:', error);
        if (error.response) {
          // Server responded with a status other than 200
          toast.error(`Error: ${error.response.data.message || 'Failed to fetch place name'}`);
        } else if (error.request) {
          // Request was made but no response received
          // toast.error('Network error: Please check your internet connection.');
        } else {
          // Something happened in setting up the request
          toast.error(`Error: ${error.message}`);
        }
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
    setIsLoading(true);

    if (!userDetails) {
      toast.error("User details not found. Please try again.");
      return;
    }

    const eventPayload = {
      ...eventDetails,
      email: userDetails.email,
      username: userDetails.name,
    };

    try {
      // Save event details
      const response = await fetch(SummaryApi.event_add.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success("Event created successfully!");
        // Navigate to RecommendedEvents with complete event details
        navigate('/recomendated-events', { 
          state: { 
            eventDetails: {
              eventType: eventDetails.eventType,
              occasion: eventDetails.occasion,
              budget: eventDetails.budget,
              guests: eventDetails.guests,
              phoneNumber: eventDetails.phoneNumber,
              date: eventDetails.date,
              location: eventDetails.location,
              username: userDetails.name,
              email: userDetails.email
            }
          }
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('An error occurred while creating the event. Please try again.');
    } finally {
      setIsLoading(false);
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
    if (!searchQuery.trim()) {
      toast.warning("Please enter a location to search");
      return;
    }

    try {
      const results = await provider.search({ query: searchQuery });
      if (results && results.length > 0) {
        setSearchResults(results);
      } else {
        toast.error("No locations found");
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Error searching for location");
      setSearchResults([]);
    }
  };

  const handleLocationSelect = (location) => {
    setEventDetails(prevDetails => ({
      ...prevDetails,
      location: {
        lat: location.y,
        lng: location.x
      }
    }));
    setSearchQuery(location.label);
    setSearchResults([]);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Decorative Elements - adjusted top position */}
      <img 
        src={IMAGES.decorationLeft} 
        className="fixed left-0 top-1/6 w-24 opacity-10 -z-10 transform -translate-x-1/2"
        alt=""
      />
      <img 
        src={IMAGES.decorationRight}
        className="fixed right-0 bottom-1/3 w-24 opacity-10 -z-10 transform translate-x-1/2"
        alt=""
      />

      {/* Adjusted top padding from pt-24 to pt-16 */}
      <div className="w-full max-w-4xl mx-auto pt-16 pb-32 px-4">
        {/* Header Section - reduced bottom margin */}
        <div className="text-center mb-6 relative">
          <div className="flex justify-center mb-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative">
                <img 
                  src={IMAGES.eventCreation} 
                  alt="Event Creation" 
                  className="w-40 h-40 rounded-full shadow-lg border-4 border-white object-cover transform transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = IMAGES.eventCreationStatic;
                  }}
                />
                <div className="absolute -right-4 -bottom-4 flex space-x-2">
                  <img 
                    src={IMAGES.partyIcon}
                    alt="Party"
                    className="w-10 h-10 animate-bounce"
                  />
                  <img 
                    src={IMAGES.calendarIcon}
                    alt="Calendar"
                    className="w-10 h-10 animate-pulse"
                  />
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1 relative">
            Create Your Event
            <span className="absolute -top-6 right-1/4 transform rotate-12 text-2xl">🎉</span>
          </h1>
          <p className="text-gray-600 text-sm mb-2">Plan your perfect event with us</p>
          
          {/* Decorative Line - reduced margin */}
          <div className="relative">
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
            <div className="absolute w-full h-1 top-0 left-0 animate-shimmer bg-gradient-to-r from-transparent via-white to-transparent opacity-30"></div>
          </div>
        </div>

        {/* Main Form - adjusted padding */}
        <div className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur-lg bg-opacity-90 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 pattern-dots pattern-gray-700 pattern-bg-white pattern-size-4"></div>

          <form onSubmit={handleSubmit} className="space-y-6 relative">
            {/* Event Type & Occasion Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="eventType" className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
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
                <label htmlFor="occasion" className={`block text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
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
            </div>

            {/* Guests & Budget Section with Icons */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 font-semibold">
                  <img src={IMAGES.guestsIcon} alt="" className="w-6 h-6" />
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

              {/* Budget Section */}
              <div className="space-y-4 p-6 bg-white rounded-xl shadow-sm">
                <style>{styles}</style>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-700 font-semibold">
                    <img src={IMAGES.budgetIcon} alt="" className="w-6 h-6" />
                    Budget Range (INR)
                  </label>
                  
                  <div className="pt-6 pb-2">
                    {/* Budget Display Cards */}
                    <div className="flex justify-between mb-6">
                      <div className="bg-blue-50 rounded-lg p-3 min-w-[120px]">
                        <p className="text-xs text-blue-600 mb-1">Minimum</p>
                        <p className="text-lg font-semibold text-blue-700">
                          ₹{eventDetails.budget[0].toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 min-w-[120px]">
                        <p className="text-xs text-purple-600 mb-1">Maximum</p>
                        <p className="text-lg font-semibold text-purple-700">
                          ₹{eventDetails.budget[1].toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Slider Container */}
                    <div className="relative px-3 py-4">
                      <Slider
                        className="horizontal-slider"
                        thumbClassName="thumb"
                        trackClassName="track"
                        value={eventDetails.budget}
                        onChange={handleSliderChange}
                        min={5000}
                        max={1000000}
                        step={1000}
                        minDistance={10000}
                        pearling
                      />
                    </div>

                    {/* Budget Markers */}
                    <div className="flex justify-between mt-4 px-2 text-xs text-gray-500">
                      <span>₹5K</span>
                      <span>₹250K</span>
                      <span>₹500K</span>
                      <span>₹750K</span>
                      <span>₹1M</span>
                    </div>

                    {/* Budget Tips */}
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Drag both handles to set your minimum and maximum budget range
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Date Section with Icons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 font-semibold">
                  <img src={IMAGES.guestsIcon} alt="" className="w-6 h-6" />
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

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-700 font-semibold">
                  <img src={IMAGES.calendarIcon} alt="" className="w-6 h-6" />
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

            {/* Location Section */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-gray-700 font-semibold">
                <img src={IMAGES.locationPin} alt="" className="w-6 h-6" />
                Event Location
              </label>
              <div className="relative rounded-xl overflow-hidden shadow-lg border-4 border-white">
                {/* Search Container */}
                <div className="absolute top-4 right-4 z-[1000] w-64">
                  <div className="bg-white rounded-lg shadow-lg">
                    <div className="p-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Search location..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearch();
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleSearch();
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <FaSearch className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                      <div className="border-t border-gray-100 max-h-60 overflow-y-auto">
                        {searchResults.map((result, index) => (
                          <button
                            key={index}
                            onClick={() => handleLocationSelect(result)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 transition-colors
                                     border-b last:border-b-0 border-gray-100 flex items-start gap-2"
                          >
                            <FaMapMarkerAlt className="text-red-500 mt-1 flex-shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {result.label}
                              </span>
                              <span className="text-xs text-gray-500 line-clamp-2">
                                {result.label}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Map Container */}
                <MapContainer
                  center={[eventDetails.location?.lat || 20.5937, eventDetails.location?.lng || 78.9629]}
                  zoom={13}
                  style={{ height: '400px', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker />
                  <MapController center={eventDetails.location} />
                </MapContainer>

                {/* Map Instructions */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-500" />
                    Click on the map to set event location or use the search bar above
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button with Animation */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold 
                         hover:from-blue-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-200
                         flex items-center justify-center gap-2 shadow-lg group"
            >
              <MdEventNote className="text-xl group-hover:rotate-12 transition-transform" />
              Create Event
              <img 
                src={IMAGES.partyIcon} 
                alt="" 
                className="w-6 h-6 group-hover:rotate-12 transition-transform"
              />
            </button>
          </form>
        </div>

        {/* New section to display suggested packages */}
        {suggestedPackages.length > 0 && (
          <div className="suggested-packages">
            <h2 className="text-xl font-semibold">Suggested Packages</h2>
            <ul>
              {suggestedPackages.map((pkg, index) => (
                <li key={index} className="package-item">
                  <h3>{pkg.name}</h3>
                  <p>Price: ₹{pkg.price}</p>
                  <p>Description: {pkg.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateEvent;