import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SummaryApi from '../common'; // Ensure this is the correct path to your API
import AdminProductCard from '../components/AdminProductCard'; // Component to display individual product
import { FaAngleRight, FaAngleLeft, FaStar, FaStarHalf } from "react-icons/fa6"; // Import icons for navigation and star icons for ratings
import addToCart from '../helpers/addToCart'; // Import addToCart function
import Context from '../context'; // Import context to access fetchUserAddToCart
import displayINRCurrency from '../helpers/displayCurrency'; // Import displayINRCurrency function

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
            <div className='relative h-56 md:h-96 w-full bg-slate-200 rounded-xl overflow-hidden'>
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
            <p>No banners available.</p>
          )}
        </>
      )}
      
      {vendorEmail && (
        <p className="text-lg mb-4">Vendor Email: <a href={`mailto:${vendorEmail}`} className="text-blue-500">{vendorEmail}</a></p>
      )}
      
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
      <div className="mt-10 p-6 bg-gray-100 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Changed to grid layout for two columns */}
          {[
            {
              name: "John Doe",
              date: "January 1, 2023", // Added date
              image: "data:image/jpeg;base64,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",
              testimonial: "Amazing experience! Highly recommend this vendor!",
            },
            {
              name: "Jane Smith",
              date: "February 15, 2023", // Added date
              image: "data:image/jpeg;base64,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", // Replace with actual image path
              testimonial: "Great products and excellent service!",
            },
            // Additional testimonials can be added here
          ].map((testimonial, index) => (
            <div key={index} className="flex items-start p-4 bg-cover bg-center rounded-lg shadow-md" style={{ backgroundImage: `url('path/to/nature-image-${index + 1}.jpg')` }}> {/* Replace with actual nature image paths */}
              <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full mr-4" />
              <div>
                <h3 className="font-semibold">{testimonial.name}</h3>
                <p className="text-gray-500 text-sm">{testimonial.date}</p> {/* Moved date directly below the name */}
                <p className="text-gray-700">{testimonial.testimonial}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorPage;