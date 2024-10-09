import React, { useContext, useEffect, useRef, useState } from 'react';
import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct';
import displayINRCurrency from '../helpers/displayCurrency';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import addToCart from '../helpers/addToCart';
import Context from '../context';
import SummaryApi from '../common';

const RecomendedProduct = ({ category, heading, userEmail }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const loadingList = new Array(13).fill(null);
    const scrollElement = useRef();
    const { fetchUserAddToCart } = useContext(Context);
    const [userEvents, setUserEvents] = useState([]); // Store event details
    const [quantity, setQuantity] = useState(1); // Set default quantity

    const handleAddToCart = async (e, id) => {
        await addToCart(e, id, quantity); // Use the quantity state
        fetchUserAddToCart();
    };

    const fetchUserEvents = async (email) => {
        try {
            const eventsResponse = await fetch(SummaryApi.user_events.url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const eventsData = await eventsResponse.json();
            if (eventsData.success) {
                setUserEvents(eventsData.events); // Store event details in state
            } else {
                console.error('Error fetching events:', eventsData.message);
            }
        } catch (error) {
            console.error('Error fetching user events:', error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        const categoryProduct = await fetchCategoryWiseProduct(category);
        setLoading(false);
        setData(categoryProduct?.data);
    };

    useEffect(() => {
        fetchData(); // Fetch category-wise products
        fetchUserEvents(userEmail); // Fetch user event details
    }, []);

    const filterProductsByBudget = (productPrice, eventBudget) => {
        if (!eventBudget || eventBudget.length < 2) {
            // If budget is undefined or has less than two elements, allow all products
            return true;
        }
        const [minBudget, maxBudget] = eventBudget; 
        return productPrice <= maxBudget; // Allow products within budget
    };

    const scrollRight = () => {
        scrollElement.current.scrollTo({
            left: scrollElement.current.scrollLeft + 300,
            behavior: 'smooth',
        });
    };

    const scrollLeft = () => {
        scrollElement.current.scrollTo({
            left: scrollElement.current.scrollLeft - 300,
            behavior: 'smooth',
        });
    };

    return (
        <div className='container mx-auto px-4 my-6 relative'>
            <h2 className='text-2xl font-semibold py-4'>{heading}</h2>

            <div className='flex items-center gap-4 md:gap-6 overflow-x-scroll scrollbar-none transition-all' ref={scrollElement}>
                <button className='bg-white shadow-md rounded-full p-1 absolute left-0 text-lg hidden md:block' onClick={scrollLeft}>
                    <FaAngleLeft />
                </button>
                <button className='bg-white shadow-md rounded-full p-1 absolute right-0 text-lg hidden md:block' onClick={scrollRight}>
                    <FaAngleRight />
                </button>

                {loading ? (
                    loadingList.map((_, index) => (
                        <div key={index} className='w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-sm shadow'>
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
                    data.filter(product => !product.disabled).map((product) => {
                        // Get the budget from the last event
                        const eventBudget = userEvents.length > 0 ? userEvents[userEvents.length - 1].budget : [0, Infinity]; 
                        if (filterProductsByBudget(product.price, eventBudget)) {
                            return (
                                <Link key={product._id} to={"product/" + product?._id} className='w-full min-w-[280px] md:min-w-[320px] max-w-[280px] md:max-w-[320px] bg-white rounded-sm shadow'>
                                    <div className='bg-slate-200 h-48 p-4 min-w-[280px] md:min-w-[145px] flex justify-center items-center'>
                                        <img src={product.productImage[0]} className='object-scale-down h-full hover:scale-110 transition-all mix-blend-multiply' alt='Product' />
                                    </div>
                                    <div className='p-4 grid gap-3'>
                                        <h2 className='font-medium text-base md:text-lg text-ellipsis line-clamp-1 text-black'>{product?.productName}</h2>
                                        <p className='capitalize text-slate-500'>{product?.category}</p>
                                        <p className='capitalize text-slate-500'>{product?.brandName}</p>
                                        <div className='flex gap-3'>
                                            <p className='text-red-600 font-medium'>{displayINRCurrency(product?.price)}</p>
                                        </div>
                                        <button className='text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-0.5 rounded-full' onClick={(e) => handleAddToCart(e, product?._id)}>Add to Cart</button>
                                    </div>
                                </Link>
                            );
                        }
                        return null;
                    })
                )}
            </div>
        </div>
    );
};

export default RecomendedProduct;
