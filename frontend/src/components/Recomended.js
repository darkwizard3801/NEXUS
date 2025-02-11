import React, { useState, useEffect, useRef } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import SummaryApi from '../common';

const Recomended = () => {
  const [orders, setOrders] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const userDetailsResponse = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const userDetailsData = await userDetailsResponse.json();
      if (userDetailsData.success) {
        setUserDetails(userDetailsData.data);
        fetchOrders(userDetailsData.data.email);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details');
      setLoading(false);
    }
  };

  const fetchOrders = async (userEmail) => {
    try {
      const response = await fetch(SummaryApi.orderDetails.url, {
        method: SummaryApi.orderDetails.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      console.log('Fetched Orders:', data);
      
      // Filter orders for current user
      const userOrders = data.data
        .filter(order => order.userEmail === userEmail);
      
      console.log('User Orders:', userOrders);
      setOrders(userOrders);

      // If we have orders, analyze immediately
      if (userOrders.length > 0) {
        const preferences = analyzeUserPreferences(userOrders);
        console.log('User Preferences:', preferences);
        fetchRecommendedProducts(preferences);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const analyzeUserPreferences = (orders) => {
    const categoryPreferences = {};
    const priceRanges = {};
    const vendorPreferences = {};
    let totalOrders = 0;

    orders.forEach(order => {
      if (order.status === 'Cancelled') return; // Skip cancelled orders

      order.products?.forEach(product => {
        if (!product) return;
        totalOrders++;

        // Get category - directly from product
        if (product.category) {
          const category = product.category.toLowerCase();
          categoryPreferences[category] = (categoryPreferences[category] || 0) + 1;
        }

        // Get price range from the actual price
        const priceRange = getPriceRange(product.price * product.quantity);
        priceRanges[priceRange] = (priceRanges[priceRange] || 0) + 1;

        // Get vendor
        if (product.vendor) {
          vendorPreferences[product.vendor] = (vendorPreferences[product.vendor] || 0) + 1;
        }

        // Special handling for rental products with variants
        if (product.additionalDetails?.rental) {
          if (!categoryPreferences['rent']) {
            categoryPreferences['rent'] = 0;
          }
          categoryPreferences['rent'] += 1;
        }
      });
    });

    console.log('Refined Analysis:', {
      categoryPreferences,
      priceRanges,
      vendorPreferences,
      totalOrders
    });

    return {
      categoryPreferences,
      priceRanges,
      vendorPreferences,
      totalOrders
    };
  };

  const getPriceRange = (price) => {
    if (!price) return 'unknown';
    if (price <= 1000) return 'budget';
    if (price <= 5000) return 'mid-range';
    return 'premium';
  };

  const fetchRecommendedProducts = async (preferences) => {
    try {
      // Use the allProduct endpoint
      const response = await fetch(SummaryApi.allProduct.url, {
        method: SummaryApi.allProduct.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch products');
      const dataResponse = await response.json();
      const allProducts = dataResponse?.data || [];

      console.log('All Products:', allProducts.length);
      console.log('User Preferences:', preferences);

      const scoredProducts = allProducts.map(product => {
        let score = 0;
        let matchReasons = [];

        // Category matching
        const productCategory = product.category?.toLowerCase();
        const hasMatchingCategory = preferences.categoryPreferences[productCategory];
        
        if (hasMatchingCategory) {
          score += 5;
          matchReasons.push(`Similar to your ${productCategory} purchases`);
        }

        // Price range matching
        const productPriceRange = getPriceRange(product.price);
        if (preferences.priceRanges[productPriceRange]) {
          score += 3;
          matchReasons.push(`Within your preferred price range`);
        }

        // Vendor matching
        if (preferences.vendorPreferences[product.vendorEmail]) {
          score += 2;
          matchReasons.push(`From a seller you've purchased from`);
        }

        // Special handling for rental products
        if (preferences.categoryPreferences['rent'] && productCategory === 'rent') {
          score *= 1.2; // 20% boost for rentals
          if (!matchReasons.includes('Similar to your rental purchases')) {
            matchReasons.push('Similar to your rental purchases');
          }
        }

        return {
          ...product,
          score,
          matchReasons
        };
      });

      // Split recommendations into matched and discovery
      const matchedProducts = scoredProducts
        .filter(product => product.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      // Get discovery products (different categories, highly rated)
      const userCategories = new Set(Object.keys(preferences.categoryPreferences));
      const discoveryProducts = scoredProducts
        .filter(product => {
          const category = product.category?.toLowerCase();
          return category && !userCategories.has(category);
        })
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 2)
        .map(product => ({
          ...product,
          matchReasons: ['Discover something new']
        }));

      const recommendations = [...matchedProducts, ...discoveryProducts];
      
      console.log('Final Recommendations:', recommendations);
      setRecommendedProducts(recommendations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setLoading(false);
    }
  };

  // Add this function at the top of your component to get different colors for tags
  const getTagStyle = (index) => {
    const styles = [
      { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', hover: 'group-hover:bg-blue-100' },
      { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', hover: 'group-hover:bg-purple-100' },
      { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', hover: 'group-hover:bg-green-100' },
      { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-100', hover: 'group-hover:bg-pink-100' },
      { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100', hover: 'group-hover:bg-orange-100' },
    ];
    return styles[index % styles.length];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="text-center text-gray-500 p-4">
        Please log in to view recommendations
      </div>
    );
  }

  if (recommendedProducts.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        Start shopping to get personalized recommendations!
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recommended for You</h2>
      
      {/* Added relative container for absolute positioning of arrows */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => {
            const container = document.getElementById('recommendedScroll');
            container.scrollLeft -= container.offsetWidth - 100;
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10
            p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 
            hover:border-gray-300 transition-all duration-200 flex items-center justify-center
            shadow-md hover:shadow-lg"
          aria-label="Scroll left"
        >
          <IoIosArrowBack className="w-6 h-6 text-gray-600" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => {
            const container = document.getElementById('recommendedScroll');
            container.scrollLeft += container.offsetWidth - 100;
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10
            p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 
            hover:border-gray-300 transition-all duration-200 flex items-center justify-center
            shadow-md hover:shadow-lg"
          aria-label="Scroll right"
        >
          <IoIosArrowForward className="w-6 h-6 text-gray-600" />
        </button>

        {/* Scrollable container with padding for arrows */}
        <div 
          id="recommendedScroll"
          className="flex overflow-x-auto gap-4 scroll-smooth scrollbar-hide px-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {recommendedProducts.map((product) => (
            <a 
              key={product._id}
              href={`/product/${product._id}`}
              className="flex-none w-[280px] group bg-white rounded-xl overflow-hidden border 
                border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all 
                duration-300 cursor-pointer relative"
            >
              {/* Image Container */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={product.productImage?.[0] || 'https://via.placeholder.com/150'}
                  alt={product.productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150';
                  }}
                />
                {product.category?.toLowerCase() === 'rent' && (
                  <span className="absolute top-2 right-2 bg-blue-500/90 text-white px-2 py-0.5 
                    rounded-full text-xs font-medium backdrop-blur-sm">
                    Rental
                  </span>
                )}
              </div>

              {/* Content Container */}
              <div className="p-4">
                {/* Product Info */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800 group-hover:text-blue-600 
                      transition-colors duration-200 truncate">
                      {product.productName}
                    </h3>
                    {product.rating && (
                      <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded-full">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-xs font-medium text-yellow-700">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 truncate">{product.brandName}</p>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-green-600">₹{product.price}</p>
                    <span className="text-blue-600 opacity-0 group-hover:opacity-100 
                      transition-opacity duration-200 text-xs">
                      View →
                    </span>
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.matchReasons?.slice(0, 2).map((reason, index) => {
                    const tagStyle = getTagStyle(index);
                    return (
                      <span 
                        key={index}
                        className={`inline-block ${tagStyle.bg} ${tagStyle.text} text-xs px-2 py-0.5 
                          rounded-full border ${tagStyle.border} ${tagStyle.hover}
                          transition-colors duration-200 truncate max-w-[120px]`}
                      >
                        {reason}
                      </span>
                    );
                  })}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Recomended;
