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
  const [licenseNumber, setLicenseNumber] = useState(""); // State to store license number
  const [cateringCourses, setCateringCourses] = useState({
    amuseBouche: "",
    horsOeuvre: "",
    soup: "",
    salad: "",
    fishCourse: "",
    palateCleaner: "",
    mainCourse: "",
    cheeseCourse: "",
    dessert: "",
    coffeeMignardises: ""
  });
  const [courseType, setCourseType] = useState('');
  const [newDishes, setNewDishes] = useState({}); // Object to store new dish input for each course
  const [courseDishes, setCourseDishes] = useState({});
  const [rentalVariants, setRentalVariants] = useState([
    { itemName: '', stock: '', price: '' }  // Added price to initial variant
  ]);

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
      const userLicenseNumber = userDetails?.data?.licenseNumber; // Assuming licenseNumber is part of userDetails

      if (userEmail) {
        setData((prevData) => ({ ...prevData, user: userEmail }));
      } else {
        toast.error("Failed to fetch user email.");
      }

      if (userLicenseNumber) {
        setLicenseNumber(userLicenseNumber); // Set license number if it exists
      } else {
        toast.error("No license number found. Please provide your license number.");
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
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error("An error occurred while fetching categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    console.log("Selected category:", value); // Debug log
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // Add useEffect to monitor category changes
  useEffect(() => {
    console.log("Current category:", data.category); // Debug log
  }, [data.category]);

  const handleCateringChange = (e) => {
    const { name, value } = e.target;
    setCateringCourses(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...rentalVariants];
    newVariants[index][field] = value;
    setRentalVariants(newVariants);
  };

  const addNewVariant = () => {
    setRentalVariants([...rentalVariants, { itemName: '', stock: '', price: '' }]);
  };

  const removeVariant = (index) => {
    const newVariants = rentalVariants.filter((_, i) => i !== index);
    setRentalVariants(newVariants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare catering data if category is Catering
    const cateringData = data.category.toLowerCase() === "catering" ? {
      courseType: courseType, // '3', '5', '7', or '10'
      courses: getCourseFields().map(course => ({
        courseName: course.label,
        courseType: course.name,
        dishes: courseDishes[course.name] || [], // Array of dishes
        additionalNotes: cateringCourses[course.name] || ''
      }))
    } : null;

    const finalData = {
      ...data,
      ...(data.category.toLowerCase() === "catering" && {
        catering: cateringData
      }),
      ...(data.category.toLowerCase() === "rent" && {
        rentalVariants: rentalVariants
      })
    };

    console.log('Submitting data:', finalData);

    try {
      setLoading(true);
      const response = await fetch(SummaryApi.uploadProduct.url, {
        method: SummaryApi.uploadProduct.method,
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(finalData)
      });

      const responseData = await response.json();
      console.log('Response from server:', responseData); // Add this for debugging

      if (responseData.success) {
        toast.success(responseData.message);
        onClose();
        fetchData(); // Refresh the product list
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      console.error('Error uploading product:', error);
      toast.error("An error occurred while uploading the product.");
    } finally {
      setLoading(false);
    }
  };

  // Add handler for radio buttons
  const handleCourseTypeChange = (e) => {
    setCourseType(e.target.value);
  };

  // Define course fields based on selection
  const getCourseFields = () => {
    const allCourses = [
      {
        name: "horsOeuvre",
        label: "Appetizer",
        description: "(Starter)",
        placeholder: "Describe the appetizer"
      },
      {
        name: "mainCourse",
        label: "Main Course",
        description: "(Entrée)",
        placeholder: "Describe the main course"
      },
      {
        name: "dessert",
        label: "Dessert",
        description: "(Sweet)",
        placeholder: "Describe the dessert"
      },
      {
        name: "soup",
        label: "Soup",
        description: "(Broth-based)",
        placeholder: "Describe the soup course"
      },
      {
        name: "salad",
        label: "Salad",
        description: "(Fresh greens)",
        placeholder: "Describe the salad course"
      },
      {
        name: "fishCourse",
        label: "Fish Course",
        description: "(Seafood)",
        placeholder: "Describe the fish course"
      },
      {
        name: "palateCleaner",
        label: "Palate Cleanser",
        description: "(Sorbet)",
        placeholder: "Describe the palate cleanser"
      },
      {
        name: "amuseBouche",
        label: "Amuse-Bouche",
        description: "(Pre-appetizer)",
        placeholder: "Describe the Amuse-Bouche"
      },
      {
        name: "cheeseCourse",
        label: "Cheese Course",
        description: "(Cheese selection)",
        placeholder: "Describe the cheese course"
      },
      {
        name: "coffeeMignardises",
        label: "Coffee & Mignardises",
        description: "(With pastries)",
        placeholder: "Describe the coffee service"
      }
    ];

    return allCourses.slice(0, parseInt(courseType));
  };

  // Initialize states when course type changes
  useEffect(() => {
    if (courseType) {
      const initialDishes = {};
      const initialNewDishes = {};
      getCourseFields().forEach(course => {
        initialDishes[course.name] = [];
        initialNewDishes[course.name] = '';
      });
      setCourseDishes(initialDishes);
      setNewDishes(initialNewDishes);
    }
  }, [courseType]);

  // Handle input change for specific course
  const handleNewDishChange = (courseName, value) => {
    setNewDishes(prev => ({
      ...prev,
      [courseName]: value
    }));
  };

  // Handle adding a new dish to a specific course
  const handleAddDish = (courseName) => {
    const dishValue = newDishes[courseName];
    if (dishValue?.trim()) {
      setCourseDishes(prev => ({
        ...prev,
        [courseName]: [...(prev[courseName] || []), dishValue.trim()]
      }));
      setNewDishes(prev => ({
        ...prev,
        [courseName]: '' // Clear only the specific course input
      }));
    }
  };

  // Handle key press for specific course
  const handleKeyPress = (e, courseName) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDish(courseName);
    }
  };

  // Add this function to handle removing dishes
  const handleRemoveDish = (courseName, dishIndex) => {
    setCourseDishes(prev => ({
      ...prev,
      [courseName]: prev[courseName].filter((_, index) => index !== dishIndex)
    }));
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
              categories.map((category) => (
                <option 
                  key={category._id} 
                  value={category.category}
                >
                  {category.label}
                </option>
              ))
            )}
          </select>

          {/* Debug display */}
          <div className="text-xs text-gray-500">
            Current category: {data.category}
          </div>

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

          {/* Only show price field if category is NOT rent */}
          {data.category.toLowerCase() !== "rent" && (
            <>
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
            </>
          )}

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

          {/* Conditional Catering Fields */}
          {data.category === "catering" && (
            <div className="space-y-6 border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-800">Course Details</h3>
              
              {/* Course Type Selection */}
              <div className="space-y-3">
                <p className="font-medium text-gray-700">Select Course Type:</p>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="courseType"
                      value="3"
                      checked={courseType === '3'}
                      onChange={handleCourseTypeChange}
                      className="w-4 h-4 text-red-600"
                    />
                    <span>3 Course Meal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="courseType"
                      value="5"
                      checked={courseType === '5'}
                      onChange={handleCourseTypeChange}
                      className="w-4 h-4 text-red-600"
                    />
                    <span>5 Course Meal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="courseType"
                      value="7"
                      checked={courseType === '7'}
                      onChange={handleCourseTypeChange}
                      className="w-4 h-4 text-red-600"
                    />
                    <span>7 Course Meal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="courseType"
                      value="10"
                      checked={courseType === '10'}
                      onChange={handleCourseTypeChange}
                      className="w-4 h-4 text-red-600"
                    />
                    <span>10 Course Meal</span>
                  </label>
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

                      {/* Dish Input Section */}
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

          {/* Rental Variants Section */}
          {data.category.toLowerCase() === "rent" && (
            <div className="space-y-4 mt-4 border-t pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Item Variants</h3>
                <button
                  type="button"
                  onClick={addNewVariant}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span className="text-xl">+</span> Add Variant
                </button>
              </div>

              {rentalVariants.map((item, index) => (
                <div key={index} className="flex items-end gap-4 bg-gray-50 p-3 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name
                    </label>
                    <input
                      type="text"
                      value={item.itemName}
                      onChange={(e) => handleVariantChange(index, 'itemName', e.target.value)}
                      placeholder="e.g., Plastic Chair, Wooden Chair"
                      className="p-2 bg-white border rounded w-full"
                      required
                    />
                  </div>
                  
                  <div className="w-24">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={item.stock}
                      onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                      placeholder="Qty"
                      className="p-2 bg-white border rounded w-full"
                      required
                      min="1"
                    />
                  </div>

                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                      placeholder="Price"
                      className="p-2 bg-white border rounded w-full"
                      required
                      min="0"
                    />
                  </div>

                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <MdDelete size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

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
