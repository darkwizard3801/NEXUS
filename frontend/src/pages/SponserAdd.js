import React, { useEffect, useState } from 'react';
import UploadProduct from '../components/UploadProduct';
import SummaryApi from '../common';
import SponseredAdd from '../components/SonseredAdd';
import { ToastContainer } from 'react-toastify';

const SponserAdd = () => {
  const [openUploadProduct, setOpenUploadProduct] = useState(false);
  const [allProduct, setAllProduct] = useState([]);
  const [sponsoredProducts, setSponsoredProducts] = useState([]);
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

        // Filter products based on the user's email
        const filteredProducts = dataResponse.data.filter(product => product.user === userEmail);
        
        console.log('Filtered products:', filteredProducts); // Debugging line
        setAllProduct(filteredProducts);

        // Filter sponsored products
        const filteredSponsoredProducts = filteredProducts.filter(product => product.sponsor);
        setSponsoredProducts(filteredSponsoredProducts); // Update sponsored products state
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
    setSponsoredProducts(prevSponsored => prevSponsored.filter(product => product._id !== deletedProductId)); // Also remove from sponsored products
  };

  return (
    <div>
      <ToastContainer position="top-center" />
      <p className='font-semibold text-2xl'>My Products</p>

      {/* Sponsored Products Section */}
      <h2 className="text-lg font-bold my-4">Your Sponsored Requests</h2>
      {sponsoredProducts.length > 0 ? (
        <div className='flex items-center flex-wrap gap-5 py-3'>
          {sponsoredProducts.map((product, index) => (
            <SponseredAdd
              key={index + 'sponsoredProduct'}
              data={product}
              fetchdata={fetchAllProduct}
              onDelete={handleProductDelete} // Pass delete handler
            />
          ))}
        </div>
      ) : (
        <p>No sponsored products available.</p>
      )}

      {/* All Products Section */}
      <h2 className="text-lg font-bold my-4">All Products</h2>
      <div className='flex items-center flex-wrap gap-5 py-3 overflow-y-scroll'>
        {allProduct.length > 0 ? (
          allProduct
            .filter(product => !product.sponsor) // Filter out sponsored products
            .map((product, index) => (
              <SponseredAdd
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

export default SponserAdd;
