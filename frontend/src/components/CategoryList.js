import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { Link } from 'react-router-dom'

const CategoryList = () => {
    const [categoryProduct,setCategoryProduct] = useState([])
    const [loading,setLoading] = useState(false)

    const categoryLoading = new Array(13).fill(null)

    const fetchCategoryProduct = async() =>{
        setLoading(true)
        const response = await fetch(SummaryApi.categoryProduct.url)
        const dataResponse = await response.json()
        setLoading(false)
        setCategoryProduct(dataResponse.data)
    }

    useEffect(()=>{
        fetchCategoryProduct()
    },[])

  return (
    <div>

    <p className='text-lg text-black-600 font-semibold px-24'>shop by category</p>
    <div className='container mx-auto p-4 px-20'>

           <div className='flex items-center gap-4 justify-between overflow-scroll scrollbar-none'>
            { 

                loading ? (
                    categoryLoading.map((el,index)=>{
                            return(
                                <div className='h-16 w-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-200 animate-pulse' key={"categoryLoading"+index}>
                                </div>
                            )
                    })  
                ) :
                (
                    categoryProduct.map((product,index)=>{
                        return(
                            <div >
                            <Link to={"/product-category?category="+product?.category} className='cursor-pointer ' key={product?.category}>
                            <div className='w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden p-2  bg-slate-200 flex items-center justify-center '>
  <img
    src={product?.productImage[0]}
    alt={product?.category}
    className='h-full object-cover   mix-blend-multiply hover:scale-125 transition-transform'
    style={{ borderRadius: '50%' }}
  />
</div>
                                <p className='text-center text-xs md:text-sm font-medium capitalize truncate max-w-[80px]'>
                                    {product?.category}
                                </p>
                            </Link>
                            </div>
                        )
                    })
                )
            }
           </div>
    </div>
    </div>
  )
}

export default CategoryList