import React, { useEffect, useState } from 'react';
import { CgClose } from "react-icons/cg";
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from '../helpers/uploadImage';
import { MdDelete } from "react-icons/md";
import SummaryApi from '../common';
import { toast } from 'react-toastify';

const UploadProduct = ({ onClose, fetchData }) => {
  const [data, setData] = useState({
    productName: "",
    brandName: "",
    category: "",
    productImage: [],
    description: "",
    price: "",
    user: ""
  });

  const [openFullScreenImage, setOpenFullScreenImage] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserEmail();
      await fetchCategoryProduct(); // Fetch categories on component mount
    };
    fetchData();
  }, []);

  const fetchUserEmail = async () => {
    try {
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const userDetails = await response.json();
      const userEmail = userDetails?.data?.email;

      if (userEmail) {
        setData((prevData) => ({ ...prevData, user: userEmail }));
      } else {
        toast.error("Failed to fetch user email.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching user details.");
    }
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

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadProduct = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const uploadImageCloudinary = await uploadImage(file);
      setData((prev) => ({
        ...prev,
        productImage: [...prev.productImage, uploadImageCloudinary.url]
      }));
    }
  };

  const handleDeleteProductImage = (index) => {
    setData((prev) => ({
      ...prev,
      productImage: prev.productImage.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(SummaryApi.uploadProduct.url, {
        method: SummaryApi.uploadProduct.method,
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const responseData = await response.json();

      if (responseData.success) {
        toast.success(responseData.message);
        onClose();
        fetchData(); // Refresh the product list
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      toast.error("An error occurred while uploading the product.");
    }
  };

  return (
    <div className='fixed  w-full h-full bg-slate-200 bg-opacity-35 top-0 left-0 right-0 bottom-0 flex justify-center items-center'>
      <div className='bg-white p-4 rounded w-full max-w-2xl h-full max-h-[80%] overflow-hidden'>
        <div className='flex justify-between items-center pb-3'>
          <h2 className='font-bold text-lg'>Upload Product</h2>
          <div className='w-fit ml-auto text-2xl hover:text-red-600 cursor-pointer' onClick={onClose}>
            <CgClose />
          </div>
        </div>

        <form className='grid p-4 gap-2 overflow-y-scroll h-full pb-5' onSubmit={handleSubmit}>
          <label htmlFor='productName'>Product Name :</label>
          <input
            type='text'
            id='productName'
            placeholder='Enter product/package/service name'
            name='productName'
            value={data.productName}
            onChange={handleOnChange}
            className='p-2 bg-slate-100 border rounded'
            required
          />
          <label htmlFor='brandName' className='mt-3'>Company Name :</label>
          <input
            type='text'
            id='brandName'
            placeholder='Enter company name'
            name='brandName'
            value={data.brandName}
            onChange={handleOnChange}
            className='p-2 bg-slate-100 border rounded'
            required
          />
          <label htmlFor='category' className='mt-3'>Category :</label>
          <select
            required
            value={data.category}
            name='category'
            onChange={handleOnChange}
            className='p-2 bg-slate-100 border rounded'
          >
            <option value="" disabled>Select Category</option>
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

          <label htmlFor='productImage' className='mt-3'>Product Image :</label>
          <label htmlFor='uploadImageInput'>
            <div className='p-2 bg-slate-100 border rounded h-22 w-full flex justify-center items-center cursor-pointer'>
              <div className='text-slate-500 flex justify-center items-center flex-col gap-2'>
                <span className='text-4xl'><FaCloudUploadAlt /></span>
                <p className='text-sm'>Upload Product/Service Image</p>
                <input type='file' id='uploadImageInput' className='hidden' onChange={handleUploadProduct} />
              </div>
            </div>
          </label>

          <div>
            {data.productImage.length > 0 ? (
              <div className='flex items-center gap-2'>
                {data.productImage.map((el, index) => (
                  <div className='relative group' key={index}>
                    <img
                      src={el}
                      alt={el}
                      width={80}
                      height={80}
                      className='bg-slate-100 border cursor-pointer'
                      onClick={() => {
                        setOpenFullScreenImage(true);
                        setFullScreenImage(el);
                      }}
                    />
                    <div className='absolute bottom-0 right-0 p-1 text-white bg-red-600 rounded-full hidden group-hover:block cursor-pointer' onClick={() => handleDeleteProductImage(index)}>
                      <MdDelete />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-red-600 text-xs'>*Please upload product image</p>
            )}
          </div>

          <label htmlFor='price' className='mt-3'>Price :</label>
          <label htmlFor='for' className='text-xs text-blue-500'>*For caters, logistics, and bakers price is price per head/plate</label>
          <label htmlFor='for' className='text-xs text-pink-600'>*For others price is for the package</label>
          <input
            type='number'
            id='price'
            placeholder='Enter price'
            name='price'
            value={data.price}
            onChange={handleOnChange}
            className='p-2 bg-slate-100 border rounded'
            required
          />

          <label htmlFor='description' className='mt-3'>Description :</label>
          <textarea
            className='h-28 bg-slate-100 border resize-none p-2 rounded'
            id='description'
            placeholder='Enter product description'
            name='description'
            value={data.description}
            onChange={handleOnChange}
            required
          ></textarea>

          <button type='submit' className='w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-all'>
            {loading ? 'Uploading...' : 'Upload Product'}
          </button><br/><br/>
        </form>
      </div>

      {openFullScreenImage && (
        <div className='fixed w-full h-full top-0 left-0 right-0 bottom-0 bg-slate-100 bg-opacity-95 flex justify-center items-center'>
          <div className='relative'>
            <img src={fullScreenImage} alt='Full screen' className='w-96 h-96 object-cover' />
            <div
              className='absolute top-2 right-2 p-2 text-black bg-white rounded-full text-xl cursor-pointer hover:bg-slate-300'
              onClick={() => setOpenFullScreenImage(false)}
            >
              <CgClose />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadProduct;
