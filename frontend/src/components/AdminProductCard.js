import React, { useEffect, useState } from 'react';
import { MdModeEditOutline } from "react-icons/md";
import AdminEditProduct from './AdminEditProduct';
import displayINRCurrency from '../helpers/displayCurrency';
import { toast } from 'react-toastify';
import SummaryApi from '../common/index';
import { MdDelete } from 'react-icons/md';
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
    <div className={`bg-white p-4 rounded ${isDisabled ? 'opacity-50' : ''}`}>
      <div className='w-40'>
        <div className='w-32 h-32 flex justify-center items-center'>
          <img src={data?.productImage[0]} className='mx-auto object-fill h-full' alt={data.productName} />
        </div>
        <h1 className='text-ellipsis line-clamp-2'>{data.productName}</h1>

        <div>
          <p className='font-semibold'>
            {displayINRCurrency(data.price)}
          </p>
          <p className='font-semibold'>
            <strong>Added by:</strong> {username || 'Loading...'}
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
      </div>

      {editProduct && !isDisabled && (
        <AdminEditProduct productData={data} onClose={() => setEditProduct(false)} fetchdata={fetchdata} />
      )}
    </div>
  );
};

export default AdminProductCard;
