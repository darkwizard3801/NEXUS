import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SummaryApi from '../common'; // Assuming SummaryApi is in the same folder

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dropdownStatus, setDropdownStatus] = useState({}); // Tracks dropdown state for each banner

  // Fetch banners from the database
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(SummaryApi.Banner_view.url, {
          method: SummaryApi.Banner_view.method,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch banners');
        }

        const data = await response.json();
        const activeBanners = data.banners.filter(banner => banner.isActive === true);
        setBanners(activeBanners); // Set the filtered active banners
        toast.success('Banners loaded successfully!');
      } catch (error) {
        setError(error.message);
        toast.error('Error loading banners');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []); // Empty dependency array ensures it runs once on mount

  const toggleDropdown = (id) => {
    setDropdownStatus((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the dropdown visibility for the clicked banner
    }));
  };

  const updateBannerStatus = async (id, newStatus) => {
    try {
      // Make an API call to update the status in the backend
      const response = await fetch(`${SummaryApi.Banner_status.url}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }), // Send new status to backend
      });
      
      if (!response.ok) {
        throw new Error('Failed to update banner status');
      }

      // Update the status in the UI after success
      const updatedBanners = banners.map((banner) =>
        banner._id === id ? { ...banner, status: newStatus } : banner
      );
      setBanners(updatedBanners);
      setDropdownStatus((prev) => ({ ...prev, [id]: false })); // Close the dropdown

      toast.success(`Banner status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update banner status', error);
      toast.error('Error updating banner status');
    }
  };

  const getButtonColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-400'; // Green for approved
      case 'submitted':
        return 'bg-blue-400'; // Blue for submitted
      case 'whitelisted':
        return 'bg-gray-400'; // Gray for whitelisted
      case 'pending':
        return 'bg-yellow-400'; // Yellow for pending
      case 'rejected':
        return 'bg-red-600'; // Red for rejected
      default:
        return 'bg-gray-300'; // Default color if status is unknown
    }
  };

  if (loading) {
    return <div>Loading banners...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Center the toast notifications */}
      <ToastContainer 
        position="top-center"  // Set to top-center for centering
        autoClose={3000}       // Auto close after 3 seconds
        // hideProgressBar        // Hide the progress bar
        newestOnTop            // Show newest toasts on top
        closeOnClick           // Close the toast on click
        rtl={false}            // Left-to-right text direction
        pauseOnFocusLoss={false} // Don't pause toast on focus loss
        draggable              // Allow toast dragging
        pauseOnHover           // Pause toast on hover
      />
      
      <h1 className="text-center text-3xl font-bold my-4">Banners</h1>
      <div className="banners-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {banners.length > 0 ? (
          banners.map((banner) => (
            <div key={banner._id} className="banner-item bg-white shadow-lg rounded-lg p-4">
              <div className="banner-image-container">
                <img src={banner.image} alt={banner.description} className="banner-image object-cover w-full h-40 rounded-lg" />
              </div>
              <div className="banner-content mt-4 text-center">
                <p className="font-semibold">{banner.description}</p>
                <p className="text-sm text-black-600 font-bold">Uploaded by: {banner.username}</p>
                <p className="font-semibold capitalize">Position: {banner.position}</p>
                <p className="text-sm text-black-600 font-semibold">Email: {banner.email}</p>

                {/* Status Button */}
                <div className="relative py-2">
                  <button 
                    onClick={() => toggleDropdown(banner._id)} 
                    className={`mx-auto rounded-3xl w-40 ${getButtonColor(banner.status)}`} // Dynamic button color
                  >
                    <p className="font-semibold capitalize">{banner.status}</p> {/* Show the current status */}
                  </button>

                  {/* Dropdown for changing status */}
                  {dropdownStatus[banner._id] && (
                    <div className="absolute mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      <ul>
                        {['pending', 'rejected', 'whitelisted', 'approved', 'submitted'].map((option) => (
                          <li
                            key={option}
                            className="cursor-pointer px-4 py-2 hover:bg-gray-200"
                            onClick={() => updateBannerStatus(banner._id, option)}
                          >
                            {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No active banners found</p>
        )}
      </div>
    </div>
  );
};

export default Banners;
