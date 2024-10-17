import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const [showText, setShowText] = useState(false);
  const [gifError, setGifError] = useState(false);
  const [animationPlayed, setAnimationPlayed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
      setAnimationPlayed(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleGifError = () => {
    console.error("GIF failed to load");
    setGifError(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="w-80 mb-6 relative">
        {!gifError && !animationPlayed ? (
          <div className="relative overflow-hidden" style={{ backgroundColor: '#f3f4f6' }}>
            <img 
              src="https://res.cloudinary.com/du8ogkcns/image/upload/v1729081394/output-onlinegiftools_1_tiu6yn.gif" 
              alt="Order Placed Animation" 
              className="w-full h-auto relative z-10"
              onError={handleGifError}
              style={{ mixBlendMode: 'multiply' }}
            />
            <div className="absolute inset-0 bg-gray-100 z-0"></div>
          </div>
        ) : (
          <img 
            src="https://res.cloudinary.com/du8ogkcns/image/upload/v1729091711/WhatsApp_Image_2024-10-16_at_20.39.27_946239f6_ewsshf.jpg" 
            alt="Order Placed" 
            className="w-full h-auto"
          />
        )}
        {showText && (
          <div className="text-center text-2xl font-bold text-green-600 mt-4">
            Order Placed!
          </div>
        )}
      </div>
      <p className="text-center mb-6 px-4">
        Your order has been successfully placed. To view your order, go to your order section in your profile.
      </p>
      <button
        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        onClick={() => navigate('/')}
      >
        Return to Home
      </button>
    </div>
  );
};

export default PaymentSuccess;
