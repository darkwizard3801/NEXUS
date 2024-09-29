import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import productCategory from '../helpers/productCategory';
import VerticalCard from '../components/VerticalCard';
import SummaryApi from '../common';

const CategoryProduct = () => {
    const [data, setData] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const urlSearch = new URLSearchParams(location.search);
    const urlCategoryListinArray = urlSearch.getAll("category");

    const urlCategoryListObject = {};
    urlCategoryListinArray.forEach(el => {
        urlCategoryListObject[el] = true;
    });

    const [selectCategory, setSelectCategory] = useState(urlCategoryListObject);
    const [filterCategoryList, setFilterCategoryList] = useState([]);
    const [sortBy, setSortBy] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false); // State to handle sidebar visibility

    const fetchData = async () => {
        setLoading(true);
        const response = await fetch(SummaryApi.filterProduct.url, {
            method: SummaryApi.filterProduct.method,
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                category: filterCategoryList
            })
        });

        const dataResponse = await response.json();
        setData(dataResponse?.data || []);
        setLoading(false);
    };

    const handleSelectCategory = (e) => {
        const { value, checked } = e.target;

        setSelectCategory((prev) => {
            return {
                ...prev,
                [value]: checked
            };
        });
    };

    useEffect(() => {
        fetchData();
    }, [filterCategoryList]);

    useEffect(() => {
        const arrayOfCategory = Object.keys(selectCategory).map(categoryKeyName => {
            if (selectCategory[categoryKeyName]) {
                return categoryKeyName;
            }
            return null;
        }).filter(el => el);

        setFilterCategoryList(arrayOfCategory);

        // Format for URL change when change on the checkbox
        const urlFormat = arrayOfCategory.map((el) => `category=${el}`);

        navigate("/product-category?" + urlFormat.join("&&"));
    }, [selectCategory]);

    const handleOnChangeSortBy = (e) => {
        const { value } = e.target;

        setSortBy(value);

        if (value === 'asc') {
            setData(prev => [...prev].sort((a, b) => a.price - b.price)); // Use spread operator to avoid mutating state directly
        }

        if (value === 'dsc') {
            setData(prev => [...prev].sort((a, b) => b.price - a.price)); // Use spread operator to avoid mutating state directly
        }
    };

    return (
        <div className='container mx-auto p-4 min-h-screen'>
            <div className='flex flex-col lg:grid lg:grid-cols-[200px,1fr]'>
                {/* Sidebar Button for Mobile */}
                <button 
                    className='lg:hidden mb-2 p-2 bg-blue-500 text-white rounded w-40' 
                    onClick={() => setSidebarOpen(prev => !prev)}
                >
                    {sidebarOpen ? "Hide Filters" : "Show Filters"}
                </button>

                {/* Sidebar (Filters) */}
                <div className={`bg-white p-2 lg:block min-h-[calc(100vh-120px)] overflow-y-scroll ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
                    <h3 className='text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300'>Sort by</h3>
                    <form className='text-sm flex flex-col gap-2 py-2'>
                        <div className='flex items-center gap-3'>
                            <input type='radio' name='sortBy' checked={sortBy === 'asc'} onChange={handleOnChangeSortBy} value={"asc"} />
                            <label>Price - Low to High</label>
                        </div>
                        <div className='flex items-center gap-3'>
                            <input type='radio' name='sortBy' checked={sortBy === 'dsc'} onChange={handleOnChangeSortBy} value={"dsc"} />
                            <label>Price - High to Low</label>
                        </div>
                    </form>

                    <h3 className='text-base uppercase font-medium text-slate-500 border-b pb-1 border-slate-300'>Category</h3>
                    <form className='text-sm flex flex-col gap-2 py-2'>
                        {
                            productCategory.map((categoryName, index) => (
                                <div className='flex items-center gap-3' key={index}>
                                    <input type='checkbox' name={"category"} checked={selectCategory[categoryName?.value]} value={categoryName?.value} id={categoryName?.value} onChange={handleSelectCategory} />
                                    <label htmlFor={categoryName?.value}>{categoryName?.label}</label>
                                </div>
                            ))
                        }
                    </form>
                </div>

                {/* Product Display */}
                <div className='px-4'>
                    <p className='font-medium text-slate-800 text-lg my-2'>Search Results: {data.length}</p>
                    <div className='min-h-[calc(100vh-120px)] overflow-y-scroll max-h-[calc(100vh-120px)]'>
                        {
                            loading ? (
                                <p className='text-center text-lg'>Loading...</p>
                            ) : (
                                data.length !== 0 && (
                                    <VerticalCard data={data} loading={loading} />
                                )
                            )
                        }

                        {
                            !loading && data.length === 0 && (
                                <p className='text-center text-lg'>No products found.</p>
                            )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryProduct;
