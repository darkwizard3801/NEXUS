import React, { useEffect, useState } from 'react';
import { MdModeEditOutline, MdDelete } from "react-icons/md";
import AdminEditProduct from './AdminEditProduct';
import displayINRCurrency from '../helpers/displayCurrency';
import { toast } from 'react-toastify';
import SummaryApi from '../common/index';
import { FaRecycle } from "react-icons/fa";

const AdminProductCard = ({ data, fetchdata }) => {
  const [editProduct, setEditProduct] = useState(false);
  const [isDisabled, setIsDisabled] = useState(data.disabled); // Track disabled state
  const [username, setUsername] = useState('');

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(SummaryApi.allUser.url, {
        method: SummaryApi.allUser.method,
        credentials: 'include',
      });
      const dataResponse = await response.json();
      return dataResponse?.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const getUsernameByEmail = (email, users) => {
    const user = users.find(user => user.email.trim().toLowerCase() === email.trim().toLowerCase());
    return user ? user.name : 'User not found'; // Use 'name' instead of 'username'
  };

  useEffect(() => {
    const fetchUsersAndSetUsername = async () => {
      const allUsers = await fetchAllUsers();
      const fetchedUsername = getUsernameByEmail(data.user, allUsers);
      setUsername(fetchedUsername);
    };

    fetchUsersAndSetUsername();
  }, [data.user]);

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

      if (response.ok) {
        toast.success('Product disabled successfully!');
        setIsDisabled(true); // Mark product as disabled
        fetchdata();
      } else {
        throw new Error('Failed to disable product');
      }
    } catch (error) {
      console.error('Error disabling product:', error);
      toast.error('Failed to disable product');
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
        fetchdata();
      } else {
        throw new Error('Failed to enable product');
      }
    } catch (error) {
      console.error('Error enabling product:', error);
      toast.error('Failed to enable product');
    }
  };

  return (
    <div
      className={`bg-white shadow-md rounded-lg p-3 transition-transform duration-300 ${isDisabled ? 'opacity-50' : ''}`}
      style={{ width: '100%', maxWidth: '220px' }} // Adjust maxWidth for responsiveness
    >
      <div className="flex flex-col items-center">
        {/* Product Image */}
        <div className='w-full h-36 flex justify-center items-center bg-gray-100 rounded-lg mb-2 overflow-hidden'>
          <img
            src={data?.productImage[0]}
            className='object-cover h-full w-full transition-transform duration-300 hover:scale-110' // Add zoom effect on hover
            alt={data.productName}
          />
        </div>

        {/* Product Name - Modified for two lines */}
        <h1 className='w-full text-center text-sm font-medium text-gray-700 overflow-hidden line-clamp-2 min-h-[40px] mb-1'>
          {data.productName}
        </h1>

        {/* Product Price */}
        <p className='text-center font-semibold text-md text-green-600 mb-1'>
          {displayINRCurrency(data.price)}
        </p>

        {/* Added by Username */}
        <p className='text-center text-gray-600 mb-2'>
          <strong>Added by:</strong> {username || 'Loading...'}
        </p>

        {/* Action Buttons */}
        <div className='flex items-center justify-center gap-3'>
          {/* Edit Button */}
          <div
            className={`p-2 bg-green-100 hover:bg-green-600 rounded-full hover:text-white cursor-pointer ${isDisabled ? 'pointer-events-none' : ''}`}
            onClick={() => !isDisabled && setEditProduct(true)}
          >
            <MdModeEditOutline size={20} />
          </div>

          {/* Disable / Enable Button */}
          {isDisabled ? (
            <div
              className='p-2 bg-blue-100 hover:bg-blue-600 rounded-full hover:text-white cursor-pointer'
              onClick={handleEnable}
            >
              <FaRecycle size={20} />
            </div>
          ) : (
            <div
              className='p-2 bg-red-100 hover:bg-red-600 rounded-full hover:text-white cursor-pointer'
              onClick={handleDisable}
            >
              <MdDelete size={20} />
            </div>
          )}
        </div>
      </div>

      {/* Edit Product Modal */}
      {editProduct && !isDisabled && (
        <AdminEditProduct productData={data} onClose={() => setEditProduct(false)} fetchdata={fetchdata} />
      )}
    </div>
  );
};

export default AdminProductCard;
