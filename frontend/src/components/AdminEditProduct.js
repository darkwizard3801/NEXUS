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
  const handleSubmit = async(e) =>{
    e.preventDefault()
    
    const response = await fetch(SummaryApi.updateProduct.url,{
      method : SummaryApi.updateProduct.method,
      credentials : 'include',
      headers : {
        "content-type" : "application/json"
      },
      body : JSON.stringify(data)
    })

    const responseData = await response.json()

    if(responseData.success){
        toast.success(responseData?.message)
        onClose()
        fetchdata()
    }


    if(responseData.error){
      toast.error(responseData?.message)
    }
  

  }
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

            <label htmlFor='for' className='text-xs text-blue-500'>*For caters,logistics and bakers price is price per head/plate/trip</label>


            <label htmlFor='for' className='text-xs text-pink-600'>*For others price is for the package</label>
          
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

            <button className='px-3 py-2 bg-red-600 text-white mb-10 hover:bg-red-700 rounded-2xl' onClick={handleSubmit}>Upload Product</button>



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

export default AdminEditProduct