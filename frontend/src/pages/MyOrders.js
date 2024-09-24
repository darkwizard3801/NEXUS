import React from 'react';
import { FaSpinner } from 'react-icons/fa'; // Importing the spinner icon from react-icons

const MyOrders = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <FaSpinner className="animate-spin text-4xl mb-4 text-blue-600" /> {/* Animated spinner icon */}
      <h2 className="text-lg text-gray-700">
        Work on progress on this page ...
      </h2>
    </div>
  );
}

export default MyOrders;
