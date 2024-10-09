import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SummaryApi from '../common';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa'; // Importing delete icon from react-icons

// Custom red location icon setup


const MyEvents = () => {
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
  // Fetch user details and their events
 

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

 

 
  const handleDelete = async (eventId) => {
    // Show a confirmation alert
    const isConfirmed = window.confirm('Are you sure you want to cancel this event?');
  
    // Proceed only if the user confirms
    if (!isConfirmed) {
      return; // If the user clicks "Cancel", do nothing
    }
  
    // Proceed with canceling the event if confirmed
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
      // Optionally, show a toast notification or alert to inform the user
    }
  };
  
  


  
 

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-4xl">
       
        {/* Display user's events */}
        <div className="mb-8 max-w-7xl mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-center">Your Created Events</h3>
      {userEvents.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
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

    </div>
    </div>
  );
};

export default MyEvents;