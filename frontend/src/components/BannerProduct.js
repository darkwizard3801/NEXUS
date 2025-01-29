import React, { useEffect, useState } from 'react';
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { toast } from 'react-toastify';
import SummaryApi from '../common';

const BannerProduct = () => {
  const [banners, setBanners] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
        console.log(approvedBanners);
      } catch (error) {
        setError(error.message);
        // toast.error('Error loading banners');
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Initialize typewriter effect after banners are loaded
  useEffect(() => {
    if (banners.length > 0 && isInitialLoad) {
      setDisplayText('');
      setIsTypingComplete(false);
      setIsInitialLoad(false);
    }
  }, [banners, isInitialLoad]);

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500); // Cursor blinks every 500ms

    return () => clearInterval(cursorInterval);
  }, []);

  // Slower typewriter effect
  useEffect(() => {
    if (banners.length === 0) return;
    
    setDisplayText('');
    setIsTypingComplete(false);
    
    const currentText = banners[currentImage]?.description || '';
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < currentText.length) {
        setDisplayText(prev => prev + currentText[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingComplete(true);
      }
    }, 200); // Slowed down typing speed to 200ms

    return () => clearInterval(typingInterval);
  }, [currentImage, banners]);

  // Automatic transition only after typing completes
  useEffect(() => {
    if (!isTypingComplete) return;

    const transitionTimeout = setTimeout(() => {
      nextImage();
    }, 3000); // 3 seconds delay after typing completes

    return () => clearTimeout(transitionTimeout);
  }, [isTypingComplete]);

  const nextImage = () => {
    if (banners.length - 1 > currentImage) {
      setCurrentImage(prev => prev + 1);
    } else {
      setCurrentImage(0);
    }
  };

  const prevImage = () => {
    if (currentImage !== 0) {
      setCurrentImage(prev => prev - 1);
    } else {
      setCurrentImage(banners.length - 1);
    }
  };

  // Reset typing when manually changing images
  const handleManualNext = () => {
    setIsTypingComplete(false);
    setDisplayText('');
    nextImage();
  };

  const handleManualPrev = () => {
    setIsTypingComplete(false);
    setDisplayText('');
    prevImage();
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
        {/* Buttons for manual image control - Updated z-index and styling */}
        <div className='absolute z-20 h-full w-full items-center hidden md:flex justify-between px-4'>
          <button onClick={handleManualPrev} className='bg-white shadow-md rounded-full p-1 hover:bg-yellow-500 hover:text-white transition-all duration-300'>
            <FaAngleLeft />
          </button>
          <button onClick={handleManualNext} className='bg-white shadow-md rounded-full p-1 hover:bg-yellow-500 hover:text-white transition-all duration-300'>
            <FaAngleRight />
          </button>
        </div>

        {/* Banner images rendering with transition */}
        <div className='relative h-[40rem] w-full overflow-hidden flex justify-center items-center'>
          {banners.map((banner, index) => (
            <div
              key={banner.id || index}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out
                ${currentImage === index ? 'opacity-100' : 'opacity-0'}`}
              style={{ transition: 'opacity 1s ease-in-out' }}
            >
              {/* Black overlay */}
              <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
              
              {/* Banner Description and Button */}
              <div className="absolute inset-y-0 right-0 z-20 flex flex-col items-end justify-start pt-20 w-2/3 pr-40">
                <p className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                  {currentImage === index && (
                    <>
                      <span className="text-yellow-500">
                        {banner.description.charAt(0)}
                      </span>
                      {banner.description.slice(1)}
                      {isTypingComplete ? (
                        <span className="text-blue-500">.</span>
                      ) : (
                        <span className={`inline-block ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>|</span>
                      )}
                    </>
                  )}
                </p>
                
                {/* Explore Now Button with hover animations */}
                {currentImage === index && (
                  <button 
                    className="mt-8 px-8 py-4 bg-yellow-500 text-black font-bold text-xl rounded-full
                      relative overflow-hidden group transition-all duration-300 ease-in-out
                      hover:shadow-[0_8px_25px_rgba(255,200,0,0.4)] hover:scale-105
                      before:absolute before:top-0 before:left-0 before:w-full before:h-full
                      before:bg-white before:opacity-0 before:transition-opacity before:duration-300
                      hover:before:opacity-20"
                    onClick={() => {
                      console.log('Explore Now clicked for banner:', banner.id);
                    }}
                  >
                    <span className="relative z-10 group-hover:tracking-wider transition-all duration-300">
                      Explore Now
                    </span>
                  </button>
                )}
              </div>
              
              <img 
                src={banner.image} 
                alt={banner.description} 
                className='w-full h-96 object-cover relative z-0' 
              />
            </div>
          ))}
        </div>

        {/* Dots container */}
        <div className='absolute bottom-2 flex justify-center w-full z-20'>
          {renderDots()}
        </div>
      </div>
    </div>
  );
};

export default BannerProduct;
