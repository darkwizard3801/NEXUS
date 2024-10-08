import React, { useState, useEffect } from 'react';
import { MdModeEditOutline, MdDelete } from 'react-icons/md';
import VendorEditProduct from './VendorEditProduct';
import displayINRCurrency from '../helpers/displayCurrency';
import { toast } from 'react-toastify'; // Import toast for notifications
import SummaryApi from '../common/index';
import { FaRecycle } from "react-icons/fa";

const VendorProductCard = ({ data, fetchdata }) => {
  const [editProduct, setEditProduct] = useState(false);
  const [isDisabled, setIsDisabled] = useState(data.disabled); // Track disabled state

  const handleDisable = async () => {
    if (!window.confirm('Are you sure you want to disable this product?')) return;
  
    try {
      const response = await fetch(`${SummaryApi.disableProduct.url}/${data._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Log the response for debugging
      const responseData = await response.json();
      console.log('Disable Product Response:', responseData);
  
      if (response.ok) {
        toast.success('Product disabled successfully!');
        setIsDisabled(true); // Mark product as disabled
        fetchdata(); // Refresh the product list
      } else {
        throw new Error(responseData.message || 'Failed to disable product');
      }
    } catch (error) {
      console.error('Error disabling product:', error);
      toast.error(error.message || 'Failed to disable product');
    }
  };
  

  const handleEnable = async () => {
    if (!window.confirm('Are you sure you want to enable this product?')) return;

    try {
      const response = await fetch(`${SummaryApi.enableProduct.url}/${data._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Product enabled successfully!');
        setIsDisabled(false); // Mark product as enabled
        fetchdata(); // Refresh the product list
      } else {
        throw new Error('Failed to enable product');
      }
    } catch (error) {
      console.error('Error enabling product:', error);
      toast.error('Failed to enable product');
    }
  };

  return (
    <div className={`bg-white  p-4 rounded ${isDisabled ? 'opacity-50' : ''}`}>
      <div className='w-40 '>
        <div className='w-34 h-32 flex justify-center items-center '>
          <img src={data?.productImage[0]} className='mx-auto object-fill h-full w-fit' alt={data.productName} />
        </div>
        <h1 className='text-ellipsis line-clamp-2'>{data.productName}</h1>

        <div>
          <p className='font-semibold'>
            {displayINRCurrency(data.price)}
          </p>

          <div className='flex items-center gap-3 py-3'>
            <div
              className={`p-2 bg-green-100 hover:bg-green-600 rounded-full hover:text-white cursor-pointer ${isDisabled ? 'pointer-events-none' : ''}`}
              onClick={() => !isDisabled && setEditProduct(true)}
            >
              <MdModeEditOutline />
            </div>

            {isDisabled ? (
              <div
                className='p-2 bg-blue-100 hover:bg-blue-600 rounded-full hover:text-white cursor-pointer'
                onClick={handleEnable}
              >
                <FaRecycle />
              </div>
            ) : (
              <div
                className='p-2 bg-red-100 hover:bg-red-600 rounded-full hover:text-white cursor-pointer'
                onClick={handleDisable}
              >
                <MdDelete />
              </div>
            )}
          </div>
        </div>

        {editProduct && !isDisabled && (
          <VendorEditProduct productData={data} onClose={() => setEditProduct(false)} fetchdata={fetchdata}
          />
        )}
      </div>
    </div>
  );
};

export default VendorProductCard;
