import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import { FaUserCircle } from 'react-icons/fa';

const MYProfile = () => {
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    profilePic: '',
    phoneNumber: '',
    additionalPhoneNumber: '',
    licenseNumber: '', // Add license number to the state
    houseFlat: '',
    street: '',
    postOffice: '',
    district: '',
    state: '',
    zipCode: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [role, setRole] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

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
        licenseNumber: result.data.licenseNumber || '', // Set license number if exists
        houseFlat: result.data.houseFlat || '',
        street: result.data.street || '',
        postOffice: result.data.postOffice || '',
        district: result.data.district || '',
        state: result.data.state || '',
        zipCode: result.data.zipCode || '',
      });

      setRole(result.data.role || '');
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

  const handleProfilePicChange = (e) => {
    if (e.target.files[0]) {
      setNewProfilePic(e.target.files[0]); // Store the selected file
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
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
      // Encode the profile picture if it exists
      if (newProfilePic) {
        const encodedPic = await convertToBase64(newProfilePic);
        setUserDetails((prevDetails) => ({
          ...prevDetails,
          profilePic: encodedPic, // Update the profile picture in userDetails
        }));
      }
  
      // Send userDetails to the backend
      const response = await fetch(SummaryApi.update_user.url, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDetails), // Send the userDetails as JSON
      });
  
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
  
      toast.success('Profile updated successfully!');
      
      // Reload the page after successful update
      fetchUserDetails()
      
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-md rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-center mb-6">My Profile</h2>

        <div className="mb-4 flex items-center justify-center">
          <label className="cursor-pointer">
            {/* Display new profile picture if selected, otherwise show current profile picture */}
            {newProfilePic ? (
              <img
                src={URL.createObjectURL(newProfilePic)} // Use createObjectURL for the selected image
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
              onChange={handleProfilePicChange}
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
                value={userDetails.name} // Bind the value to the state
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
                value={userDetails.email} // Bind the value to the state
                onChange={handleChange}
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
              value={userDetails.phoneNumber} // Bind the value to the state
              onChange={handleChange}
              className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              maxLength={10}
            />
            {phoneError && <p className="text-red-500">{phoneError}</p>}
          </div>

          {role === 'Vendor' && (
            <>
              <div>
                <label className="block font-semibold">Additional Phone Number (optional)</label>
                <input
                  type="number"
                  name="additionalPhoneNumber"
                  value={userDetails.additionalPhoneNumber} // Bind the value to the state
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
                  value={userDetails.licenseNumber} // Bind the value to the state
                  onChange={handleChange}
                  className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">House/Flat Name or Number</label>
              <input
                type="text"
                name="houseFlat"
                value={userDetails.houseFlat} // Bind the value to the state
                onChange={handleChange}
                className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block font-semibold">Street</label>
              <input
                type="text"
                name="street"
                value={userDetails.street} // Bind the value to the state
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
                value={userDetails.postOffice} // Bind the value to the state
                onChange={handleChange}
                className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block font-semibold">District</label>
              <input
                type="text"
                name="district"
                value={userDetails.district} // Bind the value to the state
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
                value={userDetails.state} // Bind the value to the state
                onChange={handleChange}
                className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block font-semibold">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={userDetails.zipCode} // Bind the value to the state
                onChange={handleChange}
                className="w-full border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                maxLength={6}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600 transition duration-200"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MYProfile;
