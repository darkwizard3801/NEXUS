import React, { useEffect, useState } from 'react';
import UploadProduct from '../components/UploadProduct';
import SummaryApi from '../common';
import VendorProductCard from '../components/VendorProductCard';

const VendorProducts = () => {
  const [openUploadProduct, setOpenUploadProduct] = useState(false);
  const [allProduct, setAllProduct] = useState([]);
  const [userEmail, setUserEmail] = useState(null);

  // Fetch the current logged-in user's email
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const userData = await response.json();
      console.log('Current user data:', userData); // Debugging line
      setUserEmail(userData.data.email);
      console.log('User email:', userEmail); // Set user email
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Fetch all products and filter them based on the current user's email
  const fetchAllProduct = async () => {
    try {
      const response = await fetch(SummaryApi.allProduct.url);
   
      const dataResponse = await response.json();

      if (Array.isArray(dataResponse?.data)) {
        console.log('Product data:', dataResponse.data); // Debugging line
        console.log('User email:', userEmail); // Debugging line

        // Filter products based on the user's email
        const filteredProducts = dataResponse.data.filter(product => {
          console.log('Checking product:', product); // Debugging line
          return product.user === userEmail;
        });

        console.log('Filtered products:', filteredProducts); // Debugging line
        setAllProduct(filteredProducts);
      } else {
        console.error('Invalid product data format:', dataResponse);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser(); // Fetch user email on component mount
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchAllProduct(); // Fetch products after user email is available
    }
  }, [userEmail]);
   // Function to handle product deletion
   const handleProductDelete = (deletedProductId) => {
    setAllProduct(prevProducts => prevProducts.filter(product => product._id !== deletedProductId));
  };

  return (
    <div className='mx-10'>
      <div className='bg-white py-2 px-4 flex justify-between items-center'>
        <h2 className='font-bold text-lg'>My Products</h2>
        <button
          className='border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all py-1 px-3 rounded-full'
          onClick={() => setOpenUploadProduct(true)}
        >
          Upload Product
        </button>
      </div>

      {/** Display filtered products */}
      <div className='flex items-center flex-wrap h-38 gap-5 py-3 overflow-y-scroll'>
        {allProduct.length > 0 ? (
          allProduct.map((product, index) => (
            <VendorProductCard
              key={index + 'myProduct'}
              data={product}
              fetchdata={fetchAllProduct}
              onDelete={handleProductDelete} // Pass delete handler
            />
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div>

      {/* Upload product component */}
      {openUploadProduct && (
        <UploadProduct onClose={() => setOpenUploadProduct(false)} fetchData={fetchAllProduct} />
      )}
    </div>
  );
};

export default VendorProducts;
