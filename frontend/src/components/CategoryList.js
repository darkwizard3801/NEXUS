import React, { useEffect, useState } from 'react';
import SummaryApi from '../common';
import { Link } from 'react-router-dom';

const CategoryList = () => {
    const [categoryProduct, setCategoryProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // State to handle errors

    const categoryLoading = new Array(13).fill(null);

    const fetchCategoryProduct = async () => {
        try {
            const response = await fetch(SummaryApi.categoryProduct.url);
            if (!response.ok) {
                throw new Error('Failed to fetch categories'); // Throw an error if the response is not ok
            }
            const dataResponse = await response.json();
            setCategoryProduct(dataResponse.data || []); // Ensure data is always an array
        } catch (err) {
            setError(err.message); // Set the error message
        } finally {
            setLoading(false); // Set loading to false regardless of success or failure
        }
    };

    useEffect(() => {
        fetchCategoryProduct();
    }, []);

    return (
        <div>
            <p className='text-lg text-black-600 font-semibold px-24'>Shop by Category</p>
            <div className='container mx-auto p-4 px-20'>
                <div className='flex items-center gap-4 justify-between overflow-scroll scrollbar-none'>
                    {loading ? (
                        categoryLoading.map((_, index) => (
                            <div 
                                className='h-16 w-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-200 animate-pulse' 
                                key={"categoryLoading" + index}
                            ></div>
                        ))
                    ) : error ? (
                        <div className='text-red-500'>Error: {error}</div> // Display error message
                    ) : (
                        categoryProduct.map((product) => (
                            <div key={product?.category} className='flex flex-col items-center'>
                                <Link to={`/product-category?category=${product?.category}`} className='cursor-pointer'>
                                    <div className='w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden p-2 bg-slate-200 flex items-center justify-center'>
                                        <img
                                            src={product?.productImage[0]}
                                            alt={product?.category}
                                            className='h-full object-cover mix-blend-multiply hover:scale-125 transition-transform'
                                            style={{ borderRadius: '50%' }}
                                        />
                                    </div>
                                    <p className='text-center text-xs md:text-sm font-medium capitalize truncate max-w-[80px]'>
                                        {product?.category}
                                    </p>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryList;
