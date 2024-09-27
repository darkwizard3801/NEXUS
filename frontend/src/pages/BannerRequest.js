import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify"; // For user notifications
import "react-toastify/dist/ReactToastify.css"; // Import toastify CSS
import SummaryApi from "../common"; // Assuming this is where SummaryApi is defined
import { useNavigate } from "react-router-dom";
import { FaTrash, FaRecycle } from "react-icons/fa"; // Import icons

const BannerRequest = () => {
  const [data, setData] = useState({
    banner: "",
    description: "",
    email: "",
    username: "",
    position: "",
  });

  const [banners, setBanners] = useState([]); // State to hold uploaded banners
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch current user details and banners when the component mounts
  useEffect(() => {
    const fetchUserEmailAndBanners = async () => {
      try {
        const userResponse = await fetch(SummaryApi.current_user.url, {
          method: SummaryApi.current_user.method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const userDetails = await userResponse.json();
        const userEmail = userDetails?.data?.email;
        const username = userDetails?.data?.name;

        if (userEmail && username) {
          setData((prevData) => ({
            ...prevData,
            email: userEmail,
            username: username,
          }));

          // Fetch banners and filter by current user's email
          const bannersResponse = await fetch(SummaryApi.Banner_view.url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const bannersData = await bannersResponse.json();
          if (bannersResponse.ok) {
            // Filter banners where the email matches the current user's email
            const userBanners = bannersData.banners?.filter(
              (banner) => banner.email === userEmail
            ) || [];
            setBanners(userBanners);
          } else {
            toast.error("Failed to fetch banners.");
          }
        } else {
          toast.error("Failed to fetch user details.");
        }
      } catch (error) {
        toast.error(
          "An error occurred while fetching user details or banners."
        );
      }
    };

    fetchUserEmailAndBanners();
  }, []);

  // Function to convert image to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file input and image conversion to Base64
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64Image = await convertToBase64(file);
        setData((prev) => ({
          ...prev,
          banner: base64Image,
        }));
        toast.success("Image uploaded successfully!");
      } catch (error) {
        toast.error("Image upload failed. Please try again.");
      }
    } else {
      toast.error("No file selected.");
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!data.banner || !data.description || !data.position) {
      toast.error(
        "Please upload a banner image, provide a description, and select a position."
      );
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(SummaryApi.Banner_req.url, {
        method: SummaryApi.Banner_req.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Banner request successfully submitted!");
      } else {
        toast.error(result.message || "Failed to submit the banner request.");
      }
    } catch (error) {
      toast.error("An error occurred while submitting the banner request.");
    }
    setLoading(false);
  };

  // Toggle banner status (enable/disable)
  const toggleBannerStatus = async (bannerId, isActive) => {
    try {
      const response = await fetch(
        `${SummaryApi.Banner_tog.url}/${bannerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !isActive }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        // Update the banner status locally
        setBanners((prevBanners) =>
          prevBanners.map((banner) =>
            banner._id === bannerId
              ? { ...banner, isActive: !isActive }
              : banner
          )
        );
        toast.success(
          `Banner ${isActive ? "disabled" : "enabled"} successfully!`
        );
      } else {
        toast.error(result.message || "Failed to toggle the banner status.");
      }
    } catch (error) {
      toast.error("An error occurred while toggling the banner status.");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-200 text-green-800"; // Green box
      case "rejected":
        return "bg-red-200 text-red-800"; // Red box
      case "waitlisted":
        return "bg-white text-gray-800"; // White box
      case "pending":
        return "bg-yellow-200 text-black-800"; // Yellow box
      case "submitted":
        return "bg-blue-500 text-black-800"; // Blue box
      default:
        return ""; // Default style
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Banner Request
      </h2>

      {/* Display uploaded banners */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">Uploaded Banners</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {banners.length > 0 ? (
            banners.map((banner, index) => (
              <div
                key={index}
                className={`relative rounded-lg overflow-hidden shadow-lg ${
                  banner.isActive ? "" : "opacity-50"
                }`} // Grey out disabled banners
              >
                <img
                  src={banner.image}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-auto max-h-60 object-cover"
                />
                <div className="p-4 bg-white">
                  <p className="text-gray-800 text-sm ">
                    {banner.description} 
                  </p>
                  <div className="relative flex justify-center">
                    <p className="text-gray-800 text-md font-semibold">
                      Position:  
                    </p>
                    <p className="px-2">
                      {banner.position}
                    </p>
                  </div>
                  <div
                    className={`mt-2 p-2 text-sm font-medium rounded text-center ${getStatusStyle(
                      banner.status
                    )}`}
                  >
                    {banner.status}
                  </div>

                  {/* Disable/Enable button */}
                  <button
                    className={`mt-4 p-2 rounded-3xl ${
                      banner.isActive ? "bg-red-500" : "bg-green-300"
                    } text-white flex items-center justify-center`}
                    onClick={() =>
                      toggleBannerStatus(banner._id, banner.isActive)
                    } // Using _id
                  >
                    {banner.isActive ? (
                      <>
                        <FaTrash />
                      </>
                    ) : (
                      <>
                        <FaRecycle />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No banners uploaded yet.</p>
          )}
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Banner Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Upload Banner Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
          />
          {data.banner && (
            <img
              src={data.banner}
              alt="Banner Preview"
              className="mt-4 w-full max-h-48 object-cover"
            />
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={data.description}
            onChange={(e) =>
              setData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            rows="3"
            required
          />
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Position
          </label>
          <select
            value={data.position}
            onChange={(e) =>
              setData((prev) => ({ ...prev, position: e.target.value }))
            }
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select Position</option>
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Banner Request"}
        </button>
      </form>

      <ToastContainer 
        position="top-center"  // Set to top-center for centering
        autoClose={3000}       // Auto close after 3 seconds
                // Hide the progress bar
        newestOnTop            // Show newest toasts on top
        closeOnClick           // Close the toast on click
        rtl={false}            // Left-to-right text direction
        pauseOnFocusLoss={false} // Don't pause toast on focus loss
        draggable              // Allow toast dragging
        pauseOnHover           // Pause toast on hover
      />
    </div>
  );
};

export default BannerRequest;
