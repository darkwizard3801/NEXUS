import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-lg transform transition-all scale-100 hover:scale-105 duration-300 animate__animated animate__fadeIn">
        <img 
          src="https://media.giphy.com/media/3oEjI6SIIHBdRxX6mI/giphy.gif" 
          alt="Loading" 
          className="w-16 h-16 mb-4 mx-auto" 
        /> {/* Added GIF */}
        <h2 className="text-lg font-semibold text-center">Generate Poster</h2>
        <p className="text-center">Do you want to generate a poster for the event for free?</p>
        <div className="mt-4 flex justify-end">
          <button 
            className="bg-red-600 text-white px-4 py-2 rounded mr-2 hover:bg-red-700 transition transform hover:scale-105"
            onClick={onConfirm} // Redirect to social media
          >
            Yes
          </button>
          <button 
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition transform hover:scale-105"
            onClick={onClose} // Close modal and proceed with payment
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;