import React, { useContext, useEffect, useState } from 'react';
import SummaryApi from '../common';
import Context from '../context';
import displayINRCurrency from '../helpers/displayCurrency';
import { MdDelete } from "react-icons/md";

const Cart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Flipkart'); // For Tabs
    const context = useContext(Context);
    const loadingCart = new Array(4).fill(null);

    const fetchData = async () => {
        const response = await fetch(SummaryApi.addToCartProductView.url, {
            method: SummaryApi.addToCartProductView.method,
            credentials: 'include',
            headers: {
                "content-type": 'application/json'
            },
        });

        const responseData = await response.json();
        if (responseData.success) {
            setData(responseData.data);
        }
    };

    const handleLoading = async () => {
        await fetchData();
    };

    useEffect(() => {
        setLoading(true);
        handleLoading();
        setLoading(false);
    }, []);

    const increaseQty = async (id, qty) => {
        const response = await fetch(SummaryApi.updateCartProduct.url, {
            method: SummaryApi.updateCartProduct.method,
            credentials: 'include',
            headers: {
                "content-type": 'application/json'
            },
            body: JSON.stringify({
                _id: id,
                quantity: parseInt(qty) + 1  // Ensuring it's a number to prevent concatenation
            })
        });
    
        const responseData = await response.json();
        if (responseData.success) {
            fetchData();  // Re-fetch updated cart data
        }
    };

    const decraseQty = async (id, qty) => {
        if (qty >= 2) {
            const response = await fetch(SummaryApi.updateCartProduct.url, {
                method: SummaryApi.updateCartProduct.method,
                credentials: 'include',
                headers: {
                    "content-type": 'application/json'
                },
                body: JSON.stringify({
                    _id: id,
                    quantity: qty - 1
                })
            });

            const responseData = await response.json();
            if (responseData.success) {
                fetchData();
            }
        }
    };

    const deleteCartProduct = async (id) => {
        const response = await fetch(SummaryApi.deleteCartProduct.url, {
            method: SummaryApi.deleteCartProduct.method,
            credentials: 'include',
            headers: {
                "content-type": 'application/json'
            },
            body: JSON.stringify({
                _id: id,
            })
        });

        const responseData = await response.json();
        if (responseData.success) {
            fetchData();
            context.fetchUserAddToCart();
        }
    };

    const totalQty = data.reduce((previousValue, currentValue) => previousValue + currentValue.quantity, 0);
    const totalPrice = data.reduce((preve, curr) => preve + (curr.quantity * curr?.productId?.price), 0);
    const discount = (totalPrice * 0.03); // 3% discount
    const finalAmount = totalPrice - discount; // Total after discount

    return (
        <div className='container mx-auto'>

            {/* Tabs for Flipkart and Grocery */}
            <div className="flex justify-between border-b-2 mb-4">
                <div>
                    <button 
                        onClick={() => setActiveTab('Flipkart')}
                        className={`px-4 py-2 ${activeTab === 'Flipkart' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                    >
                        Nexus ({context?.cartProductCount})
                    </button>
                </div>
            </div>

            {/* Cart Items and Summary */}
            <div className='flex flex-col lg:flex-row gap-10 lg:justify-between p-4'>

                {/* Product List */}
                <div className='w-full max-w-3xl'>
                    {
                        loading ? (
                            loadingCart?.map((el, index) => (
                                <div key={el + "Add To Cart Loading" + index} className='w-full bg-slate-200 h-32 my-2 border border-slate-300 animate-pulse rounded'>
                                </div>
                            ))
                        ) : (
                            data.map((product, index) => (
                                <div key={product?._id + "Add To Cart Loading"} className='w-full bg-white h-32 my-2 border border-slate-300 rounded grid grid-cols-[128px,1fr]'>
                                    <div className='w-32 h-32 bg-slate-200'>
                                        <img src={product?.productId?.productImage[0]} className='w-full h-full object-scale-down mix-blend-multiply' alt={product?.productId?.productName} />
                                    </div>
                                    <div className='px-4 py-2 relative'>
                                        <div className='absolute right-0 text-red-600 rounded-full p-2 hover:bg-red-600 hover:text-white cursor-pointer' onClick={() => deleteCartProduct(product?._id)}>
                                            <MdDelete />
                                        </div>
                                        <h2 className='text-lg lg:text-xl text-ellipsis line-clamp-1'>{product?.productId?.productName}</h2>
                                        {product?.productId?.inStock ? (
                                            <p className='capitalize text-slate-500'>{product?.productId.category}</p>
                                        ) : (
                                            <p className='text-red-600 font-bold py-1'></p>
                                        )}
                                        <div className='flex items-center justify-between '>
                                            <p className='text-red-600 font-medium text-lg '>{displayINRCurrency(product?.productId?.price * product?.quantity)}</p>
                                        </div>
                                        <div className='flex items-center gap-3 mt-1'>
                                            <button className='border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded ' onClick={() => decraseQty(product?._id, product?.quantity)}>-</button>
                                            <span>{product?.quantity}</span>
                                            <button className='border border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-6 h-6 flex justify-center items-center rounded ' onClick={() => increaseQty(product?._id, product?.quantity)}>+</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    }
                </div>

                {/* Summary Section */}
                <div className='mt-5 lg:mt-0 w-full max-w-sm'>
                    {
                        loading ? (
                            <div className='h-36 bg-slate-200 border border-slate-300 animate-pulse'></div>
                        ) : (
                            <div className='bg-white p-4'>
                                <h2 className='text-white bg-red-600 px-4 py-1'>Price Details</h2>
                                <div className='flex justify-between px-4 py-2'>
                                    <p>Price ({totalQty} items)</p>
                                    <p>{displayINRCurrency(totalPrice)}</p>
                                </div>
                                <div className='flex justify-between px-4 py-2'>
                                    <p>Discount (3%)</p>
                                    <p className="text-green-600">− {displayINRCurrency(discount)}</p> 
                                </div>
                                <div className='flex justify-between px-4 py-2'>
                                    <p>Delivery Charges</p>
                                    <p>FREE</p>
                                </div>
                                <hr className='my-2' />
                                <div className='flex justify-between font-semibold px-4 py-2'>
                                    <p>Total Amount</p>
                                    <p>{displayINRCurrency(finalAmount)}</p>
                                </div>
                                <button className='w-full bg-orange-500 text-white p-2 mt-3'>Place Order</button>
                            </div>
                        )
                    }
                </div>

            </div>
        </div>
    );
}

export default Cart;
