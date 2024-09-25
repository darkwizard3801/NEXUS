import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SummaryApi from '../common';
import { FaTrash, FaRecycle } from 'react-icons/fa'; // Importing icons

const CategoryAdd = ({data, fetchdata}) => {
  const [categoryProduct, setCategoryProduct] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const categoryLoading = new Array(13).fill(null);

  const fetchCategoryProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(SummaryApi.categoryPro.url);
      const dataResponse = await response.json();
      setCategoryProduct(dataResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryProduct();
  }, []);

  const handleAddCategory = () => {
    setShowInput(!showInput);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    const trimmedCategory = newCategory.trim();
    const trimmedLabel = newLabel.trim();
    const base64Image = await convertToBase64(newImage);

    if (!trimmedCategory || !trimmedLabel || !base64Image) {
      setErrorMessage('Please enter a valid category name, label, and image.');
      toast.error('Please enter a valid category name, label, and image.');
      return;
    }

    try {
      const response = await fetch(SummaryApi.categoryAdd.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          category: trimmedCategory, 
          label: trimmedLabel, 
          image: base64Image 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Category added successfully!');
        fetchCategoryProduct();
        setNewCategory('');
        setNewLabel('');
        setNewImage(null);
        setShowInput(false);
        setErrorMessage('');
      } else {
        setErrorMessage(data.message || 'Failed to add category.');
        toast.error(data.message || 'Failed to add category.');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      setErrorMessage('Error adding category. Please try again later.');
      toast.error('Error adding category. Please try again later.');
    }
  };

  // Handle disabling/enabling categories
  const handleToggleCategory = async (category) => {
    const updatedCategory = {
      ...category,
      disabled: !category.disabled, // Toggle the disabled state
    };
  
    try {
      const response = await fetch(`${SummaryApi.toglecat.url}/${category._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategory),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        fetchCategoryProduct(); // Refresh categories
        toast.success(updatedCategory.disabled ? 'Category disabled!' : 'Category enabled!');
      } else {
        toast.error(data.message || 'Failed to toggle category state.');
      }
    } catch (error) {
      console.error('Error toggling category state:', error);
      toast.error('Error toggling category state. Please try again later.');
    }
  };

  return (
    <div>
      <p className='text-lg text-black-600 font-semibold px-24'>Shop by Category</p>
      <div className='container mx-auto p-4 px-20'>
        <div className='flex items-center gap-4 flex-wrap flex-row-reverse justify-end overflow-scroll scrollbar-none'>
          {loading ? (
            categoryLoading.map((_, index) => (
              <div 
                  className='h-16 w-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-200 animate-pulse' 
                  key={"categoryLoading" + index}
              ></div>
            ))
          ) : (
            categoryProduct.map((product) => (
              <div key={product?._id} className={`flex flex-col items-center ${product.disabled ? 'opacity-50' : ''}`}>
                <div className='relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden p-2 bg-slate-200 flex items-center justify-center'>
                  <img
                    src={product?.productImage[0]}
                    alt={product?.category}
                    className='h-full w-full object-cover mix-blend-multiply hover:scale-125 transition-transform'
                    style={{ borderRadius: '50%' }}
                  />
                  {/* Icon container for delete and recycle icons */}
                  <div className='absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2'>
                    <div
                      className='cursor-pointer'
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the Link
                        handleToggleCategory(product);
                      }}
                    >
                      {product.disabled ? (
                        <FaRecycle className='text-green-500' />
                      ) : (
                        <FaTrash className='text-red-500' />
                      )}
                    </div>
                  </div>
                </div>
                <p className='text-center text-xs md:text-sm font-medium capitalize truncate max-w-[80px]'>
                  {product?.label}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <div
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl cursor-pointer"
            onClick={handleAddCategory}
          >
            +
          </div>
        </div>

        {showInput && (
          <div className="mt-4 flex flex-col items-center">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category"
              className="border border-gray-300 p-2 rounded-md w-full max-w-xs mb-2"
            />
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Enter new label"
              className="border border-gray-300 p-2 rounded-md w-full max-w-xs mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImage(e.target.files[0])}
              className="border border-gray-300 p-2 rounded-md w-full max-w-xs mb-2"
            />
            {errorMessage && (
              <p className="text-red-500 text-sm mb-2">{errorMessage}</p>
            )}
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white py-1 px-4 rounded-md"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryAdd;
