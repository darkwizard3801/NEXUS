import React, { useEffect, useState } from 'react';
import image1 from '../assest/banner/img1.jpg';
import image2 from '../assest/banner/img2.jpg';
import image3 from '../assest/banner/img3.jpg';
import image4 from '../assest/banner/img4.jpg';
import image5 from '../assest/banner/img5.jpg';

import image1Mobile from '../assest/banner/img1_mobile.jpg';
import image2Mobile from '../assest/banner/img2_mobile.webp';
import image3Mobile from '../assest/banner/img3_mobile.jpg';
import image4Mobile from '../assest/banner/img4_mobile.jpg';
import image5Mobile from '../assest/banner/img5_mobile.png';

import { FaAngleRight } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";

const BannerProduct = () => {
  const [currentImage, setCurrentImage] = useState(0);

  const desktopImages = [
    image1,
    image2,
    image3,
    image4,
    image5
  ];

  const mobileImages = [
    image1Mobile,
    image2Mobile,
    image3Mobile,
    image4Mobile,
    image5Mobile
  ];

  const nextImage = () => {
    if (desktopImages.length - 1 > currentImage) {
      setCurrentImage(prev => prev + 1);
    } else {
      setCurrentImage(0); // Reset to first image
    }
  };

  const prevImage = () => {
    if (currentImage !== 0) {
      setCurrentImage(prev => prev - 1);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 5000); // Adjust interval as needed

    return () => clearInterval(interval);
  }, [currentImage]);

  const renderDots = () => {
    return desktopImages.map((_, index) => (
      <span
        key={index}
        className={`h-2 w-2 rounded-full mx-1 cursor-pointer transition-all duration-300 ease-in-out
          ${currentImage === index ? 'bg-white scale-125' : 'bg-white opacity-50'}`}
        onClick={() => setCurrentImage(index)}
      />
    ));
  };

  return (
    <div className='container mx-auto px-4 rounded-xl overflow-hidden'>
      <div className='h-56 md:h-96 w-full bg-slate-200 relative'>
        <div className='absolute z-10 h-full w-full flex items-center hidden md:flex justify-between'>
          <button onClick={prevImage} className='bg-white shadow-md rounded-full p-1'>
            <FaAngleLeft />
          </button>
          <button onClick={nextImage} className='bg-white shadow-md rounded-full p-1'>
            <FaAngleRight />
          </button>
        </div>

        {/* Desktop and tablet version */}
        <div className='hidden md:flex h-full w-full overflow-hidden'>
          {desktopImages.map((imageURL, index) => (
            <div
              className='w-full h-full min-w-full min-h-full transition-all'
              key={imageURL}
              style={{ transform: `translateX(-${currentImage * 100}%)` }}
            >
              <img src={imageURL} className='w-full h-full' />
            </div>
          ))}
        </div>

        {/* Mobile version */}
        <div className='flex h-full w-full overflow-hidden md:hidden'>
          {mobileImages.map((imageURL, index) => (
            <div
              className='w-full h-full min-w-full min-h-full transition-all'
              key={imageURL}
              style={{ transform: `translateX(-${currentImage * 100}%)` }}
            >
              <img src={imageURL} className='w-full h-full object-cover' />
            </div>
          ))}
        </div>

        {/* Dots container (positioned absolutely at the bottom) */}
        <div className='absolute bottom-2 flex justify-center w-full'>
          {renderDots()}
        </div>
      </div>
    </div>
  );
};

export default BannerProduct;
