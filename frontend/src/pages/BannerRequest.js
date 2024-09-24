import React, { useState, useEffect } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai'; // Importing a cloud upload icon
import imageTobase64 from '../helpers/imageTobase64'; // Import the helper function
import SummaryApi from '../common';

const BannerRequest = () => {
  const [banner, setBanner] = useState(null);
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [bannerBase64, setBannerBase64] = useState('');

  useEffect(() => {
    // Fetch the current user summary
    fetch(SummaryApi.current_user.url)
      .then((response) => response.json())
      .then((data) => {
        setEmail(data.email);
        setUsername(data.username);
      })
      .catch((error) => {
        console.error('Error fetching user summary:', error);
      });
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setBanner(file);

    const base64 = await imageTobase64(file);
    setBannerBase64(base64);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      banner: bannerBase64,
      description,
      email,
      username,
    };

    fetch(SummaryApi.Banner_req.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        // Optionally, you can add code here to handle the response, e.g., show a success message or redirect the user
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-4">Request a Banner</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="banner" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Banner Image
            </label>
            <div 
              className="flex flex-col items-center border border-gray-300 rounded-md shadow-sm cursor-pointer hover:border-blue-500 transition duration-200"
              onClick={() => document.getElementById('banner').click()} // Trigger file input click
            >
              <input
                type="file"
                id="banner"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <AiOutlineCloudUpload className="w-12 h-5 text-gray-400 mb-2" />
              <span className="text-gray-500">
                {banner ? 'File selected' : 'No file chosen'}
              </span>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500 p-2"
              rows="4"
              placeholder="Enter a description for the banner"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default BannerRequest;
