import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SummaryApi from '../common';
import VerticalCard from '../components/VerticalCard';
import productCategory from '../helpers/productCategory';

const SearchProduct = () => {
    const query = useLocation();
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectCategory, setSelectCategory] = useState({});
    const [sortBy, setSortBy] = useState('');

    const fetchProduct = async () => {
        setLoading(true);
        const response = await fetch(SummaryApi.searchProduct.url + query.search);
        const dataResponse = await response.json();
        setLoading(false);

        setData(dataResponse.data || []);
        setFilteredData(dataResponse.data || []); // Initialize filtered data
    };

    useEffect(() => {
        fetchProduct();
    }, [query]);

    const handleSelectCategory = (e) => {
        const { value, checked } = e.target;

        setSelectCategory((prev) => ({
            ...prev,
            [value]: checked
        }));
    };

    const applyFilters = () => {
        const selectedCategories = Object.keys(selectCategory).filter(category => selectCategory[category]);
        const filtered = data.filter(product => {
            const categoryMatch = selectedCategories.length ? selectedCategories.includes(product.category) : true;
            return categoryMatch;
        });
        setFilteredData(filtered);
    };

    useEffect(() => {
        applyFilters();
    }, [selectCategory, data]);

    const handleOnChangeSortBy = (e) => {
        const { value } = e.target;
        setSortBy(value);

        if (value === 'asc') {
            setFilteredData(prev => [...prev].sort((a, b) => a.price - b.price));
        }

        if (value === 'dsc') {
            setFilteredData(prev => [...prev].sort((a, b) => b.price - a.price));
        }
    };

    return (
        <div className='container mx-auto p-4'>
            {loading && (
                <p className='text-lg text-center'>Loading ...</p>
            )}

            <div className='flex gap-4 mb-4'>
                <div>
                    <h3 className='text-base uppercase font-medium text-slate-500'>Sort by</h3>
                    <form className='text-sm flex flex-col gap-2'>
                        <div className='flex items-center gap-3'>
                            <input type='radio' name='sortBy' checked={sortBy === 'asc'} onChange={handleOnChangeSortBy} value={"asc"} />
                            <label>Price - Low to High</label>
                        </div>
                        <div className='flex items-center gap-3'>
                            <input type='radio' name='sortBy' checked={sortBy === 'dsc'} onChange={handleOnChangeSortBy} value={"dsc"} />
                            <label>Price - High to Low</label>
                        </div>
                    </form>
                </div>

                <div>
                    <h3 className='text-base uppercase font-medium text-slate-500'>Category</h3>
                    <form className='text-sm flex flex-col gap-2'>
                        {productCategory.map((category, index) => (
                            <div className='flex items-center gap-3' key={index}>
                                <input type='checkbox' name={"category"} checked={selectCategory[category.value] || false} value={category.value} id={category.value} onChange={handleSelectCategory} />
                                <label htmlFor={category.value}>{category.label}</label>
                            </div>
                        ))}
                    </form>
                </div>
            </div>

            <p className='text-lg font-semibold my-3'>Search Results: {filteredData.length}</p>

            {filteredData.length === 0 && !loading && (
                <p className='bg-white text-lg text-center p-4'>No Data Found....</p>
            )}

            {filteredData.length !== 0 && !loading && (
                <VerticalCard loading={loading} data={filteredData} />
            )}
        </div>
    );
};

export default SearchProduct;
