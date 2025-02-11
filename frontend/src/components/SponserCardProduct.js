import React, { useContext, useEffect, useRef, useState } from 'react';
import displayINRCurrency from '../helpers/displayCurrency';
import { FaAngleLeft, FaAngleRight, FaShoppingCart } from 'react-icons/fa';
import { IoStar, IoStarHalf, IoStarOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import addToCart from '../helpers/addToCart';
import Context from '../context';
import SummaryApi from '../common';

const SponserCardProduct = ({ heading }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productRatings, setProductRatings] = useState({});
  const loadingList = new Array(13).fill(null);

  const scrollElement = useRef();

  const { fetchUserAddToCart } = useContext(Context);

  // Define quantity state
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async (e, id) => {
    await addToCart(e, id, quantity);
    fetchUserAddToCart();
  };

  const fetchAllProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(SummaryApi.allProduct.url);
      const dataResponse = await response.json();

      // Filter out the products where the 'sponsor' field is true
      const sponsoredProducts = dataResponse?.data?.filter((product) => product.sponsor) || [];

      setData(sponsoredProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  // Fetch ratings function
  const fetchRatings = async () => {
    try {
      const response = await fetch(SummaryApi.getRating.url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }

      const ratingData = await response.json();
      if (Array.isArray(ratingData?.data)) {
        // Create a map of product ratings
        const ratingsMap = {};
        ratingData.data.forEach(rating => {
          if (!ratingsMap[rating.productId]) {
            ratingsMap[rating.productId] = {
              totalRating: 0,
              count: 0
            };
          }
          ratingsMap[rating.productId].totalRating += rating.rating;
          ratingsMap[rating.productId].count += 1;
        });

        // Calculate average ratings
        Object.keys(ratingsMap).forEach(productId => {
          ratingsMap[productId].average = 
            ratingsMap[productId].totalRating / ratingsMap[productId].count;
        });

        setProductRatings(ratingsMap);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  // Fetch products and ratings
  useEffect(() => {
    const fetchData = async () => {
      await fetchAllProduct();
      await fetchRatings();
    };
    fetchData();
  }, []);

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

  // Updated star rendering function with sharp stars
  const renderStars = (productId) => {
    const rating = productRatings[productId];
    const averageRating = rating ? rating.average : 0;
    const reviewCount = rating ? rating.count : 0;
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;

    return (
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-0.5'>
          {[...Array(5)].map((_, i) => {
            if (i < fullStars) {
              return (
                <IoStar 
                  key={i}
                  className="w-4 h-4 text-yellow-500 drop-shadow-sm"
                />
              );
            } else if (i === fullStars && hasHalfStar) {
              return (
                <div key={i} className="relative">
                  <IoStarOutline 
                    className="w-4 h-4 text-yellow-500 absolute"
                  />
                  <IoStarHalf 
                    className="w-4 h-4 text-yellow-500 drop-shadow-sm"
                  />
                </div>
              );
            } else {
              return (
                <IoStarOutline 
                  key={i}
                  className="w-4 h-4 text-yellow-500"
                />
              );
            }
          })}
        </div>
        <div className='flex items-center gap-1.5'>
          <span className='text-sm font-medium text-yellow-600'>
            {averageRating.toFixed(1)}
          </span>
          <span className='text-xs text-gray-500'>
            ({reviewCount})
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className='container mx-auto px-4 my-8 relative'>
      {/* Enhanced Header */}
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-semibold flex items-center gap-3'>
          <span className='text-sm bg-gradient-to-r from-yellow-500 to-amber-500 
            text-white px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm'>
            <FaShoppingCart className='text-white' /> {heading}
          </span>
        </h2>
      </div>

      {/* Navigation Buttons */}
      <button 
        className='bg-white/80 backdrop-blur-sm shadow-lg rounded-full p-3 
          absolute left-2 top-1/2 -translate-y-1/2 z-10 text-lg hidden md:block
          hover:bg-white transition-all duration-200 hover:scale-110' 
        onClick={scrollLeft}
      >
        <FaAngleLeft className="text-gray-700" />
      </button>
      <button 
        className='bg-white/80 backdrop-blur-sm shadow-lg rounded-full p-3 
          absolute right-2 top-1/2 -translate-y-1/2 z-10 text-lg hidden md:block
          hover:bg-white transition-all duration-200 hover:scale-110' 
        onClick={scrollRight}
      >
        <FaAngleRight className="text-gray-700" />
      </button>

      {/* Products Carousel */}
      <div 
        className='flex items-center gap-6 overflow-x-scroll scrollbar-none transition-all pb-4' 
        ref={scrollElement}
      >
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
          data.map((product) => (
            <div key={product._id} className='group relative'>
              <Link 
                to={`product/${product._id}`} 
                className='block w-full min-w-[280px] md:min-w-[320px] max-w-[280px] 
                  md:max-w-[320px] bg-white rounded-xl shadow-md hover:shadow-xl 
                  transition-all duration-300 overflow-hidden'
              >
                {/* Image Container */}
                <div className='relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 
                  overflow-hidden group-hover:from-gray-100 group-hover:to-gray-200 
                  transition-all duration-300'
                >
                  <img 
                    src={product.productImage[0]} 
                    className='object-contain h-full w-full p-4 transition-transform 
                      duration-300 group-hover:scale-110 mix-blend-multiply' 
                    alt={product.productName}
                  />
                  {/* Sponsored Badge */}
                  <div className='absolute top-3 left-3 bg-yellow-500/90 backdrop-blur-sm 
                    text-white text-xs px-2 py-1 rounded-full flex items-center gap-1'
                  >
                    <IoStar size={10} />
                    <span>Sponsored</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className='p-4 space-y-3'>
                  {/* Title and Category */}
                  <div>
                    <h2 className='font-medium text-base md:text-lg text-gray-900 
                      text-ellipsis line-clamp-1'
                    >
                      {product.productName}
                    </h2>
                    <p className='text-sm text-gray-500 capitalize mt-1'>
                      {product.category} • {product.brandName}
                    </p>
                  </div>

                  {/* Updated Rating Display */}
                  <div className='py-1'>
                    {renderStars(product._id)}
                  </div>

                  {/* Price and Add to Cart */}
                  <div className='flex items-center justify-between pt-2'>
                    <p className='text-lg font-semibold text-gray-900'>
                      {displayINRCurrency(product.price)}
                    </p>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(e, product._id);
                      }}
                      className='flex items-center gap-2 bg-red-600 hover:bg-red-700 
                        text-white px-4 py-2 rounded-lg transition-colors duration-200
                        active:scale-95 transform'
                    >
                      <FaShoppingCart size={16} />
                      <span className='text-sm font-medium'>Add</span>
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SponserCardProduct;
