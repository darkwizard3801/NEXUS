import React, { useEffect, useState } from 'react';
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { toast } from 'react-toastify';
import SummaryApi from '../common';

const BannerProduct = () => {
  const [banners, setBanners] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        // Filter banners where the status is 'approved'
        const approvedBanners = data.banners.filter(banner => banner.status === 'approved' && banner.position === 'top');
        setBanners(approvedBanners); // Set the filtered approved banners
        // toast.success('Banners loaded successfully!');
      } catch (error) {
        setError(error.message);
        // toast.error('Error loading banners');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Automatic transition for banner images
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 3000); // Change image every 5 seconds

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
    return <p>Loading banners...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className='container mx-auto px-4 rounded-xl overflow-hidden'>
      <div className='h-56 md:h-96 w-full bg-slate-200 relative'>
        {/* Buttons for manual image control */}
        <div className='absolute z-10 h-full w-full  items-center hidden md:flex justify-between'>
          <button onClick={prevImage} className='bg-white shadow-md rounded-full p-1'>
            <FaAngleLeft />
          </button>
          <button onClick={nextImage} className='bg-white shadow-md rounded-full p-1'>
            <FaAngleRight />
          </button>
        </div>

        {/* Banner images rendering with transition */}
        <div className='relative h-[40rem] w-full overflow-hidden  flex justify-center items-center '>
          {banners.map((banner, index) => (
            <div
              key={banner.id || index}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out
                ${currentImage === index ? 'opacity-100' : 'opacity-0'}`}
              style={{ transition: 'opacity 1s ease-in-out' }}
            >
              <img src={banner.image} alt={banner.description} className='w-full h-96 object-cover' />
            </div>
          ))}
        </div>

        {/* Dots container */}
        <div className='absolute bottom-2 flex justify-center w-full'>
          {renderDots()}
        </div>
      </div>
    </div>
  );
};

export default BannerProduct;
