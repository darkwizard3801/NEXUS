import React, { useState,useEffect } from 'react'
import { CgClose } from "react-icons/cg";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import SummaryApi from '../common';
import {toast} from 'react-toastify'
import uploadImage from '../helpers/uploadImage';
import productCategory from '../helpers/productCategory';
import DisplayImage from './DisplayImage';



const AdminEditProduct = ({
  onClose,
  productData,
  fetchdata
 
}) => {

  const [data,setData] = useState({
    ...productData,
    productName : productData?.productName,
    brandName : productData?.brandName,
    category : productData?.category,
    productImage : productData?.productImage || [],
    description : productData?.description,
    price : productData?.price,
    user: productData?.user
  })
  const [openFullScreenImage,setOpenFullScreenImage] = useState(false)
  const [fullScreenImage,setFullScreenImage] = useState("")
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
     
      await fetchCategoryProduct(); // Fetch categories on component mount
    };
    fetchData();
  }, []);
  const handleOnChange = (e)=>{
      const { name, value} = e.target

      setData((preve)=>{
        return{
          ...preve,
          [name]  : value
        }
      })
  }

  const handleUploadProduct = async(e) => {
    const file = e.target.files[0]
    const uploadImageCloudinary = await uploadImage(file)

    setData((preve)=>{
      return{
        ...preve,
        productImage : [ ...preve.productImage, uploadImageCloudinary.url]
      }
    })
  }

  const handleDeleteProductImage = async(index)=>{
    console.log("image index",index)
    
    const newProductImage = [...data.productImage]
    newProductImage.splice(index,1)

    setData((preve)=>{
      return{
        ...preve,
        productImage : [...newProductImage]
      }
    })
    
  }


  {/**upload product */}
  const handleSubmit = async(e) => {
    e.preventDefault();
    
    try {
      console.log("Sending update request with data:", data); // Debug log

      const response = await fetch(SummaryApi.updateProduct.url, {
        method: SummaryApi.updateProduct.method,
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...data,
          _id: productData._id // Ensure we're sending the product ID
        })
      });

      const responseData = await response.json();
      console.log("Update response:", responseData); // Debug log

      if (responseData.success) {
        toast.success(responseData?.message);
        onClose();
        await fetchdata(); // Refresh the product list
      } else {
        toast.error(responseData?.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("An error occurred while updating the product");
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
      //  else {
      //   toast.error("Failed to fetch categories.");
      // }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error("An error occurred while fetching categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Initialize data with all required fields
  useEffect(() => {
    if (productData) {
      setData({
        _id: productData._id,
        productName: productData.productName || "",
        brandName: productData.brandName || "",
        category: productData.category || "",
        productImage: productData.productImage || [],
        description: productData.description || "",
        price: productData.price || "",
        user: productData.user || ""
      });
    }
  }, [productData]);

  return (
    <div className='fixed w-full h-full bg-black bg-opacity-50 top-0 left-0 right-0 bottom-0 flex justify-center items-center z-[9999]'>
      <div className='bg-white p-4 rounded-lg w-full max-w-xl h-full max-h-[80%] overflow-hidden relative shadow-2xl'>
        {/* Header */}
        <div className='flex justify-between items-center pb-3 border-b'>
          <h2 className='font-bold text-xl text-gray-800'>Edit Product</h2>
          <button 
            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors' 
            onClick={onClose}
          >
            <CgClose className="text-2xl text-gray-600 hover:text-red-600" />
          </button>
        </div>

        {/* Form Container with Padding Bottom for Button */}
        <div className='h-[calc(100%-4rem)] overflow-y-auto'>
          <form id="editProductForm" className='grid gap-6 p-4 pb-24' onSubmit={handleSubmit}> {/* Added form id here */}
            {/* Form Fields */}
            <div className="space-y-6"> {/* Added container for form fields with spacing */}
              <div>
                <label htmlFor='productName' className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type='text'
                  id='productName'
                  placeholder='Enter product/package/service name'
                  name='productName'
                  value={data.productName}
                  onChange={handleOnChange}
                  className='w-full p-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                  required
                />
              </div>

              <div>
                <label htmlFor='brandName' className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type='text'
                  id='brandName'
                  placeholder='Enter company name'
                  value={data.brandName}
                  name='brandName'
                  onChange={handleOnChange}
                  className='w-full p-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                  required
                />
              </div>

              <div>
                <label htmlFor='category' className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  required
                  value={data.category}
                  name='category'
                  onChange={handleOnChange}
                  className='w-full p-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
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
              </div>

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 text-center'>
                  <input type='file' id='uploadImageInput' className='hidden' accept='image/*' onChange={handleUploadProduct}/>
                  <label htmlFor='uploadImageInput' className='cursor-pointer'>
                    <FaCloudUploadAlt className="mx-auto text-4xl text-gray-400 mb-2" />
                    <p className='text-sm text-gray-500'>Click to upload product images</p>
                  </label>
                </div>
                {/* Image Preview */}
                {data.productImage.length > 0 && (
                  <div className='flex gap-2 mt-2 flex-wrap'>
                    {data.productImage.map((img, idx) => (
                      <div key={idx} className='relative group'>
                        <img src={img} alt="" className='w-20 h-20 object-cover rounded' />
                        <button
                          type="button"
                          onClick={() => handleDeleteProductImage(idx)}
                          className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <MdDelete size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor='price' className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type='number'
                  id='price'
                  placeholder='Enter price'
                  value={data.price}
                  name='price'
                  onChange={handleOnChange}
                  className='w-full p-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500'
                  required
                />
                <p className="text-xs text-gray-500 mt-1">*For caters, logistics and bakers price is per head/plate/trip</p>
              </div>

              <div>
                <label htmlFor='description' className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  id='description'
                  placeholder='Enter product description'
                  name='description'
                  value={data.description}
                  onChange={handleOnChange}
                  rows={4}
                  className='w-full p-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none'
                />
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Update Button at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button 
            type="submit"
            form="editProductForm"
            className='w-full px-4 py-3 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors font-medium'
          >
            Update Product
          </button>
        </div>
      </div>

      {/***display image full screen */}
      {
        openFullScreenImage && (
          <DisplayImage onClose={()=>setOpenFullScreenImage(false)} imgUrl={fullScreenImage}/>
        )
       }
        
    </div>
  )
}

export default AdminEditProduct