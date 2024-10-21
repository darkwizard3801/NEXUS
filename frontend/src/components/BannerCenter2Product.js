import React, { useEffect, useState } from 'react';
import SummaryApi from '../common';

const BannerCenter1Product = () => {
  const [banners, setBanners] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const center1Banners = data.banners.filter(banner => banner.status === 'approved' && banner.position === 'center-2');
        setBanners(center1Banners);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (banners.length > 0) {
        setCurrentImage((prevImage) => (prevImage + 1) % banners.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading) return <p>Loading banners...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto px-4 rounded-xl overflow-hidden">
      <div className="h-80 md:h-[40rem] w-full bg-slate-200 relative">
        {banners.length > 0 ? (
          <div className="relative h-full w-full overflow-hidden flex justify-center items-center">
            {banners.map((banner, index) => (
              <div
                key={banner.id || index}
                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out
                  ${currentImage === index ? 'opacity-100' : 'opacity-0'}`}
                style={{ transition: 'opacity 1s ease-in-out' }}
              >
                <img
                  src={banner.image}
                  alt={banner.description}
                  className="w-full h-full object-cover rounded-lg md:object-contain" // Adjusted for responsiveness
                  loading="lazy" // Lazy load images
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full bg-white">
            <p className="text-gray-500">Your Ad Goes Here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerCenter1Product;
