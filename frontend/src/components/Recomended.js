import React, { useState, useEffect } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { IoStar, IoStarHalf, IoStarOutline } from 'react-icons/io5';
import SummaryApi from '../common';
import { useNavigate } from 'react-router-dom';
import displayINRCurrency from '../helpers/displayCurrency';

const Recomended = () => {
  const [orders, setOrders] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [productRatings, setProductRatings] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserDetails();
    fetchRatings();
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

      if (!response.ok) throw new Error('Failed to fetch orders');

      const data = await response.json();
      console.log('Fetched Orders:', data);
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid order data format');
      }

      // Filter orders for current user
      const userOrders = data.data.filter(order => order.userEmail === userEmail);
      console.log('User Orders:', userOrders);
      setOrders(userOrders);

      // If we have orders, analyze immediately
      if (userOrders.length > 0) {
        const preferences = analyzeUserPreferences(userOrders);
        console.log('User Preferences:', preferences);
        await fetchRecommendedProducts(preferences);
      } else {
        // If no orders, fetch some default products
        await fetchDefaultRecommendations();
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
      setLoading(false);
    }
  };

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

      const data = await response.json();
      console.log('Fetched ratings:', data);

      if (Array.isArray(data?.data)) {
        const ratingsMap = {};
        data.data.forEach(rating => {
          const productId = rating.productId;
          if (!ratingsMap[productId]) {
            ratingsMap[productId] = {
              totalRating: 0,
              count: 0
            };
          }
          ratingsMap[productId].totalRating += parseFloat(rating.rating);
          ratingsMap[productId].count += 1;
        });

        // Calculate average ratings
        Object.keys(ratingsMap).forEach(productId => {
          ratingsMap[productId].average = 
            ratingsMap[productId].totalRating / ratingsMap[productId].count;
        });

        console.log('Processed ratings:', ratingsMap);
        setProductRatings(ratingsMap);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const renderRating = (productId) => {
    console.log('Rendering rating for product:', productId);
    console.log('Available ratings:', productRatings);

    const rating = productRatings[productId];
    if (!rating) {
      console.log('No rating found for product:', productId);
      return null;
    }

    const averageRating = rating.average;
    const reviewCount = rating.count;
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => {
            if (index < fullStars) {
              return (
                <IoStar 
                  key={index}
                  className="w-3.5 h-3.5 text-yellow-400"
                />
              );
            } else if (index === fullStars && hasHalfStar) {
              return (
                <IoStarHalf 
                  key={index}
                  className="w-3.5 h-3.5 text-yellow-400"
                />
              );
            } else {
              return (
                <IoStarOutline 
                  key={index}
                  className="w-3.5 h-3.5 text-yellow-400"
                />
              );
            }
          })}
        </div>
        <span className="text-xs text-gray-500">
          ({reviewCount})
        </span>
      </div>
    );
  };

  // Enhanced getTagStyle function with more colors
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

  // Enhanced recommendation reasons generator
  const getRecommendationReasons = (product) => {
    const reasons = ['Popular product']; // Default reason

    // Add category-based reason
    if (product.category?.toLowerCase() === 'rent') {
      reasons.push('Top rental choice');
    } else if (product.category?.toLowerCase() === 'catering') {
      reasons.push('Trending in catering');
    }

    // Add rating-based reason
    if (product.rating >= 4.5) {
      reasons.push('Highly rated');
    } else if (product.rating >= 4.0) {
      reasons.push('Well reviewed');
    }

    // Add price-based reason
    if (product.price <= 1000) {
      reasons.push('Budget friendly');
    } else if (product.price >= 5000) {
      reasons.push('Premium choice');
    }

    // Add brand-based reason
    if (product.brandName) {
      reasons.push(`Top ${product.brandName} product`);
    }

    // Return 3 random reasons from the array
    return reasons
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
  };

  const analyzeUserPreferences = (orders) => {
    const preferences = {
      categories: {},
      brands: {},
      priceRanges: {},
      totalSpent: 0,
      orderCount: 0
    };

    // Skip cancelled orders
    orders.filter(order => order.status !== 'Cancelled').forEach(order => {
      preferences.orderCount++;
      
      order.products?.forEach(product => {
        if (!product) return;

        // Analyze categories
        if (product.category) {
          const category = product.category.toLowerCase();
          preferences.categories[category] = (preferences.categories[category] || 0) + 1;
        }

        // Analyze brands
        if (product.brandName) {
          preferences.brands[product.brandName] = (preferences.brands[product.brandName] || 0) + 1;
        }

        // Analyze price ranges
        const price = product.price * product.quantity;
        preferences.totalSpent += price;
        const priceRange = getPriceRange(price);
        preferences.priceRanges[priceRange] = (preferences.priceRanges[priceRange] || 0) + 1;
      });
    });

    // Calculate percentages and sort preferences
    const totalOrders = preferences.orderCount;
    if (totalOrders > 0) {
      Object.keys(preferences.categories).forEach(category => {
        preferences.categories[category] = (preferences.categories[category] / totalOrders) * 100;
      });
    }

    console.log('Analyzed Preferences:', preferences);
    return preferences;
  };

  const getPriceRange = (price) => {
    if (!price) return 'unknown';
    if (price <= 1000) return 'budget';
    if (price <= 5000) return 'mid-range';
    return 'premium';
  };

  const fetchRecommendedProducts = async (preferences) => {
    try {
      const response = await fetch(SummaryApi.allProduct.url, {
        method: SummaryApi.allProduct.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch products');
      const dataResponse = await response.json();
      const allProducts = dataResponse?.data || [];

      // Get user's purchased categories
      const purchasedCategories = Object.keys(preferences.categories).filter(
        category => preferences.categories[category] > 0
      );

      console.log('Purchased Categories:', purchasedCategories);

      // Filter products to only include items from purchased categories
      const relevantProducts = allProducts.filter(product => 
        purchasedCategories.includes(product.category?.toLowerCase())
      );

      // Score and filter products
      const scoredProducts = relevantProducts.map(product => {
        let score = 0;
        let matchReasons = [];

        const productCategory = product.category?.toLowerCase();
        const categoryPreference = preferences.categories[productCategory] || 0;

        // Only score products from categories user has purchased
        if (categoryPreference > 0) {
          score += categoryPreference * 3;
          matchReasons.push(`Based on your ${productCategory} purchases`);

          // Brand matching within same category
          if (preferences.brands[product.brandName]) {
            score += 2;
            matchReasons.push(`From a brand you trust`);
          }

          // Price range matching within same category
          const priceRange = getPriceRange(product.price);
          if (preferences.priceRanges[priceRange]) {
            score += 1;
            matchReasons.push(`Within your preferred price range`);
          }

          // Rating boost for products in purchased categories
          if (product.rating >= 4.5) {
            score += 0.5;
            matchReasons.push('Highly rated');
          }
        }

        return {
          ...product,
          score,
          matchReasons
        };
      });

      // Sort and filter recommendations
      let recommendedProducts = scoredProducts
        .filter(product => product.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      // If we don't have enough recommendations, add more from the same categories
      if (recommendedProducts.length < 6) {
        const remainingProducts = relevantProducts
          .filter(product => !recommendedProducts.find(rec => rec._id === product._id))
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6 - recommendedProducts.length)
          .map(product => ({
            ...product,
            score: 0.1,
            matchReasons: [`More from ${product.category}`]
          }));

        recommendedProducts = [...recommendedProducts, ...remainingProducts];
      }

      console.log('Final Recommendations:', recommendedProducts);
      setRecommendedProducts(recommendedProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setLoading(false);
    }
  };

  // Update the default recommendations to show popular products if no order history
  const fetchDefaultRecommendations = async () => {
    try {
      const response = await fetch(SummaryApi.allProduct.url, {
        method: SummaryApi.allProduct.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch products');
      
      const dataResponse = await response.json();
      const allProducts = dataResponse?.data || [];
      
      // Get highly rated products
      const popularProducts = allProducts
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6)
        .map(product => ({
          ...product,
          matchReasons: ['Popular product', 'Highly rated']
        }));

      setRecommendedProducts(popularProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching default recommendations:', error);
      setLoading(false);
    }
  };

  const handleProductClick = (e, productId) => {
    e.preventDefault();
    navigate(`/product/${productId}`);
  };

  // Updated rental price range function to match AdminProductCard
  const getRentalPriceRange = (product) => {
    if (!product.rentalVariants || product.rentalVariants.length === 0) {
      return "Price not available";
    }

    const prices = product.rentalVariants.map(item => item.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `${displayINRCurrency(minPrice)}/day`;
    }

    return `${displayINRCurrency(minPrice)} - ${displayINRCurrency(maxPrice)}/day`;
  };

  // Helper function to get the display price
  const getDisplayPrice = (product) => {
    if (product.category?.toLowerCase() === 'rent') {
      return getRentalPriceRange(product);
    }
    return displayINRCurrency(product.price);
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
      
      <div className="relative">
        <button
          onClick={(e) => {
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

        <button
          onClick={(e) => {
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

        <div 
          id="recommendedScroll"
          className="flex overflow-x-auto gap-4 scroll-smooth scrollbar-hide px-4"
          style={{ scrollBehavior: 'smooth' }}
        >
          {recommendedProducts.map((product) => (
            <div 
              key={product._id}
              onClick={(e) => handleProductClick(e, product._id)}
              className="flex-none w-[280px] group bg-white rounded-xl overflow-hidden border 
                border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all 
                duration-300 cursor-pointer relative"
            >
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
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    <h3 className="font-medium text-gray-800 group-hover:text-blue-600 
                      transition-colors duration-200 truncate">
                      {product.productName}
                    </h3>
                    {renderRating(product._id)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                      {product.brandName}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600 capitalize">
                      {product.category}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-green-600">
                        {getDisplayPrice(product)}
                      </p>
                      {product.category?.toLowerCase() === 'rent' && product.rentalVariants?.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {product.rentalVariants.length} duration {product.rentalVariants.length === 1 ? 'option' : 'options'}
                        </p>
                      )}
                    </div>
                    <span className="text-blue-600 opacity-0 group-hover:opacity-100 
                      transition-opacity duration-200 text-xs">
                      View Details →
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {product.matchReasons?.slice(0, 3).map((reason, index) => {
                      const tagStyle = getTagStyle(index);
                      return (
                        <span 
                          key={index}
                          className={`inline-flex items-center ${tagStyle.bg} ${tagStyle.text} 
                            text-xs px-2 py-1 rounded-full border ${tagStyle.border} ${tagStyle.hover}
                            transition-colors duration-200 truncate max-w-[130px]`}
                        >
                          {reason}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
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
