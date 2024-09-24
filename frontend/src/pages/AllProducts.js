import React, { useEffect, useState } from 'react';
import UploadProduct from '../components/UploadProduct';
import SummaryApi from '../common';
import AdminProductCard from '../components/AdminProductCard';

const AllProducts = () => {
  const [openUploadProduct, setOpenUploadProduct] = useState(false);
  const [allProduct, setAllProduct] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // State to store filtered products
  const [selectedCategory, setSelectedCategory] = useState(''); // State to store selected category

  // Fetch all products
  const fetchAllProduct = async () => {
    const response = await fetch(SummaryApi.allProduct.url);
    const dataResponse = await response.json();

    console.log('product data', dataResponse);

    setAllProduct(dataResponse?.data || []);
    setFilteredProducts(dataResponse?.data || []); // Initially set the filtered products to all products
  };

  // Function to filter products based on the selected category
  const handleCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedCategory(category);

    if (category === '') {
      // If no category is selected, show all products
      setFilteredProducts(allProduct);
    } else {
      // Filter the products based on the selected category
      const filtered = allProduct.filter((product) => product.category === category);
      setFilteredProducts(filtered);
    }
  };

  useEffect(() => {
    fetchAllProduct();
  }, []);

  return (
    <div>
      <div className='bg-white py-2 px-4 flex justify-between items-center'>
        <h2 className='font-bold text-lg'>All Product</h2>
        <button
          className='border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all py-1 px-3 rounded-full'
          onClick={() => setOpenUploadProduct(true)}
        >
          Upload Product
        </button>
      </div>

      {/* Dropdown to filter by category */}
      <div className="my-4">
        <label htmlFor="category" className="mr-2 font-semibold">Filter by Category:</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">All Categories</option>
          <option value="catering">Catering</option>
          <option value="bakers">Bakes & Deserts</option>
          <option value="auditorium">Auditorium</option>
          <option value="rent">Rent</option>
          <option value="event-management">Event-Management</option>
          <option value="audio-visual-it">Audio-Visual-IT</option>
          <option value="photo-video">Photography & Videography</option>
          <option value="socia-media">Social-Media</option>
          <option value="logistics">Logistics</option>
          <option value="decorations">Decorations</option>
          {/* Add more options based on your categories */}
        </select>
      </div>

      {/* Render filtered products */}
      <div className='flex items-center flex-wrap h-38 gap-5 py-3 overflow-y-scroll '>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <AdminProductCard data={product} key={index + "allProduct"} fetchdata={fetchAllProduct} />
          ))
        ) : (
          <p>No products found for the selected category.</p>
        )}
      </div>

      {/* Upload product component */}
      {openUploadProduct && (
        <UploadProduct onClose={() => setOpenUploadProduct(false)} fetchData={fetchAllProduct} />
      )}
    </div>
  );
};

export default AllProducts;
