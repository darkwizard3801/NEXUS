import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import SummaryApi from '../common';
import displayINRCurrency from '../helpers/displayCurrency';
import CategroyWiseProductDisplay from '../components/CategoryWiseProductDisplay';
import addToCart from '../helpers/addToCart';
import Context from '../context';
import { FaStar, FaStarHalf } from "react-icons/fa";
import { toast } from 'react-toastify';

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
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState({ fullStars: 0, hasHalfStar: false }); // New state for rating
  const [showFullDescription, setShowFullDescription] = useState(false);
  const maxLength = 300; // Show first 300 characters initially
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState({});
  const [currentConfiguration, setCurrentConfiguration] = useState(null); // Store configuration here
  const [selectedVariant, setSelectedVariant] = useState(null);

  const { fetchUserAddToCart } = useContext(Context);
  const navigate = useNavigate();

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
    setActiveImage(dataResponse?.data?.productImage[0]);
    
    // Generate a random rating: 2, 3, or 4 full stars
    const randomFullStars = Math.floor(Math.random() * 3) + 2; // Generates 2, 3, or 4

    // Decide whether to include a half star or not (50% chance)
    const includeHalfStar = Math.random() < 0.5; // 50% chance to include half star

    setRating({ fullStars: randomFullStars, hasHalfStar: includeHalfStar });
  };

  useEffect(() => {
    fetchProductDetails();
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

  const handleImageHover = (img) => {
    setActiveImage(img);
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
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='min-h-[200px] flex flex-col lg:flex-row gap-4'>
        {/* Product Image */}
        <div className='h-96 flex flex-col lg:flex-row-reverse gap-4'>
          <div className='h-[300px] w-[300px] lg:h-96 lg:w-96 bg-slate-200 relative p-2 overflow-hidden'>
            <div className='relative w-full h-full overflow-hidden'>
              <img
                src={activeImage}
                className='h-full w-full object-cover transition-transform duration-300 transform hover:scale-125'
                alt="Active product"
              />
            </div>
          </div>
          <div className='h-full'>
            {
              loading ? (
                <div className='flex gap-2 lg:flex-col overflow-scroll scrollbar-none h-full'>
                  {/* Placeholder */}
                </div>
              ) : (
                <div className='flex gap-2 lg:flex-col overflow-scroll scrollbar-none h-full'>
                  {
                    data?.productImage?.map((imgURL, index) => (
                      <div 
                        className='h-20 w-20 bg-slate-200 rounded p-1' 
                        key={index}
                        onMouseEnter={() => handleImageHover(imgURL)} // Change image on hover
                      >
                        <img
                          src={imgURL}
                          className='w-full h-full object-scale-down mix-blend-multiply cursor-pointer'
                          alt={`Thumbnail ${index}`}
                        />
                      </div>
                    ))
                  }
                </div>
              )
            }
          </div>
        </div>

        {/* Product Details */}
        {
          loading ? (
            <div className='grid gap-1 w-full'>
              {/* Loading Skeleton */}
            </div>
          ) : (
            <div className='flex flex-col gap-1'>
              <Link to={`/vendor/${data?.brandName}`} className='bg-red-200 text-red-600 px-2 rounded-full inline-block w-fit'>
                {data?.brandName}
              </Link>
              <h2 className='text-2xl lg:text-4xl font-medium'>{data?.productName}</h2>
              <p className='capitalize text-slate-400'>{data?.category}</p>
              <div className='text-red-600 flex items-center gap-1'>
                {
                  // Render full stars based on random number
                  Array.from({ length: rating.fullStars }).map((_, index) => <FaStar key={index} />)
                }
                {/* Render half star if applicable */}
                {rating.hasHalfStar && <FaStarHalf />}
              </div>

              {/* Rental Variants Section */}
              {data?.category === "rent" && data?.rentalVariants && (
                <div className="mt-4 mb-2">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Available Options:</h3>
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

              {/* Price Display - Show selected variant price for rental items */}
              <div className='flex items-center gap-2 text-2xl lg:text-3xl font-medium my-1'>
                {data?.category === "rent" ? (
                  selectedVariant && (
                    <p className='text-red-600'>{displayINRCurrency(selectedVariant.price)}</p>
                  )
                ) : (
                  <p className='text-red-600'>{displayINRCurrency(data.price)}</p>
                )}
              </div>

              {/* Quantity Input */}
              {["catering", "rent", "bakers"].includes(data?.category) && (
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
              )}

              {/* Action Buttons */}
              <div className='flex items-center gap-3 my-2'>
                {data?.category === "catering" && (
                  <button
                    className='border-2 border-blue-600 rounded px-3 py-1 min-w-[160px] 
                      text-blue-600 font-medium hover:bg-blue-600 hover:text-white
                      transition-all duration-300'
                    onClick={handleConfigureClick}
                  >
                    Configure Your Platter
                  </button>
                )}
                
                <button
                  className='border-2 border-red-600 rounded px-3 py-1 min-w-[120px] 
                    text-red-600 font-medium hover:bg-red-600 hover:text-white
                    transition-all duration-300'
                  onClick={(e) => handleBuyProduct(e, data?._id)}
                  disabled={data?.category === "rent" && !selectedVariant}
                >
                  Book Now
                </button>
                
                <button
                  className='border-2 border-red-600 rounded px-3 py-1 min-w-[120px] 
                    font-medium text-white bg-red-600 hover:text-red-600 hover:bg-white
                    transition-all duration-300'
                  onClick={(e) => handleAddToCart(e, data?._id)}
                  disabled={data?.category === "rent" && !selectedVariant}
                >
                  Add To Cart
                </button>
              </div>

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
          )
        }
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

      {data.category && (
        <CategroyWiseProductDisplay category={data?.category} heading={"Recommended Products"} />
      )}
    </div>
  );
}

export default ProductDetails;
