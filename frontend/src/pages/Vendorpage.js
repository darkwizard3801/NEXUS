import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SummaryApi from '../common'; // Ensure this is the correct path to your API
import AdminProductCard from '../components/AdminProductCard'; // Component to display individual product
import { FaAngleRight, FaAngleLeft, FaStar, FaStarHalf, FaHeart } from "react-icons/fa6";
import { FaRegHeart  } from "react-icons/fa"; // Import icons for navigation, star icons, and heart icons
import addToCart from '../helpers/addToCart'; // Import addToCart function
import Context from '../context'; // Import context to access fetchUserAddToCart
import displayINRCurrency from '../helpers/displayCurrency'; // Import displayINRCurrency function
import { FaHeart as FaHeartIcon } from 'react-icons/fa'; // Import React icons for heart
import { AiOutlineMail } from 'react-icons/ai';

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

      // Set all products and filter them based on the vendor name
      setProducts(dataResponse?.data || []);
      const vendorProducts = dataResponse?.data?.filter(product => product.brandName === vendorName); // Assuming brandName is the vendor name
      setFilteredProducts(vendorProducts || []);

      // Set vendor email from the first filtered product
      if (vendorProducts.length > 0) {
        setVendorEmail(vendorProducts[0].user); // Assuming vendorEmail is a property in the product
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all banners from the database
  const fetchBanners = async () => {
    try {
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
      console.log("data",data);
      // Filter banners where the status is 'approved' and the vendor email matches
      const approvedBanners = data.banners.filter(banner => 
       banner.status === 'approved'  && banner.email === vendorEmail
      );
      setBanners(approvedBanners);
      console.log("filtered banners",approvedBanners); // Set the filtered approved banners
    } catch (error) {
      setError(error.message);
      console.error('Error loading banners:', error);
    } finally {
      setLoadingBanners(false);
    }
  };

  useEffect(() => {
    fetchAllProducts(); // Fetch products when the component mounts
    fetchBanners(); // Fetch banners when the component mounts
  }, [vendorName]); // Re-fetch if vendorName changes

  // Debugging log to check filtered products
  console.log('Filtered Products:', filteredProducts);

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

  useEffect(() => {
    let index = 0;
    const typeWriter = () => {
      if (index < fullTagline.length) {
        setTagline(prev => prev + fullTagline.charAt(index));
        index++;
        setTimeout(typeWriter, 100); // Adjust typing speed here
      }
    };
    typeWriter();
  }, []); // Run once on component mount

  const handleImageExpand = (image) => {
    setExpandedImage(image);
  };

  const handleCloseModal = () => {
    setExpandedImage(null);
  };

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className={`text-4xl ${currentFontStyle} mb-2 text-center text-gradient`}>
        Welcome to {vendorName}'s Store
      </h1>
      <h2 className="text-2xl font-light text-center text-gray-600">{tagline}</h2> {/* Tagline with typewriter effect */}
      
      {/* Moved Banner Section to the top */}
      {loadingBanners ? (
        <p>Loading banners...</p>
      ) : (
        <>
          {banners.length > 0 ? (
            <div className='relative h-56 py-12 md:h-96 w-full bg-slate-200 rounded-xl overflow-hidden'>
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
              <div className='relative h-full w-full overflow-hidden flex justify-center items-center'>
                {banners.map((banner, index) => (
                  <div
                    key={banner.id || index}
                    className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out
                      ${currentImage === index ? 'opacity-100' : 'opacity-0'}`}
                    style={{ transition: 'opacity 1s ease-in-out' }}
                  >
                    <img src={banner.image} alt={banner.description} className='w-full h-full object-cover' />
                  </div>
                ))}
              </div>

              {/* Dots container */}
              <div className='absolute bottom-2 flex justify-center w-full'>
                {renderDots()}
              </div>
            </div>
          ) : (
            <div className='relative h-56 md:h-96 w-full bg-slate-200 rounded-xl overflow-hidden'>
              <img src="default-banner.jpg" alt="Default Banner" className='w-full h-full object-cover' />
            </div>
          )}
        </>
      )}
      
      <div className="mt-8 rounded-3xl">
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => {
            const productId = product._id; // Get the product ID

            const currentImageIndex = product.productImage && product.productImage.length > 0 
              ? currentProductImages[productId] % product.productImage.length 
              : 0; // Default to 0 if images are not available

            return (
              <div 
                key={index} 
                className="border rounded-lg my-4 p-4 shadow-lg transition-transform transform hover:scale-105 cursor-pointer bg-white hover:shadow-xl"
                onClick={() => handleProductClick(productId)} // Add click handler
              >
                {product.productImage && product.productImage.length > 0 ? (
                  <img 
                    src={product.productImage[currentImageIndex]} 
                    alt={product.productName} 
                    className='w-full h-48 object-cover mb-2 rounded transition-transform duration-300 transform hover:scale-110' 
                    loading="lazy" // Optimize image loading
                  />
                ) : (
                  <p>No images available for this product.</p> // Fallback message
                )}
                <h2 className="text-xl font-semibold">{product.productName}</h2>
                <p className="text-gray-700">Price: {displayINRCurrency(product.price)}</p>
                
                {/* Add to Cart Button */}
                <button
                  className='border-2 border-red-600 rounded px-3 py-1 min-w-[120px] font-medium text-white bg-red-600 hover:text-red-600 hover:bg-white transition duration-300'
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click event from bubbling up to the card
                    handleAddToCart(e, productId); // Use productId here
                  }}
                >
                  Add To Cart
                </button>

                <div>
                  <button 
                    className={`absolute bottom-2 right-2 bg-transparent p-2 rounded-full shadow-md z-10 like-button transition-colors duration-300 ${selectedProductIds.includes(productId) ? 'bg-red-500' : 'bg-black'}`} 
                    onClick={(e) => {
                      e.stopPropagation();
                      const updatedSelectedProductIds = selectedProductIds.includes(productId)
                        ? selectedProductIds.filter((id) => id !== productId)
                        : [...selectedProductIds, productId];
                      setSelectedProductIds(updatedSelectedProductIds);
                    }}
                  >
                    {selectedProductIds.includes(productId) && (
                      <FaHeartIcon className="h-6 w-6 text-red-500" />
                    )}
                    {!selectedProductIds.includes(productId) && (
                      <FaHeartIcon className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p>No products found for this vendor.</p>
        )}
      </div>

      {/* About Us Section */}
      <div className=" p-20 rounded-lg shadow-lg mt-10">
        <h2 className="text-3xl font-semibold mb-4">About Us</h2>
        <div className="flex items-start">
          <img src="https://eventsmanagementkerala.com/wp-content/uploads/elementor/thumbs/image-blog-qxci15yoopuxkqtd5kaej3ilh2bh487t7zjqt9i10s.webp" alt="Company" className="w-3/4 h-96 rounded-3xl mr-4" /> {/* Increased width to 1/2 */}
          <p className="text-lg max-w-1/4 py-11">
  <span className="text-4xl font-bold">W</span>e are a leading vendor in the event management industry, dedicated to providing top-notch services and products that transform your events into extraordinary and unforgettable experiences. Our team, comprised of seasoned professionals and creative visionaries, is deeply passionate about crafting memories that last a lifetime for our clients. With years of expertise, a steadfast commitment to excellence, and a drive to innovate, we aim to exceed expectations by delivering impeccable service, flawless execution, and unique solutions tailored to your vision. From meticulously planning every intricate detail to offering a wide array of premium products and services, we take pride in ensuring that your events run seamlessly, leaving you free to focus on cherishing your special moments with family, friends, and loved ones, all without worry or stress.
</p>

        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mt-10 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: "John Doe",
              date: "January 1, 2023",
              testimonial: "Amazing experience! Highly recommend this vendor!",
              backgroundImage: "url('https://res.cloudinary.com/du8ogkcns/image/upload/v1737707121/images_3_bew0wk.jpg')", // Background image for the card
              profileImage: "path/to/profile-image-1.jpg" // Profile image for the card
            },
            {
              name: "Jane Smith",
              date: "February 15, 2023",
              testimonial: "The service was exceptional and the products were top-notch!",
              backgroundImage: "url('https://res.cloudinary.com/du8ogkcns/image/upload/v1737707121/images_2_yyvffo.jpg')",
              profileImage: "path/to/profile-image-2.jpg" // Profile image for the card
            },
            {
              name: "Alice Johnson",
              date: "March 10, 2023",
              testimonial: "I had a fantastic experience, will definitely use them again!",
              backgroundImage: "url('https://res.cloudinary.com/du8ogkcns/image/upload/v1737707121/download_5_zmwqki.jpg')",
              profileImage: "path/to/profile-image-3.jpg" // Profile image for the card
            },
            {
              name: "Alice Johnson",
              date: "March 10, 2023",
              testimonial: "I had a fantastic experience, will definitely use them again!",
              backgroundImage: "url('https://res.cloudinary.com/du8ogkcns/image/upload/v1737707121/download_4_xtbszf.jpg')",
              profileImage: "path/to/profile-image-4.jpg" // Profile image for the card
            },
            // Add more testimonials as needed
          ].map((testimonial, index) => (
            <div
              key={index}
              className="relative p-4 rounded-lg shadow-lg text-white"
              style={{ backgroundImage: testimonial.backgroundImage, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {/* Black overlay with 25% opacity */}
              <div className="absolute inset-0 bg-black opacity-65 rounded-lg"></div>
              
              <div className="relative z-10 flex">
                <img 
                  src={testimonial.profileImage} 
                  alt={`${testimonial.name}'s profile`} 
                  className="w-16 h-16 rounded-full border-2 border-white mr-4" 
                />
                <div>
                  <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                  <p className="text-sm">{testimonial.date}</p>
                  <p className="mt-2">{testimonial.testimonial}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-10 p-6 bg-gray-100 rounded-lg shadow-lg">
  <h2 className="text-2xl font-bold mb-4 text-center">Our Portfolio</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {[
      "https://res.cloudinary.com/du8ogkcns/image/upload/v1737705008/images_fh6ezn.jpg",
      "https://res.cloudinary.com/du8ogkcns/image/upload/v1737705008/download_3_xbvbcd.jpg",
      "https://res.cloudinary.com/du8ogkcns/image/upload/v1737705008/images_1_dmge98.jpg",
      "https://res.cloudinary.com/du8ogkcns/image/upload/v1737705008/download_2_q0vjgb.jpg",
      "https://res.cloudinary.com/du8ogkcns/image/upload/v1737705009/Different-Types-of-Events-in-2024-Which-is-Right-for-You_zrhfsx.jpg"
    ].map((image, index) => (
      <div key={index} className="relative rounded-lg overflow-hidden shadow-lg" onClick={() => handleImageExpand(image)}>
        <img src={image} alt={`Event ${index + 1}`} className="w-full h-full object-cover" />
        
        <button 
          className={`absolute bottom-2 right-2 bg-transparent p-2 rounded-full shadow-md z-10 like-button transition-colors duration-300 ${selectedProductIds.includes(image) ? 'bg-red-500' : 'bg-black'}`} 
          onClick={(e) => {
            e.stopPropagation();
            const updatedSelectedProductIds = selectedProductIds.includes(image)
              ? selectedProductIds.filter((id) => id !== image)
              : [...selectedProductIds, image];
            setSelectedProductIds(updatedSelectedProductIds);
          }}
        >
          {selectedProductIds.includes(image) && (
            <FaHeartIcon
              className="h-6 w-6 text-red-500"
              style={{ stroke: "black", strokeWidth: 1 }}
            />
          )}

          {!selectedProductIds.includes(image) && (
            <FaRegHeart  className="h-6 w-6 text-red-600" />
          )}
        </button>
        
        {/* Add click event to expand image and show other images */}
        {/* You can implement this functionality using a modal or a lightbox */}
      </div>
    ))}
  </div>
</div>

      {/* Modal for displaying expanded image */}
      {expandedImage && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="relative max-w-3xl w-full">
            <button onClick={handleCloseModal} className="absolute top-2 right-2 text-white text-2xl">&times;</button>
            <img src={expandedImage} alt="Expanded Image" className="w-full h-auto" />
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorPage;