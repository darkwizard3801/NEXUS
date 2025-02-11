import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import SummaryApi from '../common';
import displayINRCurrency from '../helpers/displayCurrency';
import CategroyWiseProductDisplay from '../components/CategoryWiseProductDisplay';
import addToCart from '../helpers/addToCart';
import Context from '../context';
import { FaStar, FaStarHalf } from "react-icons/fa";
import { toast } from 'react-toastify';
import { FiShoppingCart, FiSettings } from 'react-icons/fi';
import { BsCalendarCheck } from 'react-icons/bs';
import { FaStore } from 'react-icons/fa';
import { MdRestaurantMenu } from 'react-icons/md';

const ProductDetails = () => {
  const [data, setData] = useState({
    productName: "",
    brandName: "",
    category: "",
    productImage: [],
    description: "",
    price: "",
  });
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [activeImages, setActiveImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState({ fullStars: 0, hasHalfStar: false }); // New state for rating
  const [showFullDescription, setShowFullDescription] = useState(false);
  const maxLength = 300; // Show first 300 characters initially
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState({});
  const [currentConfiguration, setCurrentConfiguration] = useState(null); // Store configuration here
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [productRating, setProductRating] = useState({ avgRating: 0, totalRatings: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [ratingStats, setRatingStats] = useState({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  });

  const { fetchUserAddToCart } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchProductDetails = async () => {
    setLoading(true);
    const response = await fetch(SummaryApi.productDetails.url, {
      method: SummaryApi.productDetails.method,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        productId: params?.id,
      }),
    });
    setLoading(false);
    const dataResponse = await response.json();
    setData(dataResponse?.data);
    setActiveImages(dataResponse?.data?.productImage || []);
    setActiveImageIndex(0);
    
    // Generate a random rating: 2, 3, or 4 full stars
    const randomFullStars = Math.floor(Math.random() * 3) + 2; // Generates 2, 3, or 4

    // Decide whether to include a half star or not (50% chance)
    const includeHalfStar = Math.random() < 0.5; // 50% chance to include half star

    setRating({ fullStars: randomFullStars, hasHalfStar: includeHalfStar });
  };

  const fetchProductRating = async () => {
    try {
      const response = await fetch(SummaryApi.getRating.url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch ratings');

      const data = await response.json();
      if (Array.isArray(data?.data)) {
        const productRatings = data.data.filter(rating => rating.productId === params.id);
        
        // Calculate rating distribution
        const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        productRatings.forEach(rating => {
          stats[Math.floor(rating.rating)]++;
        });
        setRatingStats(stats);

        // Calculate average rating (keep your existing calculation)
        const totalRatings = productRatings.length;
        const avgRating = totalRatings > 0 
          ? productRatings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
          : 0;

        setProductRating({
          avgRating: Math.round(avgRating * 2) / 2,
          totalRatings
        });
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    if (params.id) {
      fetchProductRating();
    }
  }, [params]);

  // Initialize selectedDishes with empty arrays for each course
  useEffect(() => {
    if (data?.catering?.courses) {
      const initialSelection = {};
      data.catering.courses.forEach(course => {
        initialSelection[course.courseType] = [];
      });
      setSelectedDishes(initialSelection);
    }
  }, [data?.catering?.courses]);

  // Set initial variant when data loads
  useEffect(() => {
    if (data?.category === "rent" && data?.rentalVariants?.length > 0) {
      setSelectedVariant(data.rentalVariants[0]);
    }
  }, [data]);

  const handleConfigurationSave = () => {
    const hasEmptySelection = Object.values(selectedDishes).some(dishes => 
      !Array.isArray(dishes) || dishes.length === 0
    );
    
    if (hasEmptySelection) {
      toast.error('Please select at least one dish from each course');
      return;
    }
    
    // Save configuration to state
    setCurrentConfiguration(selectedDishes);
    console.log('Configuration Saved:', selectedDishes); // Log when saving
    toast.success('Configuration saved!');
    setIsConfigModalOpen(false);
  };

  const addToCartWithConfig = async (productId, quantity, configuration) => {
    try {
      // Log the data being sent
      console.log('Sending to backend:', {
        productId,
        quantity,
        configuration
      });

      const response = await fetch(SummaryApi.addToCartWithConfig.url, {
        method: SummaryApi.addToCartWithConfig.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          quantity,
          configuration
        })
      });

      const data = await response.json();
      console.log('Backend Response:', data); // Log the response

      if (data.success) {
        toast.success(data.message);
        fetchUserAddToCart();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Add to Cart Error:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const addToCartWithVariant = async (e, productId) => {
    try {
      if (!selectedVariant) {
        toast.error('Please select a variant first');
        return;
      }

      // Log the data being sent
      console.log('Sending to backend:', {
        productId,
        quantity,
        variantId: selectedVariant._id,
        variantName: selectedVariant.itemName,
        variantPrice: selectedVariant.price
      });

      const response = await fetch(SummaryApi.addToCartWithVariant.url, {
        method: SummaryApi.addToCartWithVariant.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId,
          quantity,
          variantId: selectedVariant._id,
          variantName: selectedVariant.itemName,
          variantPrice: selectedVariant.price
        })
      });

      const responseData = await response.json();
      console.log('Backend Response:', responseData);

      if (responseData.success) {
        toast.success(responseData.message);
        fetchUserAddToCart();
      } else {
        toast.error(responseData.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to Cart Error:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleAddToCart = async (e, id) => {
    e.preventDefault();
    
    if (data?.category === "rent") {
      await addToCartWithVariant(e, id);
    } else if (data?.category === "catering") {
      if (!currentConfiguration) {
        toast.error('Please configure your platter before adding to cart');
        setIsConfigModalOpen(true);
        return;
      }
      await addToCartWithConfig(id, quantity, currentConfiguration);
    } else {
      // Use regular addToCart for other categories
      await addToCart(e, id, quantity);
      fetchUserAddToCart();
    }
  };

  const handleBuyProduct = async (e, id) => {
    e.preventDefault();
    
    if (data?.category === "rent") {
      await addToCartWithVariant(e, id);
    } else if (data?.category === "catering") {
      if (!currentConfiguration) {
        toast.error('Please configure your platter before proceeding');
        setIsConfigModalOpen(true);
        return;
      }
      await addToCartWithConfig(id, quantity, currentConfiguration);
    } else {
      await addToCart(e, id, quantity);
      fetchUserAddToCart();
    }
    navigate("/cart");
  };

  // Optional: Log whenever configuration changes
  useEffect(() => {
    if (currentConfiguration) {
      console.log('Current Configuration State:', currentConfiguration);
    }
  }, [currentConfiguration]);

  const handleImageHover = (index) => {
    setActiveImageIndex(index);
  };

  // Function to handle description display
  const renderDescription = (description) => {
    if (!description) return null;

    const lines = description.split('\n');
    const fullText = lines.join('\n');
    
    if (fullText.length <= maxLength || showFullDescription) {
      // Show full description
      return (
        <div className='text-black dark:text-white space-y-2'>
          {lines.map((line, index) => (
            line.trim() && (
              <p key={index} className={`${line.startsWith('•') ? 'pl-4' : ''}`}>
                {line}
              </p>
            )
          ))}
        </div>
      );
    } else {
      // Show truncated description
      const truncatedText = fullText.slice(0, maxLength);
      const lastSpaceIndex = truncatedText.lastIndexOf(' ');
      const displayText = truncatedText.slice(0, lastSpaceIndex);
      
      return (
        <div className='text-black dark:text-white'>
          <div className='space-y-2'>
            {displayText.split('\n').map((line, index) => (
              line.trim() && (
                <p key={index} className={`${line.startsWith('•') ? 'pl-4' : ''}`}>
                  {line}
                </p>
              )
            ))}
          </div>
          <span className='text-gray-500'>...</span>
        </div>
      );
    }
  };

  const handleConfigureClick = () => {
    setIsConfigModalOpen(true);
  };

  // Handle variant selection
  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setActiveImages(variant.images || []);
    setActiveImageIndex(0); // Reset to first image when variant changes
  };

  const renderRatingStars = () => {
    const fullStars = Math.floor(productRating.avgRating);
    const hasHalfStar = productRating.avgRating % 1 !== 0;

    return (
      <div className='flex items-center gap-2 mb-6'>
        <div className='flex items-center gap-1 text-yellow-400'>
          {[...Array(5)].map((_, index) => {
            if (index < fullStars) {
              return <FaStar key={index} className="w-5 h-5" />;
            } else if (index === fullStars && hasHalfStar) {
              return <FaStarHalf key={index} className="w-5 h-5" />;
            } else {
              return <FaStar key={index} className="w-5 h-5 text-gray-300" />;
            }
          })}
        </div>
        <span className="text-sm text-gray-600">
          ({productRating.totalRatings} {productRating.totalRatings === 1 ? 'review' : 'reviews'})
        </span>
      </div>
    );
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMagnifierPosition({ x, y });
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 p-6'>
            {/* Left: Image Gallery Section */}
            <div className='space-y-4'>
              {/* Main Image Display - Fixed size */}
              <div className='relative'>
                {/* Main Image Container */}
                <div 
                  className='w-[500px] h-[500px] rounded-2xl overflow-hidden bg-gray-50 relative cursor-crosshair'
                  onMouseEnter={() => setShowMagnifier(true)}
                  onMouseLeave={() => setShowMagnifier(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img
                    src={activeImages[activeImageIndex]}
                    className='w-full h-full object-contain p-4'
                    alt="Active product"
                  />
                </div>

                {/* Magnified Preview */}
                {showMagnifier && (
                  <div 
                    className="absolute top-0 -right-[520px] w-[500px] h-[500px] 
                      border-2 border-gray-200 rounded-2xl overflow-hidden bg-white 
                      shadow-xl pointer-events-none"
                  >
                    <div
                      style={{
                        backgroundImage: `url(${activeImages[activeImageIndex]})`,
                        backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '250%',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Thumbnail Images - Fixed size */}
              <div className='flex gap-3 overflow-x-auto pb-2 px-1'>
                {!loading && activeImages.map((imgURL, index) => (
                  <button
                    key={index}
                    onMouseEnter={() => handleImageHover(index)}
                    className={`flex-none w-[80px] h-[80px] rounded-lg overflow-hidden 
                      ${activeImageIndex === index 
                        ? 'ring-2 ring-red-600 ring-offset-2' 
                        : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                      } transition-all duration-200`}
                  >
                    <img
                      src={imgURL}
                      className='w-full h-full object-contain p-2'
                      alt={`Thumbnail ${index}`}
                    />
                  </button>
                ))}
              </div>

              {/* Product Highlights Section */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {/* Delivery Info */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Fast Delivery</h4>
                      <p className="text-sm text-gray-600">on the deliver date</p>
                    </div>
                  </div>
                </div>

                {/* Quality Guarantee */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Quality Assured</h4>
                      <p className="text-sm text-gray-600">100% Guarantee</p>
                    </div>
                  </div>
                </div>

                {/* Customer Support */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-100">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">24/7 Support</h4>
                      <p className="text-sm text-gray-600">Always Available</p>
                    </div>
                  </div>
                </div>

                {/* Secure Payment */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-yellow-100">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Secure Payment</h4>
                      <p className="text-sm text-gray-600">100% Safe</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Product Details */}
            <div className='flex flex-col'>
              {/* Brand Link with Store Icon */}
              <Link 
                to={`/vendor/${data?.brandName}`} 
                className='inline-flex items-center px-3 py-1.5 rounded-full 
                  bg-red-50 hover:bg-red-100 transition-colors duration-200
                  border border-red-100 hover:border-red-200 group w-fit mb-3'
              >
                <FaStore className="w-4 h-4 text-red-600 mr-2" />
                <span className='text-red-600 font-medium text-sm group-hover:text-red-700'>
                  {data?.brandName}
                </span>
                <svg className='w-4 h-4 ml-1.5 text-red-500 group-hover:translate-x-0.5 transition-transform' 
                  fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                </svg>
              </Link>

              {/* Product Name and Category */}
              <h2 className='text-3xl font-bold text-gray-900 mb-2'>{data?.productName}</h2>
              <p className='capitalize text-gray-500 mb-4'>{data?.category}</p>

              {/* Rating Stars */}
              {renderRatingStars()}

              {/* Rental Variants Section */}
              {data?.category === "rent" && data?.rentalVariants && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Available Options:</h3>
                  <div className="flex flex-wrap gap-3">
                    {data.rentalVariants.map((variant, index) => (
                      <button
                        key={index}
                        onClick={() => handleVariantSelect(variant)}
                        className={`
                          px-4 py-2 rounded-lg border-2 transition-all duration-200
                          ${selectedVariant?._id === variant._id 
                            ? 'border-red-600 bg-red-50 text-red-600' 
                            : 'border-gray-300 hover:border-red-600 hover:bg-red-50'
                          }
                        `}
                      >
                        <div className="text-left">
                          <p className="font-medium">{variant.itemName}</p>
                          <p className="text-sm text-gray-600">{displayINRCurrency(variant.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Display */}
              <div className='mb-6'>
                {data?.category === "rent" ? (
                  selectedVariant && (
                    <p className='text-3xl font-bold text-red-600'>{displayINRCurrency(selectedVariant.price)}</p>
                  )
                ) : (
                  <p className='text-3xl font-bold text-red-600'>{displayINRCurrency(data.price)}</p>
                )}
              </div>

              {/* Quantity Input */}
              {["catering", "rent", "bakers"].includes(data?.category) && (
                <div className='mb-6'>
                  <div className='flex flex-col gap-2'>
                    <label htmlFor='quantity' className='font-medium text-slate-600'>Quantity</label>
                    <input
                      type='number'
                      id='quantity'
                      value={quantity}
                      min="1"
                      max={data?.category === "rent" ? selectedVariant?.stock : undefined}
                      onChange={(e) => setQuantity(e.target.value)}
                      className='border border-slate-400 p-2 rounded w-24'
                    />
                    {data?.category === "rent" && selectedVariant && (
                      <p className="text-sm text-gray-600">
                        Available Stock: {selectedVariant.stock}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons with Icons */}
              <div className='grid grid-cols-1 gap-4 mb-8'>
                {data?.category === "catering" && (
                  <button
                    onClick={handleConfigureClick}
                    className='w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white 
                      px-6 py-3.5 rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 
                      transition-all duration-200 flex items-center justify-center gap-3 
                      shadow-sm hover:shadow-md'
                  >
                    <MdRestaurantMenu className="w-5 h-5" />
                    Configure Your Platter
                  </button>
                )}
                
                <div className='grid grid-cols-2 gap-4'>
                  <button
                    onClick={(e) => handleBuyProduct(e, data?._id)}
                    disabled={data?.category === "rent" && !selectedVariant}
                    className='w-full bg-blue-600 text-white px-6 py-3.5 rounded-xl 
                      font-medium hover:bg-blue-700 transition-all duration-200 
                      flex items-center justify-center gap-3 shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <BsCalendarCheck className="w-5 h-5" />
                    Book Now
                  </button>

                  <button
                    onClick={(e) => handleAddToCart(e, data?._id)}
                    disabled={data?.category === "rent" && !selectedVariant}
                    className='w-full bg-green-600 text-white px-6 py-3.5 rounded-xl 
                      font-medium hover:bg-green-700 transition-all duration-200 
                      flex items-center justify-center gap-3 shadow-sm hover:shadow-md
                      disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    Add To Cart
                  </button>
                </div>
              </div>

              {/* Description Section */}
              <div className='border-t border-gray-100 pt-6'>
                <div>
                  <p className='text-slate-600 font-medium my-1 dark:text-white'>Description:</p>
                  {renderDescription(data?.description)}
                  
                  {/* Show More/Less Button */}
                  {data?.description && data.description.length > maxLength && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className='text-red-600 hover:text-red-700 font-medium mt-2 flex items-center gap-1'
                    >
                      {showFullDescription ? 'Show Less' : 'Show More'}
                      <svg 
                        className={`w-4 h-4 transform transition-transform ${showFullDescription ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews and Ratings Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 mt-10">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Ratings & Reviews</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left: Overall Rating */}
              <div className="md:col-span-3 flex flex-col items-center justify-center border-r border-gray-100">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {productRating.avgRating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1 text-yellow-400 mb-2">
                  {[...Array(5)].map((_, index) => (
                    <FaStar key={index} className={`w-5 h-5 ${
                      index < Math.floor(productRating.avgRating) 
                        ? 'text-yellow-400' 
                        : index === Math.floor(productRating.avgRating) && productRating.avgRating % 1 !== 0
                        ? 'text-yellow-400' 
                        : 'text-gray-300'
                    }`} />
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  Based on {productRating.totalRatings} reviews
                </div>
              </div>

              {/* Right: Rating Distribution */}
              <div className="md:col-span-9">
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratingStats[stars] || 0;
                    const percentage = productRating.totalRatings 
                      ? (count / productRating.totalRatings) * 100 
                      : 0;
                    
                    return (
                      <div key={stars} className="flex items-center gap-4">
                        <div className="flex items-center gap-1 w-24">
                          <span className="text-sm font-medium text-gray-700">
                            {stars}
                          </span>
                          <FaStar className="w-4 h-4 text-yellow-400" />
                        </div>
                        
                        <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        
                        <div className="w-16 text-sm text-gray-500">
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="mt-12 border-t border-gray-100 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 
                    text-white rounded-lg hover:from-blue-700 hover:to-blue-800 
                    transition-colors shadow-sm hover:shadow-md"
                >
                  Write a Review
                </button>
              </div>
              
              {/* Individual Reviews */}
              <div className="space-y-6">
                {data?.data?.map((review, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Catering Configuration Modal */}
        {isConfigModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">{data?.productName}</h2>
                  <p className="text-gray-600">Configure your catering preferences</p>
                </div>
                <button 
                  onClick={() => setIsConfigModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              {/* Catering Content */}
              <div className="mt-6">
                {/* Course Type Header */}
                <div className="text-center mb-8">
                  <span className="bg-blue-100 text-blue-800 text-xl font-semibold px-6 py-2 rounded-full">
                    {data?.catering?.courseType} Course Meal
                  </span>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {data?.catering?.courses?.map((course, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                      {/* Course Header */}
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {course.courseName}
                        </h3>
                      </div>

                      {/* Dropdown with Radio Buttons and Scrollbar */}
                      <details className="group">
                        <summary className="flex justify-between items-center p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100">
                          <span className="font-medium text-gray-700">Select {course.courseName}</span>
                          <svg 
                            className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="mt-2 p-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          <div className="space-y-2">
                            {course.dishes.map((dish, dishIndex) => (
                              <label 
                                key={dishIndex}
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedDishes[course.courseType]?.includes(dish)}
                                  onChange={(e) => {
                                    setSelectedDishes(prev => ({
                                      ...prev,
                                      [course.courseType]: e.target.checked
                                        ? [...(prev[course.courseType] || []), dish]
                                        : prev[course.courseType].filter(d => d !== dish)
                                    }));
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-gray-700">{dish}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer with Selected Items */}
              <div className="mt-8 border-t pt-4">
                {/* Show Selected Items */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Your Selection:</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedDishes).map(([courseType, dishes]) => {
                      // Define colors based on course type
                      let colorClasses = {
                        horsOeuvre: "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200",
                        mainCourse: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
                        dessert: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
                        starter: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
                        soup: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
                        salad: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200",
                        beverage: "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200"
                      }[courseType] || "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";

                      return (
                        <div key={courseType}>
                          <span className="font-medium text-gray-700">{courseType}:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {Array.isArray(dishes) && dishes.length > 0 ? (
                              dishes.map((dish, index) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm
                                    border transition-colors ${colorClasses}`}
                                >
                                  {dish}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500 italic">
                                No dishes selected
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setIsConfigModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfigurationSave}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Confirm Selection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Products Section */}
        {data.category && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <CategroyWiseProductDisplay category={data?.category} heading={"Recommended Products"} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;
