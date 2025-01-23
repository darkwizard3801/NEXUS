import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SummaryApi from '../common'; // Ensure this is the correct path to your API
import AdminProductCard from '../components/AdminProductCard'; // Component to display individual product
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6"; // Import icons for navigation

const VendorPage = () => {
  const { vendorName } = useParams(); // Get the vendor name from the URL
  const [products, setProducts] = useState([]); // State to store all products
  const [filteredProducts, setFilteredProducts] = useState([]); // State to store filtered products
  const [loading, setLoading] = useState(true); // Loading state
  const [vendorEmail, setVendorEmail] = useState(""); // State to store vendor email
  const [banners, setBanners] = useState([]); // State to store banners
  const [loadingBanners, setLoadingBanners] = useState(true); // Loading state for banners
  const [error, setError] = useState(""); // State to store error messages
  const [currentImage, setCurrentImage] = useState(0); // State for current banner image

  // Fetch all products from the database
  const fetchAllProducts = async () => {
    try {
      const response = await fetch(SummaryApi.allProduct.url);
      const dataResponse = await response.json();
      console.log('Fetched products:', dataResponse);

      // Set all products and filter them based on the vendor name
      setProducts(dataResponse?.data || []);
      const vendorProducts = dataResponse?.data?.filter(product => product.brandName === vendorName); // Assuming brandName is the vendor name
      setFilteredProducts(vendorProducts || []);

      // Set vendor email from the first filtered product
      if (vendorProducts.length > 0) {
        setVendorEmail(vendorProducts[0].user); // Assuming vendorEmail is a property in the product
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all banners from the database
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
      console.log("data",data);
      // Filter banners where the status is 'approved' and the vendor email matches
      const approvedBanners = data.banners.filter(banner => 
       banner.status === 'approved'  && banner.email === vendorEmail
      );
      setBanners(approvedBanners);
      console.log("filtered banners",approvedBanners); // Set the filtered approved banners
    } catch (error) {
      setError(error.message);
      console.error('Error loading banners:', error);
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    fetchAllProducts(); // Fetch products when the component mounts
    fetchBanners(); // Fetch banners when the component mounts
  }, [vendorName]); // Re-fetch if vendorName changes

  // Automatic transition for banner images
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [currentImage, banners.length]);

  const nextImage = () => {
    if (banners.length - 1 > currentImage) {
      setCurrentImage(prev => prev + 1);
    } else {
      setCurrentImage(0); // Reset to first image
    }
  };

  const prevImage = () => {
    if (currentImage !== 0) {
      setCurrentImage(prev => prev - 1);
    } else {
      setCurrentImage(banners.length - 1); // Go to last image
    }
  };

  const renderDots = () => {
    return banners.map((_, index) => (
      <span
        key={index}
        className={`h-2 w-2 rounded-full mx-1 cursor-pointer transition-all duration-300 ease-in-out
          ${currentImage === index ? 'bg-white scale-125' : 'bg-white opacity-50'}`}
        onClick={() => setCurrentImage(index)}
      />
    ));
  };

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to {vendorName}'s Store</h1>
      {vendorEmail && (
        <p className="text-lg mb-4">Vendor Email: <a href={`mailto:${vendorEmail}`} className="text-blue-500">{vendorEmail}</a></p>
      )}
      
      {/* Banner Section */}
      {loadingBanners ? (
        <p>Loading banners...</p>
      ) : (
        <>
          {banners.length > 0 ? (
            <div className='relative h-56 md:h-96 w-full bg-slate-200 rounded-xl overflow-hidden'>
              {/* Buttons for manual image control */}
              <div className='absolute z-10 h-full w-full items-center hidden md:flex justify-between'>
                <button onClick={prevImage} className='bg-white shadow-md rounded-full p-1'>
                  <FaAngleLeft />
                </button>
                <button onClick={nextImage} className='bg-white shadow-md rounded-full p-1'>
                  <FaAngleRight />
                </button>
              </div>

              {/* Banner images rendering with transition */}
              <div className='relative h-full w-full overflow-hidden flex justify-center items-center'>
                {banners.map((banner, index) => (
                  <div
                    key={banner.id || index}
                    className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out
                      ${currentImage === index ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transition: 'opacity 1s ease-in-out' }}
                  >
                    <img src={banner.image} alt={banner.description} className='w-full h-full object-cover' />
                  </div>
                ))}
              </div>

              {/* Dots container */}
              <div className='absolute bottom-2 flex justify-center w-full'>
                {renderDots()}
              </div>
            </div>
          ) : (
            <p>No banners available.</p>
          )}
        </>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <AdminProductCard data={product} key={index} />
          ))
        ) : (
          <p>No products found for this vendor.</p>
        )}
      </div>
    </div>
  );
};

export default VendorPage;