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
  const [courseType, setCourseType] = useState(productData?.catering?.courseType || '');
  const [newDishes, setNewDishes] = useState({});
  const [courseDishes, setCourseDishes] = useState(
    productData?.catering?.courses?.reduce((acc, course) => ({
      ...acc,
      [course.courseType]: course.dishes || []
    }), {}) || {}
  );
  const [cateringCourses, setCateringCourses] = useState(
    productData?.catering?.courses?.reduce((acc, course) => ({
      ...acc,
      [course.courseType]: course.additionalNotes || ''
    }), {}) || {}
  );

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

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    const cateringData = data.category.toLowerCase() === "catering" ? {
      courseType: courseType,
      courses: getCourseFields().map(course => ({
        courseName: course.label,
        courseType: course.name,
        dishes: courseDishes[course.name] || [],
        additionalNotes: cateringCourses[course.name] || ''
      }))
    } : null;

    const finalData = {
      ...data,
      _id: productData._id,
      ...(data.category.toLowerCase() === "catering" && {
        catering: cateringData
      })
    };

    console.log('Submitting data:', finalData);

    try {
      const response = await fetch(SummaryApi.updateProduct.url, {
        method: SummaryApi.updateProduct.method,
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(finalData)
      });

      const responseData = await response.json();
      console.log('Server Response:', responseData);

      if (responseData.success) {
        toast.success(responseData.message);
        onClose();
        await fetchdata();
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      console.error('Error updating product:', error);
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

  // Initialize states when course type changes
  useEffect(() => {
    if (courseType) {
      const initialNewDishes = {};
      getCourseFields().forEach(course => {
        if (!courseDishes[course.name]) {
          courseDishes[course.name] = [];
        }
        initialNewDishes[course.name] = '';
      });
      setNewDishes(initialNewDishes);
    }
  }, [courseType]);

  // Course fields definition
  const getCourseFields = () => {
    const allCourses = [
      {
        name: "horsOeuvre",
        label: "Appetizer",
        description: "(Starter)"
      },
      {
        name: "mainCourse",
        label: "Main Course",
        description: "(Entrée)"
      },
      {
        name: "dessert",
        label: "Dessert",
        description: "(Sweet)"
      },
      {
        name: "soup",
        label: "Soup",
        description: "(Broth-based)"
      },
      {
        name: "salad",
        label: "Salad",
        description: "(Fresh greens)"
      },
      {
        name: "fishCourse",
        label: "Fish Course",
        description: "(Seafood)"
      },
      {
        name: "palateCleaner",
        label: "Palate Cleanser",
        description: "(Sorbet)"
      },
      {
        name: "amuseBouche",
        label: "Amuse-Bouche",
        description: "(Pre-appetizer)"
      },
      {
        name: "cheeseCourse",
        label: "Cheese Course",
        description: "(Cheese selection)"
      },
      {
        name: "coffeeMignardises",
        label: "Coffee & Mignardises",
        description: "(With pastries)"
      }
    ];

    return allCourses.slice(0, parseInt(courseType));
  };

  // Handle input change for specific course
  const handleNewDishChange = (courseName, value) => {
    setNewDishes(prev => ({
      ...prev,
      [courseName]: value
    }));
  };

  // Handle adding a new dish
  const handleAddDish = (courseName) => {
    const dishValue = newDishes[courseName];
    if (dishValue?.trim()) {
      setCourseDishes(prev => ({
        ...prev,
        [courseName]: [...(prev[courseName] || []), dishValue.trim()]
      }));
      setNewDishes(prev => ({
        ...prev,
        [courseName]: ''
      }));
    }
  };

  // Handle removing a dish
  const handleRemoveDish = (courseName, dishIndex) => {
    setCourseDishes(prev => ({
      ...prev,
      [courseName]: prev[courseName].filter((_, index) => index !== dishIndex)
    }));
  };

  // Handle key press
  const handleKeyPress = (e, courseName) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDish(courseName);
    }
  };

  // Handle course type change
  const handleCourseTypeChange = (e) => {
    setCourseType(e.target.value);
  };

  // Handle catering notes change
  const handleCateringChange = (e) => {
    const { name, value } = e.target;
    setCateringCourses(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
          <form id="editProductForm" className='grid gap-6 p-4 pb-24' onSubmit={handleSubmit}>
            {/* Form Fields */}
            <div className="space-y-6">
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

            {/* Conditional Catering Fields */}
            {data.category.toLowerCase() === "catering" && (
              <div className="space-y-6 border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800">Course Details</h3>
                
                {/* Course Type Selection */}
                <div className="space-y-3">
                  <p className="font-medium text-gray-700">Select Course Type:</p>
                  <div className="flex flex-wrap gap-6">
                    {['3', '5', '7', '10'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="courseType"
                          value={type}
                          checked={courseType === type}
                          onChange={handleCourseTypeChange}
                          className="w-4 h-4 text-red-600"
                        />
                        <span>{type} Course Meal</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Course Fields */}
                {courseType && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getCourseFields().map((course, index) => (
                      <div key={course.name} className="bg-white p-4 rounded-lg border">
                        {/* Course Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-7 h-7 flex items-center justify-center bg-red-100 text-red-600 rounded-full font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{course.label}</h4>
                            <p className="text-xs text-gray-500">{course.description}</p>
                          </div>
                        </div>

                        {/* Dish Input */}
                        <div className="relative mb-3">
                          <input
                            type="text"
                            placeholder={`Add a dish to ${course.label.toLowerCase()}`}
                            value={newDishes[course.name] || ''}
                            onChange={(e) => handleNewDishChange(course.name, e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, course.name)}
                            className="w-full pl-3 pr-12 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddDish(course.name)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Dishes List */}
                        <div className="space-y-1.5 mb-3 max-h-32 overflow-y-auto">
                          {courseDishes[course.name]?.map((dish, dishIndex) => (
                            <div 
                              key={dishIndex}
                              className="flex items-center justify-between bg-gray-50 px-3 py-1.5 rounded-md text-sm group"
                            >
                              <span className="text-gray-700">{dish}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveDish(course.name, dishIndex)}
                                className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Additional Notes */}
                        <textarea
                          name={course.name}
                          value={cateringCourses[course.name]}
                          onChange={handleCateringChange}
                          className="w-full p-2 bg-gray-50 border rounded-lg resize-none text-sm"
                          rows="2"
                          placeholder="Additional notes (optional)"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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