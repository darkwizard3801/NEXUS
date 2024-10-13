import React, { useState } from 'react';
import { FaAd } from "react-icons/fa";
import displayINRCurrency from '../helpers/displayCurrency';
import { toast } from 'react-toastify'; // Import toast for notifications
import SummaryApi from '../common/index';

const SponseredAdd = ({ data, fetchdata }) => {
  const [isDisabled] = useState(data.disabled); // Track disabled state
  const [isSponsored, setIsSponsored] = useState(data.sponsor);
  // Log the sponsor status for debugging
  console.log('Sponsor Status:', data.sponsor);

  if (isDisabled) {
    return null; // Do not render anything if the product is disabled
  }

  // Function to handle the sponsor status update
  const handleSponsorClick = async () => {
    try {
      const response = await fetch(`${SummaryApi.sponser.url}/${data._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sponsor: true }), // Update the sponsor status to true
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Product is now sponsored!');
        setIsSponsored(true);
        fetchdata(); // Refresh the data to reflect the change
      } else {
        toast.error(result.message || 'Failed to update sponsor status');
      }
    } catch (error) {
      toast.error('An error occurred while updating sponsor status.');
      console.error('Error updating sponsor status:', error);
    }
  };

  return (
    <div className={`bg-white p-4 rounded ${data.isSponsored ? 'bg-green-200' : ''}`}> {/* Change background color if sponsored */}
      <div className='w-40'>
        <div className='w-34 h-32 flex justify-center items-center'>
          <img src={data?.productImage[0]} className='mx-auto object-fill h-full w-fit' alt={data.productName} />
        </div>
        <h1 className='text-ellipsis line-clamp-2'>{data.productName}</h1>

        <div>
          <p className='font-semibold'>
            {displayINRCurrency(data.price)}
          </p>
          <p className='text-xl py-2'>
            {/* Render the ad button only if the product is not sponsored */}
            {!isSponsored && (
              <button className='bg-teal-400 rounded-full h-9 w-9 flex justify-center items-center' onClick={handleSponsorClick}>
                <FaAd />
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SponseredAdd;
