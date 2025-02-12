import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import { FaUserCircle } from 'react-icons/fa';
import imageTobase64 from '../helpers/imageTobase64'; // Import the helper function
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MYProfile = () => {
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    profilePic: '',
    phoneNumber: '',
    additionalPhoneNumber: '',
    licenseNumber: '',
    houseFlat: '',
    street: '',
    postOffice: '',
    district: '',
    state: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    locationName: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [role, setRole] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [position, setPosition] = useState([10.8505, 76.2711]); // Default to Kerala coordinates
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const provider = new OpenStreetMapProvider();

  // Fetch user details from the server
  const fetchUserDetails = async () => {
    try {
      const userResponse = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user details. Please login.');
      }

      const result = await userResponse.json();

      setUserDetails({
        name: result.data.name || '',
        email: result.data.email || '',
        profilePic: result.data.profilePic || '',
        phoneNumber: result.data.phoneNumber || '',
        additionalPhoneNumber: result.data.additionalPhoneNumber || '',
        licenseNumber: result.data.licenseNumber || '',
        houseFlat: result.data.houseFlat || '',
        street: result.data.street || '',
        postOffice: result.data.postOffice || '',
        district: result.data.district || '',
        state: result.data.state || '',
        zipCode: result.data.zipCode || '',
        latitude: result.data.latitude || '',
        longitude: result.data.longitude || '',
        locationName: result.data.locationName || '',
      });

      setRole(result.data.role || '');

      if (result.data.latitude && result.data.longitude) {
        setPosition([result.data.latitude, result.data.longitude]);
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails(); // Fetch user details on component mount
  }, []);

  const handleChange = (e) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === 'email') {
      const isValid = validateEmail(e.target.value);
      setEmailError(isValid ? '' : 'Please enter a valid email address.');
    }

    if (e.target.name === 'phoneNumber') {
      const isValidPhone = isValidPhoneNumber(e.target.value);
      setPhoneError(isValidPhone ? '' : 'Please enter a valid 10-digit phone number.');
    }
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.(in|co\.in|com|org|edu|biz|gov|net)$/;
    return re.test(String(email).toLowerCase());
  };

  const isValidPhoneNumber = (number) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(number);
  };

  const handleUploadPic = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imagePic = await imageTobase64(file);
      setNewProfilePic(imagePic); // Update the newProfilePic state
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(userDetails.email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (!isValidPhoneNumber(userDetails.phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      // Include the new profile picture and location data
      const updatedUserDetails = {
        ...userDetails,
        profilePic: newProfilePic || userDetails.profilePic,
        latitude: position[0],  // Ensure we're using the latest position
        longitude: position[1], // from the map marker
        locationName: userDetails.locationName,
      };

      console.log('Sending updated user details:', updatedUserDetails); // For debugging

      const response = await fetch(SummaryApi.update_user.url, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserDetails),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      
      // Refetch user details to update the display
      await fetchUserDetails();
      
      // Optional: Reload the page after a delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      toast.error(error.message);
      console.error('Error updating profile:', error);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      const results = await provider.search({ query });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleLocationSelect = (result) => {
    const newPosition = [result.y, result.x];
    setPosition(newPosition);
    setUserDetails({
      ...userDetails,
      latitude: result.y,
      longitude: result.x,
      locationName: result.label,
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  // Add this new component for the search control
  const SearchControl = () => {
    const map = useMap();
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const provider = new OpenStreetMapProvider();
    
    const handleSearch = async (e) => {
      const query = e.target.value;
      setSearchValue(query);
      
      if (query.length > 2) {
        const results = await provider.search({ query });
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };

    const handleResultClick = (result) => {
      const newPosition = [result.y, result.x];
      map.setView(newPosition, 13);
      setSearchValue(result.label);
      setSearchResults([]);
      // Update the parent component's state
      setPosition(newPosition);
      setUserDetails(prev => ({
        ...prev,
        latitude: result.y,
        longitude: result.x,
        locationName: result.label,
      }));
    };

    return (
      <div className="leaflet-top leaflet-right" style={{ zIndex: 1000 }}>
        <div className="leaflet-control p-3" style={{ minWidth: '320px' }}>
          <div className={`
            relative transition-all duration-200
            ${isFocused ? 'transform -translate-y-1' : ''}
          `}>
            <div className={`
              relative bg-white rounded-lg shadow-lg
              ${isFocused ? 'ring-2 ring-blue-400 shadow-xl' : 'hover:shadow-xl'}
              transition-all duration-200
            `}>
              <input
                type="text"
                value={searchValue}
                onChange={handleSearch}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                placeholder="Search location..."
                className={`
                  w-full p-3 pl-10 rounded-lg
                  bg-white text-gray-700
                  placeholder-gray-400
                  focus:outline-none
                  transition-all duration-200
                `}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className={`
                absolute w-full mt-2 
                bg-white rounded-lg shadow-xl 
                max-h-[200px] overflow-y-auto
                border border-gray-100
                transition-all duration-200
                scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
              `}>
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className={`
                      p-3 cursor-pointer
                      hover:bg-blue-50 
                      transition-colors duration-150
                      flex items-center gap-2
                      ${index !== searchResults.length - 1 ? 'border-b border-gray-100' : ''}
                    `}
                    onClick={() => handleResultClick(result)}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 text-gray-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                      />
                    </svg>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700">
                        {result.label.split(',')[0]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {result.label.split(',').slice(1).join(',')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Update your existing MapComponent
  const MapComponent = () => {
    const map = useMap();
    
    useEffect(() => {
      map.setView(position, 13);
    }, [position]);

    return <SearchControl />;
  };

  // Update your mapSection const to include some additional styling
  const mapSection = (
    <div className="mb-6">
      <label className="block font-semibold mb-2">Business Location</label>
      <div className="h-[400px] rounded-xl overflow-hidden border relative">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker 
            position={position}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                setPosition([position.lat, position.lng]);
                setUserDetails(prev => ({
                  ...prev,
                  latitude: position.lat,
                  longitude: position.lng,
                }));
              },
            }}
          />
          <MapComponent />
        </MapContainer>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Search for a location or drag the marker to pin your exact location
      </p>
    </div>
  );

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-10 p-6">
      <div className="bg-white shadow-md rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-center mb-6">My Profile</h2>

        <div className="mb-4 flex items-center justify-center">
          <label className="cursor-pointer">
            {newProfilePic ? (
              <img
                src={newProfilePic}
                alt="New Profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
              />
            ) : userDetails.profilePic ? (
              <img
                src={userDetails.profilePic}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
              />
            ) : (
              <FaUserCircle className="w-32 h-32 text-gray-400" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadPic}
              className="hidden"
            />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Name</label>
              <input
                type="text"
                name="name"
                value={userDetails.name}
                onChange={handleChange}
                className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block font-semibold">Email</label>
              <input
                type="email"
                name="email"
                value={userDetails.email}
                onChange={handleChange}
                readOnly
                className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              {emailError && <p className="text-red-500">{emailError}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold">Phone Number</label>
            <input
              type="number"
              name="phoneNumber"
              value={userDetails.phoneNumber}
              onChange={handleChange}
              className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              maxLength={10}
            />
            {phoneError && <p className="text-red-500">{phoneError}</p>}
          </div>

          {role === 'Vendor' ? (
            <>
              <div>
                <label className="block font-semibold">Additional Phone Number (optional)</label>
                <input
                  type="number"
                  name="additionalPhoneNumber"
                  value={userDetails.additionalPhoneNumber}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block font-semibold">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={userDetails.licenseNumber}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold">House/Shop Number</label>
                  <input
                    type="text"
                    name="houseFlat"
                    value={userDetails.houseFlat}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold">Street</label>
                  <input
                    type="text"
                    name="street"
                    value={userDetails.street}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              {mapSection}
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold">House/Flat</label>
                  <input
                    type="text"
                    name="houseFlat"
                    value={userDetails.houseFlat}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold">Street</label>
                  <input
                    type="text"
                    name="street"
                    value={userDetails.street}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold">Post Office</label>
                  <input
                    type="text"
                    name="postOffice"
                    value={userDetails.postOffice}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold">District</label>
                  <input
                    type="text"
                    name="district"
                    value={userDetails.district}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold">State</label>
                  <input
                    type="text"
                    name="state"
                    value={userDetails.state}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={userDetails.zipCode}
                    onChange={handleChange}
                    className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default MYProfile;
