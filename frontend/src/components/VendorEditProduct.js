import React, { useEffect, useState } from 'react'
import { CgClose } from "react-icons/cg";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import SummaryApi from '../common';
import {toast} from 'react-toastify'
import uploadImage from '../helpers/uploadImage';
import productCategory from '../helpers/productCategory';
import DisplayImage from './DisplayImage';



const VendorEditProduct = ({
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

  const handleNewDishChange = (courseName, value) => {
    setNewDishes(prev => ({
      ...prev,
      [courseName]: value
    }));
  };

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

  const handleRemoveDish = (courseName, dishIndex) => {
    setCourseDishes(prev => ({
      ...prev,
      [courseName]: prev[courseName].filter((_, index) => index !== dishIndex)
    }));
  };

  const handleKeyPress = (e, courseName) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDish(courseName);
    }
  };

  const handleCourseTypeChange = (e) => {
    setCourseType(e.target.value);
  };

  const handleCateringChange = (e) => {
    const { name, value } = e.target;
    setCateringCourses(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
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
          "content-type": "application/json"
        },
        body: JSON.stringify(finalData)
      });

      const responseData = await response.json();
      console.log('Server Response:', responseData);

      if (responseData.success) {
        toast.success(responseData.message);
        onClose();
        fetchdata();
      } else {
        toast.error(responseData.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error("An error occurred while updating the product.");
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



  return (
    <div className='fixed w-full  h-full bg-slate-200 bg-opacity-35 top-0 left-0 right-0 bottom-0 flex justify-center items-center'>
    <div className='bg-white p-4 rounded w-full max-w-2xl h-full max-h-[80%] overflow-hidden'>

      <div className='flex justify-between items-center pb-3'>

        <h2 className='font-bold text-lg'>Upload Product</h2>
        <div className='w-fit ml-auto text-2xl hover:text-red-600 cursor-pointer' onClick={onClose} >
          <CgClose />
        </div>
      </div>

      <form className='grid p-4 gap-2 overflow-y-scroll h-full pb-5' >
        <label htmlFor='productName'>Product Name :</label>
        <input
          type='text'
          id='productName'
          placeholder='enter product/package/service name'
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
          placeholder='enter company name'
          value={data.brandName}
          name='brandName'
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
            <option value="" disabled >Select Category</option>
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
              <input type='file' id='uploadImageInput' className='hidden' accept='image/*' onChange={handleUploadProduct}/>
            </div>
          </div>
        </label>
        

        <div>
                {
                  data?.productImage[0] ? (
                      <div className='flex items-center gap-2'>
                          {
                            data.productImage.map((el,index)=>{
                              return(
                                <div className='relative group'>
                                    <img 
                                      src={el} 
                                      alt={el} 
                                      width={80} 
                                      height={80}  
                                      className='bg-slate-100 border cursor-pointer'  
                                      onClick={()=>{
                                        setOpenFullScreenImage(true)
                                        setFullScreenImage(el)
                                      }}/>

                                      <div className='absolute bottom-0 right-0 p-1 text-white bg-red-600 rounded-full hidden group-hover:block cursor-pointer' onClick={()=>handleDeleteProductImage(index)} >
                                        <MdDelete/>  
                                      </div>
                                </div>
                                
                              )
                            })
                          }
                      </div>
                  ) : (
                    <p className='text-red-600 text-xs'>*Please upload product image</p>
                  )
                }
                
            </div>

            <label htmlFor='price' className='mt-3'>Price :</label>
            <label htmlFor='for' className='text-xs text-blue-500'>*For caters,logistics and bakers price is price per head/plate/Trip</label>
            <label htmlFor='for' className='text-xs text-pink-600'>*For others price is for  the package</label>
          
            <input 
              type='number' 
              id='price' 
              placeholder='enter price' 
              value={data.price} 
              name='price'
              onChange={handleOnChange}
              className='p-2 bg-slate-100 border rounded'
              required
            />

            <label htmlFor='description' className='mt-3'>Description :</label>
            <textarea 
              className='h-28 bg-slate-100 border resize-none p-1 rounded' 
              placeholder='enter product description' 
              rows={3} 
              onChange={handleOnChange} 
              name='description'
              value={data.description}
            >
            </textarea>

            {data.category.toLowerCase() === "catering" && (
              <div className="space-y-6 border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800">Course Details</h3>
                
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

                {courseType && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getCourseFields().map((course, index) => (
                      <div key={course.name} className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-7 h-7 flex items-center justify-center bg-red-100 text-red-600 rounded-full font-medium">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{course.label}</h4>
                            <p className="text-xs text-gray-500">{course.description}</p>
                          </div>
                        </div>

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

            <button className='px-3 py-2 bg-red-600 text-white mb-10 hover:bg-red-700 rounded-2xl' onClick={handleSubmit}>
              Update Product
            </button>

      </form>


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

export default VendorEditProduct