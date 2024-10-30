import React, { useEffect, useState } from 'react';
import UploadProduct from '../components/UploadProduct';
import SummaryApi from '../common';
import AdminProductCard from '../components/AdminProductCard';
import { toast } from 'react-toastify';


const AllProducts = () => {
  const [openUploadProduct, setOpenUploadProduct] = useState(false);
  const [allProduct, setAllProduct] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // State to store filtered products
  const [selectedCategory, setSelectedCategory] = useState(''); // State to store selected category
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      await fetchAllProduct();
      await fetchCategoryProduct(); // Fetch categories on component mount
    };
    fetchData();
  }, []);
  // Fetch all products
  const fetchAllProduct = async () => {
    const response = await fetch(SummaryApi.allProduct.url);
    const dataResponse = await response.json();

    console.log('product data', dataResponse);

    setAllProduct(dataResponse?.data || []);
    setFilteredProducts(dataResponse?.data || []); // Initially set the filtered products to all products
  };
  const fetchCategoryProduct = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch(SummaryApi.categoryPro.url, {
        method: 'GET',
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const dataResponse = await response.json();
      console.log('Response status:', response.status);
      console.log('Categories fetched:', dataResponse.data);

      // Filter only enabled categories (disabled: false)
      const enabledCategories = dataResponse.data.filter(category => category.disabled === false);
      setCategories(enabledCategories);

      if (dataResponse.success) {
        console.log('Enabled categories:', enabledCategories);
      } 
      // else {
      //   toast.error("Failed to fetch categories.");
      // }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error("An error occurred while fetching categories.");
    } finally {
      setLoadingCategories(false);
    }
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
    <div className='mx-64'>
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
            required
            value={selectedCategory}
            name='category'
            onChange={handleCategoryChange}
            className='p-2 bg-slate-100 border rounded w-48 '
          >
            <option value="">Select Category</option>
            {loadingCategories ? (
              <option>Loading categories...</option>
            ) : (
              categories.length > 0 ? (
                categories.map((category) => (
                  <option key={category._id} value={category.category}>
                    {category.label}
                  </option>
                ))
              ) : (
                <option>No categories available</option>
              )
            )}
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
