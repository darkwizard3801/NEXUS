import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SummaryApi from '../common'; // Ensure this is the correct path to your API
import AdminProductCard from '../components/AdminProductCard'; // Component to display individual product
import { FaAngleRight, FaAngleLeft, FaStar, FaStarHalf, FaHeart, FaPlus, FaWhatsapp } from "react-icons/fa6";
import { FaRegHeart } from "react-icons/fa"; // Import icons for navigation, star icons, and heart icons
import addToCart from '../helpers/addToCart'; // Import addToCart function
import Context from '../context'; // Import context to access fetchUserAddToCart
import displayINRCurrency from '../helpers/displayCurrency'; // Import displayINRCurrency function
import { FaHeart as FaHeartIcon } from 'react-icons/fa'; // Import React icons for heart
import { AiOutlineMail } from 'react-icons/ai';
import { IoClose } from "react-icons/io5";
import { toast } from 'react-hot-toast';

const VendorPage = () => {
  const { vendorName } = useParams(); // Get the vendor name from the URL
  const navigate = useNavigate(); // Initialize useNavigate
  const [products, setProducts] = useState([]); // State to store all products
  const [filteredProducts, setFilteredProducts] = useState([]); // State to store filtered products
  const [loading, setLoading] = useState(true); // Loading state
  const [vendorEmail, setVendorEmail] = useState(""); // State to store vendor email
  const [banners, setBanners] = useState([]); // State to store banners
  const [loadingBanners, setLoadingBanners] = useState(true); // Loading state for banners
  const [error, setError] = useState(""); // State to store error messages
  const [currentImage, setCurrentImage] = useState(0); // State for current banner image
  const [currentProductImages, setCurrentProductImages] = useState({}); // State to track current image index for each product
  const { fetchUserAddToCart } = useContext(Context); // Access fetchUserAddToCart from context
  const [tagline, setTagline] = useState("");
  const [vendorDetails, setVendorDetails] = useState(null);
  const [displayVendorName, setDisplayVendorName] = useState(vendorName); // Add this state variable
  const [brandName, setBrandName] = useState("");
  const fullTagline = "Your one-stop shop for unforgettable events!"; // Tagline text
  const [liked, setLiked] = useState(false);
  const fontStyles = [
    "font-bold",               // Bold
    "font-extrabold",         // Extra Bold
    "font-light",             // Light
    "font-medium",            // Medium
    "font-semibold",          // Semibold
    "italic",                 // Italic
    "font-serif",             // Calligraphic (Serif)
    "font-sans",              // Modern (Sans-serif)
    "font-mono",              // Monospace
    "font-cursive"            // Cursive (if available in your CSS)
  ]; // Array of font styles
  const [currentFontStyle, setCurrentFontStyle] = useState(fontStyles[0]); // State for current font style
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [expandedImage, setExpandedImage] = useState(null);
  const [portfolioEvents, setPortfolioEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [likedImages, setLikedImages] = useState(new Set());
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userData, setUserData] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const testimonialsPerPage = 4;
  const testimonialBackgrounds = [
    "https://res.cloudinary.com/du8ogkcns/image/upload/v1737707121/images_3_bew0wk.jpg",
    "https://res.cloudinary.com/du8ogkcns/image/upload/v1737707121/download_5_zmwqki.jpg",
    "https://res.cloudinary.com/du8ogkcns/image/upload/v1737707122/istockphoto-517188688-1024x1024_ud9vni.jpg",
    "https://res.cloudinary.com/du8ogkcns/image/upload/v1737707121/images_2_yyvffo.jpg"
  ];

  // Automatic font style transition
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFontStyle(prev => {
        const currentIndex = fontStyles.indexOf(prev);
        return fontStyles[(currentIndex + 1) % fontStyles.length]; // Loop through font styles
      });
    }, 2000); // Change font style every 2 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  // Function to handle product card click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`); // Navigate to the product details page
  };

  // Fetch all products from the database
  const fetchAllProducts = async () => {
    try {
      const response = await fetch(SummaryApi.allProduct.url);
      const dataResponse = await response.json();
      console.log('Fetched products:', dataResponse);

      // Set all products
      setProducts(dataResponse?.data || []);

      // Filter products based on the vendor's email instead of brandName
      const vendorProducts = dataResponse?.data?.filter(product => product.user === vendorEmail);
      console.log('Filtered vendor products:', vendorProducts);
      setFilteredProducts(vendorProducts || []);

      // Set vendor email if not already set
      if (!vendorEmail && vendorProducts && vendorProducts.length > 0) {
        setVendorEmail(vendorProducts[0].user);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when component mounts or vendorEmail changes
  useEffect(() => {
    if (vendorEmail) {
      fetchAllProducts();
    }
  }, [vendorEmail]);

  // Function to fetch all users and filter vendor details
  const fetchVendorDetails = async () => {
    try {
      console.log("Fetching vendor details with email:", vendorEmail); // Debug log
      const fetchData = await fetch(SummaryApi.allUser.url, {
        method: SummaryApi.allUser.method,
        credentials: 'include'
      });

      const dataResponse = await fetchData.json();

      if (dataResponse.success) {
        // Find the vendor using vendorEmail
        const vendor = dataResponse.data.find(user => user.email === vendorEmail);
        if (vendor) {
          setVendorDetails(vendor);
          console.log("Found vendor details:", vendorDetails); // Debug log
          setBrandName(vendor.brandName || vendor.name || vendorName);
          setDisplayVendorName(vendor.brandName || vendor.name || vendorName);
        } else {
          console.log("No vendor found with email:", vendorEmail); // Debug log
        }
      }

      if (dataResponse.error) {
        toast.error(dataResponse.message);
      }
    } catch (error) {
      console.error('Error fetching vendor details:', error);
    }
  };

  // Fetch vendor details when vendorEmail is available
  useEffect(() => {
    console.log("vendorEmail changed to:", vendorEmail); // Debug log
    if (vendorEmail) {
      fetchVendorDetails();
    }
  }, [vendorEmail]);

  // Initial fetch to get vendor email from URL parameter
  useEffect(() => {
    const fetchVendorEmail = async () => {
      try {
        const response = await fetch(SummaryApi.allProduct.url);
        const dataResponse = await response.json();
        
        // Find the first product with matching brandName to get the vendor's email
        const vendorProduct = dataResponse?.data?.find(product => product.brandName === vendorName);
        if (vendorProduct) {
          setVendorEmail(vendorProduct.user);
          console.log("Found vendor email:", vendorProduct.user); // Debug log
        }
      } catch (error) {
        console.error('Error fetching vendor email:', error);
      }
    };

    fetchVendorEmail();
  }, [vendorName]);

  // Fetch all banners from the database
  const fetchBanners = async () => {
    try {
      setLoadingBanners(true); // Set loading state
      const response = await fetch(SummaryApi.Banner_view.url, {
        method: SummaryApi.Banner_view.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch banners');
      }

      const data = await response.json();
      console.log("All banners:", data);
      
      // Only set banners after filtering
      if (vendorEmail) {
        const approvedBanners = data.banners.filter(banner => 
          banner.status === 'approved' && banner.email === vendorEmail
        );
        console.log("Filtered banners:", approvedBanners);
        setBanners(approvedBanners);
      }
    } catch (error) {
      setError(error.message);
      console.error('Error loading banners:', error);
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    fetchAllProducts(); // Fetch products when the component mounts
    if (vendorEmail) {
      fetchBanners();
    }
  }, [vendorName, vendorEmail]); // Re-fetch if vendorName or vendorEmail changes

  // Debugging log to check filtered products
  // console.log('Filtered Products:', filteredProducts);

  // Automatic transition for banner images
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [currentImage, banners.length]);

  const nextImage = () => {
    if (banners.length - 1 > currentImage) {
      setCurrentImage(prev => prev + 1);
    } else {
      setCurrentImage(0); // Reset to first image
    }
  };

  const prevImage = () => {
    if (currentImage !== 0) {
      setCurrentImage(prev => prev - 1);
    } else {
      setCurrentImage(banners.length - 1); // Go to last image
    }
  };

  const renderDots = () => {
    return banners.map((_, index) => (
      <span
        key={index}
        className={`h-2 w-2 rounded-full mx-1 cursor-pointer transition-all duration-300 ease-in-out
          ${currentImage === index ? 'bg-white scale-125' : 'bg-white opacity-50'}`}
        onClick={() => setCurrentImage(index)}
      />
    ));
  };

  // Function to change the product image
  const nextProductImage = (productId) => {
    setCurrentProductImages(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  // Function to handle automatic image transitions for all products
  useEffect(() => {
    const intervals = filteredProducts.map((product, index) => {
      return setInterval(() => {
        nextProductImage(product._id); // Use _id for the product
      }, 3000 + index * 1000); // Change image every 3 seconds, staggered by 1 second for each product
    });

    return () => intervals.forEach(clearInterval); // Clear all intervals on component unmount
  }, [filteredProducts]);

  const handleAddToCart = async (e, productId) => {
    await addToCart(e, productId, 1); // Assuming quantity is 1 for simplicity
    fetchUserAddToCart(); // Update cart context or state
  };

  // Fix the typewriter effect
  useEffect(() => {
    setTagline(''); // Reset tagline
    let index = 0;
    const typeWriter = () => {
      if (index <= vendorDetails?.tagline.length) {  // Changed from < to <=
        setTagline(vendorDetails?.tagline.slice(0, index));  // Use slice instead of charAt
        index++;
        setTimeout(typeWriter, 100);
      }
    };
    if (vendorDetails?.tagline) {
      typeWriter();
    }
  }, [vendorDetails?.tagline]);

  const handleImageExpand = (image) => {
    setExpandedImage(image);
  };

  const handleCloseModal = () => {
    setExpandedImage(null);
  };

  // Add this function to fetch portfolio data
  const fetchPortfolioData = async () => {
    try {
      const response = await fetch(SummaryApi.get_portfolio.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: vendorEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      const result = await response.json();
      console.log("Complete portfolio data:", result);
      
      if (result.success && result.data) {
        setPortfolioEvents(result.data.portfolioEvents || []);
        // Set vendor details with correct property names
        setVendorDetails({
          tagline: result.data.tagline || "Your one-stop shop for unforgettable events!",
          aboutText: result.data.aboutText || "We are a leading vendor in the event management industry...",
          aboutFile: result.data.aboutFile || "https://eventsmanagementkerala.com/wp-content/uploads/elementor/thumbs/image-blog-qxci15yoopuxkqtd5kaej3ilh2bh487t7zjqt9i10s.webp"
        });
        // Update the tagline for the typewriter effect
        setTagline(""); // Reset tagline before starting new typewriter effect
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    }
  };

  useEffect(() => {
    console.log("vendorEmail changed to:", vendorEmail);
    if (vendorEmail) {
      fetchPortfolioData();
    }
  }, [vendorEmail]);

  const toggleEventExpansion = (eventNumber) => {
    setExpandedEvent(expandedEvent === eventNumber ? null : eventNumber);
  };

  // Function to handle individual image click in expanded state
  const handleImageClick = (event, file, fileIndex) => {
    if (expandedEvent === event.eventNumber) {
      // Only open modal if event is already expanded
      setExpandedImage({
        src: `data:${file.contentType};base64,${file.data}`,
        alt: `Portfolio Event ${event.eventNumber} Image ${fileIndex + 1}`
      });
    } else {
      toggleEventExpansion(event.eventNumber);
    }
  };

  const toggleLike = (imageSrc, e) => {
    e.stopPropagation(); // Prevent modal from closing
    setLikedImages(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(imageSrc)) {
        newLiked.delete(imageSrc);
      } else {
        newLiked.add(imageSrc);
      }
      return newLiked;
    });
  };

  const fetchCurrentUser = async () => {
    try {
      console.log('Fetching current user...'); // Debug log
      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const userData = await response.json();
      console.log('Current user data:', userData);
      if (userData.success && userData.data) {
        setUserData(userData.data); // Store all user data
        setUserEmail(userData.data.email);
        console.log('User data set:', userData.data);
      } else {
        console.error('Invalid user data format:', userData);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  useEffect(() => {
    console.log('UseEffect triggered - fetching user data');
    fetchCurrentUser();
  }, []);

  // Function to fetch testimonials
  const fetchTestimonials = async () => {
    try {
      console.log('Fetching testimonials for vendor:', vendorEmail); // Debug log
      const response = await fetch(SummaryApi.get_testimonial.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: vendorEmail })
      });

      const result = await response.json();
      console.log("Testimonials result:", result);
      if (result.success) {
        setTestimonials(result.data);
        console.log('Fetched testimonials:', result.data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  // Add useEffect to fetch testimonials when vendorEmail is available
  useEffect(() => {
    if (vendorEmail) {
      fetchTestimonials();
    }
  }, [vendorEmail]);

  // Add another useEffect to fetch testimonials after they're added
  useEffect(() => {
    console.log('Current testimonials:', testimonials);
  }, [testimonials]);

  // Update handleTestimonialSubmit to refresh testimonials after submission
  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!userData || !userEmail) {
        console.error('User data not available');
        return;
      }

      const testimonialData = {
        text: newTestimonial,
        userEmail: userEmail,
        userName: userData.name || 'Anonymous User',
        userProfile: userData.profilePic || null,
        timestamp: new Date().toISOString(),
        vendorEmail: vendorEmail
      };

      console.log('Submitting testimonial data:', testimonialData);

      const response = await fetch(SummaryApi.add_testimonial.url, {
        method: SummaryApi.add_testimonial.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testimonialData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit testimonial');
      }

      const result = await response.json();
      console.log('Testimonial submitted successfully:', result);

      // Reset form and close modal
      setNewTestimonial('');
      setShowTestimonialForm(false);
      
      // Fetch updated testimonials
      fetchTestimonials();
    } catch (error) {
      console.error('Error submitting testimonial:', error);
    }
  };

  const testimonialCards = [
    {
      name: userData?.name || "John Doe",
      date: new Date().toLocaleDateString(),
      testimonial: "Amazing experience! Highly recommend this vendor!",
      backgroundImage: "url('https://res.cloudinary.com/du8ogkcns/image/upload/v1737707121/images_3_bew0wk.jpg')",
      profileImage: userData?.profilePic || "path/to/default-profile-image.jpg"
    },
    // ... other testimonials ...
  ];

  // Add function to handle testimonial sliding
  const slideTestimonials = () => {
    setCurrentTestimonialIndex(prevIndex => {
      const nextIndex = prevIndex + testimonialsPerPage;
      return nextIndex >= testimonials.length ? 0 : nextIndex;
    });
  };

  // Add useEffect for automatic sliding
  useEffect(() => {
    if (testimonials.length > testimonialsPerPage) {
      const interval = setInterval(slideTestimonials, 5000); // Slide every 5 seconds
      return () => clearInterval(interval);
    }
  }, [testimonials.length]);

  // Function to group products by category
  const groupProductsByCategory = (products) => {
    return products.reduce((groups, product) => {
      const category = product.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
      return groups;
    }, {});
  };

  // Get grouped products
  const groupedProducts = groupProductsByCategory(filteredProducts);

  // Function to handle scrolling
  const scroll = (direction, categoryId) => {
    const container = document.getElementById(`scroll-container-${categoryId}`);
    if (container) {
      const scrollAmount = direction === 'left' ? -container.offsetWidth : container.offsetWidth;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Update WhatsApp click handler
  const handleWhatsAppClick = () => {
    if (!vendorDetails?.phoneNumber) {
      toast.error("Vendor's contact number is not available");
      return;
    }
    
    const message = `Hi, I'm interested in your products from ${brandName}'s store.`;
    const phoneNumber = vendorDetails.phoneNumber
    console.log("Phone number2 :", phoneNumber);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="w-full px-0 sm:container sm:mx-auto sm:p-4 relative">
      <h1 className={`text-4xl ${currentFontStyle} mb-2 text-center text-gradient`}>
        Welcome to {brandName}'s Store
      </h1>
      <h2 className="text-2xl font-light text-center text-gray-600">{tagline}</h2>
      
      {/* Banner Section */}
      {loadingBanners ? (
        <div className='relative h-[500px] w-full bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center'>
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {banners && banners.length > 0 ? (
            <div className='relative h-[500px] py-12 w-full bg-slate-200 rounded-xl overflow-hidden'>
              {/* Buttons for manual image control */}
              <div className='absolute z-10 h-full w-full items-center hidden md:flex justify-between'>
                <button onClick={prevImage} className='bg-white shadow-md rounded-full p-1'>
                  <FaAngleLeft />
                </button>
                <button onClick={nextImage} className='bg-white shadow-md rounded-full p-1'>
                  <FaAngleRight />
                </button>
              </div>

              {/* Banner images rendering with transition */}
              <div className=' h-full w-full overflow-hidden flex justify-center items-center'>
                {banners.map((banner, index) => (
                  <div
                    key={banner.id || index}
                    className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out
                      ${currentImage === index ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transition: 'opacity 1s ease-in-out' }}
                  >
                    <img 
                      src={banner.image} 
                      alt={banner.description} 
                      className='w-full h-full object-cover' 
                    />
                  </div>
                ))}
              </div>

              {/* Dots container */}
              <div className='absolute bottom-2 flex justify-center w-full'>
                {renderDots()}
              </div>
            </div>
          ) : (
            <div className='relative h-[500px] w-full bg-slate-200 rounded-xl overflow-hidden'>
              <img 
                src="default-banner.jpg" 
                alt="Default Banner" 
                className='w-full h-full object-cover' 
              />
            </div>
          )}
        </>
      )}
      
      <div className="mt-8 rounded-3xl mx-0 sm:mx-auto">
        <div className="bg-cover bg-center rounded-2xl relative" style={{ backgroundImage: `url('https://res.cloudinary.com/du8ogkcns/image/upload/v1737726667/images_4_gj4ltx.jpg')`, backgroundSize: 'cover' }}>
          <div className="bg-black bg-opacity-50 p-4 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-lg font-semibold text-white mb-2">At our company, we take pride in providing spotless customer service that goes above and beyond. Our dedicated team is here to assist you every step of the way.</p>
            <div className="flex items-center justify-center">
              <AiOutlineMail className="h-6 w-6 mr-2 text-white" />
              <a href={`mailto:${vendorEmail}`} className="text-blue-500 hover:underline text-white">{vendorEmail}</a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Products by Category */}
      <div className="mt-8 px-4">
        {Object.entries(groupedProducts).map(([category, products]) => (
          <div key={category} className="mb-12">
            {/* Category Header */}
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-bold text-black dark:text-white capitalize">
                {category}
              </h2>
              <div className="ml-4 h-0.5 flex-grow bg-gradient-to-r from-red-500 to-transparent"></div>
            </div>

            {/* Scrollable Products Row with Navigation Buttons */}
            <div className="relative group">
              {/* Left Arrow */}
              {products.length > 3 && (
                <button 
                  onClick={() => scroll('left', category)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-1/2"
                >
                  <FaAngleLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
              )}

              {/* Scroll Container - Removed pb-6 and added custom scrollbar hiding */}
              <div 
                id={`scroll-container-${category}`}
                className="flex overflow-x-auto gap-6 no-scrollbar scroll-smooth"
                style={{
                  msOverflowStyle: 'none',  /* IE and Edge */
                  scrollbarWidth: 'none',   /* Firefox */
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {products.map((product, index) => (
                  <div 
                    key={product._id || index}
                    className="flex-none w-72 border rounded-lg shadow-md transition-transform transform hover:scale-105 cursor-pointer bg-white dark:bg-gray-800 hover:shadow-xl"
                    onClick={() => handleProductClick(product._id)}
                  >
                    {/* Product Image */}
                    <div className="relative overflow-hidden rounded-t-lg h-48">
                      {product.productImage && product.productImage.length > 0 ? (
                        <img 
                          src={product.productImage[currentProductImages[product._id] % product.productImage.length]} 
                          alt={product.productName} 
                          className='w-full h-full object-cover transition-transform duration-300 transform hover:scale-110' 
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                          <p className="text-gray-500 dark:text-gray-400">No image</p>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-4 space-y-2">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                        {product.productName}
                      </h3>
                      <p className="text-base text-gray-600 dark:text-gray-300">
                        {displayINRCurrency(product.price)}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-4">
                        <button
                          className='border-2 border-red-600 rounded-full px-4 py-1.5 font-medium text-white bg-red-600 hover:text-red-600 hover:bg-white transition duration-300'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(e, product._id);
                          }}
                        >
                          Add To Cart
                        </button>
                        
                        <button 
                          className={`p-2 rounded-full shadow-md transition-colors duration-300 ${
                            selectedProductIds.includes(product._id) 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const updatedSelectedProductIds = selectedProductIds.includes(product._id)
                              ? selectedProductIds.filter((id) => id !== product._id)
                              : [...selectedProductIds, product._id];
                            setSelectedProductIds(updatedSelectedProductIds);
                          }}
                        >
                          <FaHeartIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Arrow */}
              {products.length > 3 && (
                <button 
                  onClick={() => scroll('right', category)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-1/2"
                >
                  <FaAngleRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* No Products Message */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No products found for this vendor.
            </p>
          </div>
        )}
      </div>

      {/* About Us Section */}
      <div className="p-4 md:p-20 rounded-lg shadow-lg mt-10 mx-0 w-screen md:w-auto -mx-4 md:mx-0">
        <h2 className="text-3xl font-semibold mb-4">About Us</h2>
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <img 
            src={vendorDetails?.aboutFile ? 
              `data:${vendorDetails.aboutFile.contentType};base64,${vendorDetails.aboutFile.data}` : 
              "https://res.cloudinary.com/du8ogkcns/image/upload/v1738733668/DALL_E_2025-02-05_10.56.05_-_A_visually_engaging_About_Us_image_representing_a_company_specializing_in_event_management_services._The_image_features_a_collage_of_various_event_asp_xhqafc.webp"} 
            alt="Company" 
            className="w-full md:w-3/4 h-64 md:h-96 rounded-3xl object-cover" 
          />
          <p className="text-lg md:max-w-1/4 py-4 md:py-11 whitespace-pre-line">
            {vendorDetails?.aboutText ? (
              <>
                <span className="text-4xl font-bold capitalize">{vendorDetails.aboutText.charAt(0)}</span>
                {vendorDetails.aboutText.slice(1)}
              </>
            ) : (
              <>
                <span className="text-4xl font-bold">W</span>
                e are passionate about creating unforgettable experiences. Our team of dedicated professionals brings creativity, precision, and excellence to every event we handle. With years of experience in the industry, we understand that each event is unique and deserves personalized attention. From corporate gatherings to intimate celebrations, we ensure every detail is perfect. Our commitment to quality and customer satisfaction has made us a trusted name in event management.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mt-10 p-6 rounded-lg shadow-lg relative mx-0 sm:mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-center">What Our Customers Say</h2>
          <button 
            onClick={() => setShowTestimonialForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition-colors duration-300"
            title="Add Testimonial"
          >
            <FaPlus className="w-5 h-5" />
          </button>
        </div>

        {/* Testimonial Form Modal */}
        {showTestimonialForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
              {!userData ? (
                <div className="text-center py-4">
                  <div className="mb-2">Loading user data...</div>
                  <div className="text-sm text-gray-500">
                    Current state: {userData ? 'User data loaded' : 'No user data'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Email: {userEmail || 'No email'}
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowTestimonialForm(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                  <h3 className="text-xl font-bold mb-4">Add Your Testimonial</h3>
                  <div className="mb-2 text-sm text-gray-600">
                    Posting as: {userData.name || 'Anonymous'}
                  </div>
                  <form onSubmit={handleTestimonialSubmit}>
                    <div className="mb-4">
                      <textarea
                        value={newTestimonial}
                        onChange={(e) => setNewTestimonial(e.target.value)}
                        placeholder="Share your experience..."
                        className="w-full h-32 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                      Submit Testimonial
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* Testimonials Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {testimonials && testimonials.length > 0 ? (
            testimonials
              .slice(currentTestimonialIndex, currentTestimonialIndex + testimonialsPerPage)
              .map((testimonial, index) => (
                <div
                  key={testimonial._id || index}
                  className="relative p-3 rounded-lg shadow-lg text-white min-h-[100px] overflow-hidden transition-all duration-500"
                  style={{ 
                    backgroundImage: `url('${testimonialBackgrounds[index % testimonialBackgrounds.length]}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* Black overlay */}
                  <div className="absolute inset-0 bg-black opacity-60 rounded-lg"></div>
                  
                  <div className="relative z-10 flex">
                    <img 
                      src={testimonial.userProfile || "https://via.placeholder.com/50"} 
                      alt={`${testimonial.userName}'s profile`} 
                      className="w-10 h-10 rounded-full border-2 border-white mr-2 object-cover flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-semibold text-white">{testimonial.userName}</h3>
                      <p className="text-xs text-gray-200">
                        {new Date(testimonial.timestamp).toLocaleDateString()}
                      </p>
                      <p className="mt-1 px-3 text-s text-white leading-relaxed">{testimonial.text}</p>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-gray-500 col-span-2 text-center">
              No testimonials yet. Be the first to share your experience!
            </p>
          )}
          
          {/* Navigation dots */}
          {testimonials.length > testimonialsPerPage && (
            <div className="col-span-2 flex justify-center mt-1">
              {Array.from({ length: Math.ceil(testimonials.length / testimonialsPerPage) }).map((_, index) => (
                <button
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full mx-1 transition-all duration-300 ${
                    Math.floor(currentTestimonialIndex / testimonialsPerPage) === index
                      ? 'bg-blue-500 w-3'
                      : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentTestimonialIndex(index * testimonialsPerPage)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Portfolio Section */}
      <div className="mt-10 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg w-screen md:w-auto -mx-4 md:mx-0">
        <h2 className="text-2xl font-bold mb-4 text-center text-black dark:text-white">Our Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioEvents.map((event) => (
            <div 
              key={event.eventNumber} 
              className="transition-all duration-500 relative"
            >
              <h3 className="text-black dark:text-white text-lg font-medium mb-2">
                Event {event.eventNumber}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Location: {event.location} • {new Date(event.createdAt).toLocaleString()}
              </p>
              {expandedEvent === event.eventNumber && (
                <button
                  onClick={() => toggleEventExpansion(event.eventNumber)}
                  className="absolute -top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-50 transition-all duration-300 shadow-lg"
                >
                  <IoClose/>
                </button>
              )}
              <div 
                className={`relative transition-all duration-500 ease-in-out ${
                  expandedEvent === event.eventNumber 
                    ? 'h-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-4' 
                    : 'h-[300px] flex items-center mb-8 ml-8'
                }`}
              >
                {event.files.map((file, fileIndex) => (
                  <div 
                    key={fileIndex} 
                    className={`
                      ${expandedEvent === event.eventNumber 
                        ? 'relative aspect-square w-full cursor-pointer transform-none hover:scale-105 mb-4'
                        : 'absolute w-[250px] h-[250px] cursor-pointer'
                      }
                      bg-gray-50 dark:bg-gray-700 rounded-lg shadow-lg 
                      transition-all duration-500 ease-in-out
                      hover:z-10
                    `}
                    style={{
                      transform: expandedEvent === event.eventNumber 
                        ? 'none' 
                        : `rotate(${fileIndex * 10}deg)`,
                      zIndex: expandedEvent === event.eventNumber ? 0 : fileIndex,
                      transformOrigin: 'center 110%',
                      left: expandedEvent === event.eventNumber ? 'auto' : '20px'
                    }}
                    onClick={() => handleImageClick(event, file, fileIndex)}
                  >
                    <div className={`
                      w-full h-full overflow-hidden rounded-lg
                      transition-transform duration-500
                      ${expandedEvent === event.eventNumber ? 'scale-100' : 'scale-100'}
                    `}>
                      <img 
                        src={`data:${file.contentType};base64,${file.data}`}
                        alt={`Portfolio Event ${event.eventNumber}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for expanded image */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl w-full mx-4">
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute -top-10 right-0 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg text-xl"
            >
                <IoClose/>
            </button>
            <div className="relative">
              <img 
                src={expandedImage.src} 
                alt={expandedImage.alt}
                className="w-full h-auto rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => toggleLike(expandedImage.src, e)}
                className="absolute bottom-4 right-4 text-2xl transition-transform duration-300 hover:scale-110"
              >
                {likedImages.has(expandedImage.src) ? (
                  <FaHeart className="text-red-500" />
                ) : (
                  <FaRegHeart className="text-red-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Icon */}
      <div 
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 rounded-full p-4 cursor-pointer shadow-lg transition-all duration-300 hover:scale-110 z-[1000] group"
      >
        <FaWhatsapp className="text-white text-3xl" />
        
        {/* Tooltip */}
        <span className="absolute bottom-full right-0 mb-2 w-auto p-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Chat with {brandName || 'Vendor'} on WhatsApp
        </span>

        {/* Pulse Effect */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25"></span>
      </div>

    </div>
  );
};

// Add these styles to your global CSS file or style component
const styles = `
  /* Hide scrollbar for Chrome, Safari and Opera */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

// You can add this to your CSS file or use a styled-components approach
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default VendorPage;