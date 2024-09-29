import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import SummaryApi from '../common'
import VerticalCard from '../components/VerticalCard'

const SearchProduct = () => {
    const query = useLocation()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [sortBy, setSortBy] = useState('') // State for sorting

    const fetchProduct = async () => {
        setLoading(true)
        const response = await fetch(SummaryApi.searchProduct.url + query.search)
        const dataResponse = await response.json()
        setLoading(false)

        setData(dataResponse.data)
    }

    useEffect(() => {
        fetchProduct()
    }, [query])

    const handleOnChangeSortBy = (e) => {
        const { value } = e.target;
        setSortBy(value);

        // Sort data based on selected value
        const sortedData = [...data].sort((a, b) => {
            if (value === 'asc') {
                return a.price - b.price; // Low to High
            } else if (value === 'dsc') {
                return b.price - a.price; // High to Low
            }
            return 0; // No sorting
        });

        setData(sortedData); // Update the data state with sorted data
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
                            <input 
                                type='radio' 
                                name='sortBy' 
                                checked={sortBy === 'asc'} 
                                onChange={handleOnChangeSortBy} 
                                value={"asc"} 
                            />
                            <label>Price - Low to High</label>
                        </div>
                        <div className='flex items-center gap-3'>
                            <input 
                                type='radio' 
                                name='sortBy' 
                                checked={sortBy === 'dsc'} 
                                onChange={handleOnChangeSortBy} 
                                value={"dsc"} 
                            />
                            <label>Price - High to Low</label>
                        </div>
                    </form>
                </div>
            </div>

            <p className='text-lg font-semibold my-3'>Search Results: {data.length}</p>

            {data.length === 0 && !loading && (
                <p className='bg-white text-lg text-center p-4'>No Data Found....</p>
            )}

            {data.length !== 0 && !loading && (
                <VerticalCard loading={loading} data={data} />
            )}
        </div>
    )
}

export default SearchProduct
