import React, { useContext, useEffect, useRef, useState } from 'react'
import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct'
import displayINRCurrency from '../helpers/displayCurrency'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import addToCart from '../helpers/addToCart'
import Context from '../context'

const VerticalCardProduct = ({ category, heading }) => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const loadingList = new Array(13).fill(null)

    const scrollElement = useRef()

    const { fetchUserAddToCart } = useContext(Context)

    // Define quantity state
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = async (e, id) => {
        await addToCart(e, id, quantity) // Use the quantity state
        fetchUserAddToCart()
    }

    const fetchData = async () => {
        setLoading(true)
        const categoryProduct = await fetchCategoryWiseProduct(category)
        setLoading(false)

        // console.log("horizontal data", categoryProduct.data)
        setData(categoryProduct?.data)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const scrollRight = () => {
        scrollElement.current.scrollTo({
            left: scrollElement.current.scrollLeft + 300,
            behavior: 'smooth' // Smooth scrolling
        });
    }
    
    const scrollLeft = () => {
        scrollElement.current.scrollTo({
            left: scrollElement.current.scrollLeft - 300,
            behavior: 'smooth' // Smooth scrolling
        });
    }

    return (
        <div className='container mx-auto px-4 my-6 relative '>
            <h2 className='text-2xl font-semibold py-4'>{heading}</h2>

            <div className='flex items-center gap-4 md:gap-6 overflow-x-scroll scrollbar-none transition-all' ref={scrollElement}>
                <button className='bg-white shadow-md rounded-full p-1 absolute left-0 text-lg hidden md:block' onClick={scrollLeft}><FaAngleLeft /></button>
                <button className='bg-white shadow-md rounded-full p-1 absolute right-0 text-lg hidden md:block' onClick={scrollRight}><FaAngleRight /></button>

                {
                    loading ? (
                        loadingList.map((_, index) => (
                            <div key={index} className='w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-sm shadow '>
                                <div className='bg-slate-200 h-48 p-4 min-w-[280px] md:min-w-[145px] flex justify-center items-center animate-pulse'></div>
                                <div className='p-4 grid gap-3'>
                                    <h2 className='font-medium text-base md:text-lg text-ellipsis line-clamp-1 text-black p-1 py-2 animate-pulse rounded-full bg-slate-200'></h2>
                                    <p className='capitalize text-slate-500 p-1 animate-pulse rounded-full bg-slate-200 py-2'></p>
                                    <div className='flex gap-3'>
                                        <p className='text-red-600 font-medium p-1 animate-pulse rounded-full bg-slate-200 w-full py-2'></p>
                                        <p className='text-slate-500 line-through p-1 animate-pulse rounded-full bg-slate-200 w-full py-2'></p>
                                    </div>
                                    <button className='text-sm text-white px-3 rounded-full bg-slate-200 py-2 animate-pulse'></button>
                                </div>
                            </div>
                        ))
                    ) : (
                        data.filter(product => !product.disabled).map((product, index) => (
                            <Link key={product._id} to={"product/" + product?._id} className='w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-sm shadow '>
                                <div className='bg-slate-100 h-48 p-2 min-w-[280px] md:min-w-[145px] flex justify-center items-center rounded-2xl overflow-hidden'>
                                    <img 
                                        src={product.productImage[0]} 
                                        className='w-[95%] h-[95%] object-cover rounded-2xl hover:scale-110 transition-all ' 
                                        alt={product?.productName}
                                    />
                                </div>
                                <div className='p-4 grid gap-3'>
                                    <h2 className='font-medium text-base md:text-lg text-ellipsis line-clamp-1 text-black'>{product?.productName}</h2>
                                    <p className='capitalize text-slate-500'>{product?.category}</p>
                                    <p className='capitalize text-slate-500'>{product?.brandName}</p>
                                    <div className='flex gap-3'>
                                        <p className='text-red-600 font-medium'>{displayINRCurrency(product?.price)}</p>
                                    </div>
                                    {/* Add a quantity input field */}
                                    {/* <input
                                        type='number'
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className='border border-slate-400 p-1 rounded w-24 my-2'
                                    /> */}
                                    <button className='text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-0.5 rounded-full' onClick={(e) => handleAddToCart(e, product?._id)}>Add to Cart</button>
                                </div>
                            </Link>
                        ))
                    )
                }
            </div>
        </div>
    )
}

export default VerticalCardProduct
